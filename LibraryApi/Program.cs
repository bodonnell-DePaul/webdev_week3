using System.ComponentModel.DataAnnotations;
using System.Text.Json;
using System.Text.Json.Serialization;

// Create the ASP.NET Core app builder (service registration starts here).
var builder = WebApplication.CreateBuilder(args);

// Serialize enum values as strings (e.g., "Available") instead of numeric values.
// This keeps API payloads readable and aligns with the frontend's expected format.
builder.Services.ConfigureHttpJsonOptions(options =>
{
	options.SerializerOptions.Converters.Add(new JsonStringEnumConverter());
});

// Register OpenAPI metadata generation and Swagger UI support.
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Allow frontend dev servers to call this API from a different origin.
builder.Services.AddCors(options =>
{
	options.AddPolicy("Frontend", policy =>
	{
		policy
			.WithOrigins("http://localhost:5173", "http://localhost:4173", "http://127.0.0.1:5173", "http://127.0.0.1:4173")
			.AllowAnyHeader()
			.AllowAnyMethod();
	});
});

// Build the app pipeline from configured services.
var app = builder.Build();

// Enable the CORS policy before endpoint handling.
app.UseCors("Frontend");

// Expose OpenAPI JSON and interactive Swagger UI.
app.UseSwagger();
app.UseSwaggerUI();

// Load seeded inventory from disk so startup data is easy to maintain externally.
var seedPath = Path.Combine(app.Environment.ContentRootPath, "Data", "materials.seed.json");
var materials = LoadSeedMaterials(seedPath);

// Track the next generated id for newly donated materials.
var nextId = (materials.Any() ? materials.Max(m => m.Id) : 0) + 1;

static List<Material> LoadSeedMaterials(string seedPath)
{
	// Fail fast if the seed file is missing so startup issues are obvious.
	if (!File.Exists(seedPath))
	{
		throw new FileNotFoundException($"Seed file not found: {seedPath}");
	}

	// Read seed JSON in a case-insensitive way to make the file less brittle.
	var serializerOptions = new JsonSerializerOptions
	{
		PropertyNameCaseInsensitive = true
	};
	serializerOptions.Converters.Add(new JsonStringEnumConverter());

	var seedMaterials = JsonSerializer.Deserialize<List<SeedMaterial>>(File.ReadAllText(seedPath), serializerOptions) ?? [];

	// Normalize incoming seed rows and convert them into runtime Material objects.
	return seedMaterials
		.Where(item => item.Id > 0 && !string.IsNullOrWhiteSpace(item.Title) && !string.IsNullOrWhiteSpace(item.MaterialType))
		.Select(item => new Material(
			item.Id,
			item.Title.Trim(),
			item.MaterialType.Trim(),
			string.IsNullOrWhiteSpace(item.DonorName) ? "Unknown" : item.DonorName.Trim(),
			item.State,
			string.IsNullOrWhiteSpace(item.CheckedOutBy) ? null : item.CheckedOutBy.Trim()))
		.OrderBy(item => item.Id)
		.ToList();
}

// GET /api/materials
// Returns the entire inventory ordered by id.
app.MapGet("/api/materials", () => Results.Ok(materials.OrderBy(m => m.Id)));

// GET /api/materials/{id}
// Returns one material or 404 if it does not exist.
app.MapGet("/api/materials/{id:int}", (int id) =>
{
	var material = materials.FirstOrDefault(m => m.Id == id);
	return material is null ? Results.NotFound() : Results.Ok(material);
});

// POST /api/materials/donate
// Adds a new material to the in-memory collection.
app.MapPost("/api/materials/donate", (DonateMaterialRequest request) =>
{
	// Validate required fields before creating the record.
	if (string.IsNullOrWhiteSpace(request.Title) || string.IsNullOrWhiteSpace(request.MaterialType))
	{
		return Results.ValidationProblem(new Dictionary<string, string[]>
		{
			[nameof(request.Title)] = ["Title is required."],
			[nameof(request.MaterialType)] = ["Material type is required."]
		});
	}

	// Create a new available material and assign a unique id.
	var material = new Material(
		nextId++,
		request.Title.Trim(),
		request.MaterialType.Trim(),
		string.IsNullOrWhiteSpace(request.DonorName) ? "Anonymous" : request.DonorName.Trim(),
		MaterialState.Available,
		null);

	// Persist this new item in memory for the lifetime of the running API process.
	materials.Add(material);

	// Return 201 Created with the location of the new resource.
	return Results.Created($"/api/materials/{material.Id}", material);
});

