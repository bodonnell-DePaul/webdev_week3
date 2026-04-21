using System.ComponentModel.DataAnnotations;
using System.Text.Json;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

builder.Services.ConfigureHttpJsonOptions(options =>
{
	options.SerializerOptions.Converters.Add(new JsonStringEnumConverter());
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

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

var app = builder.Build();

app.UseCors("Frontend");
app.UseSwagger();
app.UseSwaggerUI();

var seedPath = Path.Combine(app.Environment.ContentRootPath, "Data", "materials.seed.json");
var materials = LoadSeedMaterials(seedPath);
var nextId = (materials.Any() ? materials.Max(m => m.Id) : 0) + 1;

static List<Material> LoadSeedMaterials(string seedPath)
{
	if (!File.Exists(seedPath))
	{
		throw new FileNotFoundException($"Seed file not found: {seedPath}");
	}

	var serializerOptions = new JsonSerializerOptions
	{
		PropertyNameCaseInsensitive = true
	};
	serializerOptions.Converters.Add(new JsonStringEnumConverter());

	var seedMaterials = JsonSerializer.Deserialize<List<SeedMaterial>>(File.ReadAllText(seedPath), serializerOptions) ?? [];

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

app.MapGet("/api/materials", () => Results.Ok(materials.OrderBy(m => m.Id)));

app.MapGet("/api/materials/{id:int}", (int id) =>
{
	var material = materials.FirstOrDefault(m => m.Id == id);
	return material is null ? Results.NotFound() : Results.Ok(material);
});

app.MapPost("/api/materials/donate", (DonateMaterialRequest request) =>
{
	if (string.IsNullOrWhiteSpace(request.Title) || string.IsNullOrWhiteSpace(request.MaterialType))
	{
		return Results.ValidationProblem(new Dictionary<string, string[]>
		{
			[nameof(request.Title)] = ["Title is required."],
			[nameof(request.MaterialType)] = ["Material type is required."]
		});
	}

	var material = new Material(
		nextId++,
		request.Title.Trim(),
		request.MaterialType.Trim(),
		string.IsNullOrWhiteSpace(request.DonorName) ? "Anonymous" : request.DonorName.Trim(),
		MaterialState.Available,
		null);

	materials.Add(material);

	return Results.Created($"/api/materials/{material.Id}", material);
});

app.MapPost("/api/materials/{id:int}/checkout", (int id, CheckoutMaterialRequest request) =>
{
	var material = materials.FirstOrDefault(m => m.Id == id);
	if (material is null)
	{
		return Results.NotFound();
	}

	if (material.State == MaterialState.Lost)
	{
		return Results.Conflict(new { message = "Lost material cannot be checked out." });
	}

	if (material.State == MaterialState.CheckedOut)
	{
		return Results.Conflict(new { message = "Material is already checked out." });
	}

	if (string.IsNullOrWhiteSpace(request.BorrowerName))
	{
		return Results.ValidationProblem(new Dictionary<string, string[]>
		{
			[nameof(request.BorrowerName)] = ["Borrower name is required."]
		});
	}

	material.State = MaterialState.CheckedOut;
	material.CheckedOutBy = request.BorrowerName.Trim();

	return Results.Ok(material);
});

app.MapPost("/api/materials/{id:int}/return", (int id) =>
{
	var material = materials.FirstOrDefault(m => m.Id == id);
	if (material is null)
	{
		return Results.NotFound();
	}

	if (material.State == MaterialState.Lost)
	{
		return Results.Conflict(new { message = "Lost material cannot be returned." });
	}

	if (material.State == MaterialState.Available)
	{
		return Results.Conflict(new { message = "Material is already available." });
	}

	material.State = MaterialState.Available;
	material.CheckedOutBy = null;

	return Results.Ok(material);
});

app.MapPost("/api/materials/{id:int}/lost", (int id) =>
{
	var material = materials.FirstOrDefault(m => m.Id == id);
	if (material is null)
	{
		return Results.NotFound();
	}

	if (material.State == MaterialState.Lost)
	{
		return Results.Conflict(new { message = "Material is already marked as lost." });
	}

	material.State = MaterialState.Lost;
	material.CheckedOutBy = null;

	return Results.Ok(material);
});

app.Run();

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

public enum MaterialState
{
	Available,
	CheckedOut,
	Lost
}

public class SeedMaterial
{
	public int Id { get; init; }
	public string Title { get; init; } = string.Empty;
	public string MaterialType { get; init; } = string.Empty;
	public string DonorName { get; init; } = string.Empty;
	public MaterialState State { get; init; }
	public string? CheckedOutBy { get; init; }
}

public record DonateMaterialRequest(
	[Required] string Title,
	[Required] string MaterialType,
	string? DonorName
);

public record CheckoutMaterialRequest([Required] string BorrowerName);