// POST /api/materials/{id}/checkout
// Moves a material from Available to CheckedOut when valid.
app.MapPost("/api/materials/{id:int}/checkout", (int id, CheckoutMaterialRequest request) =>
{
	var material = materials.FirstOrDefault(m => m.Id == id);
	if (material is null)
	{
		return Results.NotFound();
	}

	// Lost items cannot be checked out.
	if (material.State == MaterialState.Lost)
	{
		return Results.Conflict(new { message = "Lost material cannot be checked out." });
	}

	// Prevent duplicate checkout operations.
	if (material.State == MaterialState.CheckedOut)
	{
		return Results.Conflict(new { message = "Material is already checked out." });
	}

	// Borrower name is required to complete checkout.
	if (string.IsNullOrWhiteSpace(request.BorrowerName))
	{
		return Results.ValidationProblem(new Dictionary<string, string[]>
		{
			[nameof(request.BorrowerName)] = ["Borrower name is required."]
		});
	}

	// Apply state transition and borrower metadata.
	material.State = MaterialState.CheckedOut;
	material.CheckedOutBy = request.BorrowerName.Trim();

	return Results.Ok(material);
});

// POST /api/materials/{id}/return
// Moves a checked-out material back to available.
app.MapPost("/api/materials/{id:int}/return", (int id) =>
{
	var material = materials.FirstOrDefault(m => m.Id == id);
	if (material is null)
	{
		return Results.NotFound();
	}

	// Lost items cannot be returned because they are no longer in circulation.
	if (material.State == MaterialState.Lost)
	{
		return Results.Conflict(new { message = "Lost material cannot be returned." });
	}

	// If already available, a return operation is invalid.
	if (material.State == MaterialState.Available)
	{
		return Results.Conflict(new { message = "Material is already available." });
	}

	// Apply state transition and clear borrower assignment.
	material.State = MaterialState.Available;
	material.CheckedOutBy = null;

	return Results.Ok(material);
});

// POST /api/materials/{id}/lost
// Marks a material as lost and removes any borrower association.
app.MapPost("/api/materials/{id:int}/lost", (int id) =>
{
	var material = materials.FirstOrDefault(m => m.Id == id);
	if (material is null)
	{
		return Results.NotFound();
	}

	// Prevent repeat lost declarations.
	if (material.State == MaterialState.Lost)
	{
		return Results.Conflict(new { message = "Material is already marked as lost." });
	}

	// Apply lost-state transition.
	material.State = MaterialState.Lost;
	material.CheckedOutBy = null;

	return Results.Ok(material);
});

// Start the HTTP server and begin processing requests.
app.Run();

// Domain model representing one library material in circulation.
public class Material
{
	public Material(int id, string title, string materialType, string donorName, MaterialState state, string? checkedOutBy)
	{
		Id = id;
		Title = title;
		MaterialType = materialType;
		DonorName = donorName;
		State = state;
		CheckedOutBy = checkedOutBy;
	}

	public int Id { get; init; }
	public string Title { get; init; }
	public string MaterialType { get; init; }
	public string DonorName { get; init; }
	public MaterialState State { get; set; }
	public string? CheckedOutBy { get; set; }
}

// Lifecycle state for each material.
public enum MaterialState
{
	Available,
	CheckedOut,
	Lost
}

// Seed-file DTO used only when reading JSON at startup.
public class SeedMaterial
{
	public int Id { get; init; }
	public string Title { get; init; } = string.Empty;
	public string MaterialType { get; init; } = string.Empty;
	public string DonorName { get; init; } = string.Empty;
	public MaterialState State { get; init; }
	public string? CheckedOutBy { get; init; }
}

// Request contract for donated materials.
public record DonateMaterialRequest(
	[Required] string Title,
	[Required] string MaterialType,
	string? DonorName
);

// Request contract for checkout operations.
public record CheckoutMaterialRequest([Required] string BorrowerName);
