# Week 3: RESTful APIs & Back-End Development with ASP.NET Core

**CSC 436 – Web Applications | DePaul University**

**Topics:** REST fundamentals, how the web works, ASP.NET Core, AI-assisted API development, middleware, CORS, Swagger, React integration

---

## 1 — Opening & Recap

- Welcome back. Quick check-in: "How did the Week 2 assignment go? Any React surprises?"
- Recap Week 2: component model, JSX, props/state, `useEffect`.
- Frame tonight's arc: **"We've built the front of the house; tonight we build the kitchen."**
- Explain the full-stack mental model — browser ↔ HTTP ↔ server ↔ database.
- Tonight we'll use ASP.NET Core for the back end — they already know C#, so the language is familiar; we're learning a new *context* for it.

### Discussion

> 💬 **Ask:** "When you open a website, what actually happens between your browser and the server? Walk me through it." Let 2–3 people contribute, then fill gaps. (We'll come back to this in depth in Section 3.)

---

## 2 — REST API Fundamentals

### Key Concepts to Emphasize

1. **Resources, not actions** — REST models *nouns* (`/books`, `/users`), not *verbs* (`/getBooks`).
2. **HTTP methods map to CRUD**:
   | Method | CRUD | Typical Use | Idempotent? |
   |--------|------|-------------|-------------|
   | GET | Read | Fetch resource(s) | Yes |
   | POST | Create | Submit new resource | No |
   | PUT | Update (full) | Replace resource | Yes |
   | PATCH | Update (partial) | Modify fields | Yes* |
   | DELETE | Delete | Remove resource | Yes |
3. **Status codes** — group by first digit:
   - `2xx` — success (200 OK, 201 Created, 204 No Content)
   - `3xx` — redirection (301, 304)
   - `4xx` — client error (400 Bad Request, 401, 403, 404, 422)
   - `5xx` — server error (500 Internal Server Error)
4. **URL conventions**:
   - Plural nouns: `/api/books` not `/api/book`
   - Hierarchical: `/api/authors/5/books`
   - Query params for filtering: `/api/books?genre=fiction&page=2`
   - No trailing slashes, lowercase, hyphens over underscores

- REST is an **architectural style**, not a protocol. It rides on HTTP.
- Stress **statelessness**: every request carries all info the server needs. No "session memory" between requests.
- Show a real API in the browser: open `https://jsonplaceholder.typicode.com/posts/1` — "See? It's just JSON."
- Contrast REST with older approaches (SOAP/XML) — they don't need to know SOAP, just appreciate the simplicity.
- **This section is framework-agnostic on purpose.** REST is REST whether you implement it in C#, Python, JavaScript, or Go. The concepts outlast any framework.

> ⚠️ **Common misconception:** A common misconception is that people think REST requires JSON. Clarify that JSON is the *convention*, not a requirement. REST can return XML, HTML, or plain text.

### Discussion

> 💬 **Quick poll (show of hands):** "If I want to update just the price of a book, which HTTP method should I use?" (Answer: PATCH — discuss why PUT would also work but means full replacement.)

> 💬 **Ask:** "What status code should the server return when you try to delete a book that doesn't exist?" Let them debate — 404 vs 204 are both defensible. Use this to show that API design involves judgment calls.

### Common Questions

| Question | How to Answer |
|----------|---------------|
| "What's the difference between PUT and PATCH?" | PUT replaces the *entire* resource; PATCH modifies *specific fields*. Analogy: PUT = tear down the house and rebuild; PATCH = repaint one room. |
| "Why 201 instead of 200 for creation?" | Semantic precision. 201 tells the client something new exists, and the `Location` header points to it. |
| "Do I have to use these exact codes?" | No enforcement, but violating conventions confuses consumers of your API. Treat status codes like a contract. |

---

## 3 — How the Web Actually Works — Concepts Code Won't Teach You

### 3.1 — The Journey of an HTTP Request

Walk through each step:

1. **You type `https://api.example.com/books` in the browser.**
2. **DNS Resolution** — The browser asks: "What IP address is `api.example.com`?" Think of DNS as the internet's phone book. Your machine checks its local cache first, then asks a DNS resolver (usually your ISP or something like `8.8.8.8`), which walks the hierarchy: root servers → `.com` TLD → `example.com`'s authoritative nameserver → returns an IP like `93.184.216.34`.
3. **TCP Connection** — The browser opens a connection to that IP address on port 443 (HTTPS). This is a three-way handshake: SYN → SYN-ACK → ACK. Think of it as a phone ringing, being picked up, and both parties saying "hello."
4. **TLS Handshake** (for HTTPS) — Before any data flows, client and server negotiate encryption. The server proves its identity with a certificate. After this, everything is encrypted.
5. **HTTP Request** — The browser sends the actual request: `GET /books HTTP/1.1` with headers (Host, Accept, User-Agent, etc.).
6. **Server Processing** — The web server receives the request, runs your application code, and builds a response.
7. **HTTP Response** — The server sends back: status line (`HTTP/1.1 200 OK`), headers (`Content-Type: application/json`), and a body (the JSON data).
8. **Browser Renders** — The browser reads the response and displays the result.

> 💡 **Analogy:** "Sending an HTTP request is like mailing a letter. DNS is looking up the address. TCP is confirming the postal service can deliver. TLS is sealing the envelope. The HTTP request is the letter inside."

### 3.2 — What a Web Server Actually Does

- A web server is a program that **listens on a network port** for incoming HTTP requests and **sends back HTTP responses**. That's it. Everything else is details.
- It's an infinite loop: wait for connection → read request → do something → send response → repeat.
- The "do something" is where the interesting work happens — that's your application code.

### 3.3 — Ports: Why "localhost:5000" Works

- An IP address gets you to the right *machine*. A **port** gets you to the right *program* on that machine.
- Analogy: "The IP address is the building's street address. The port number is the apartment number."
- Well-known ports: 80 (HTTP), 443 (HTTPS), 5432 (PostgreSQL), 3306 (MySQL).
- `localhost` = `127.0.0.1` = "this machine." When you run `dotnet run`, your server binds to a port on localhost — it's only reachable from your own computer.
- Why port numbers matter in development: your React dev server runs on one port (e.g., 5173), your API runs on another (e.g., 5000). **Same machine, different ports, different origins.** (We'll see why this matters when we talk about CORS.)

### 3.4 — Static vs. Dynamic Content

- **Static content** = files served as-is. HTML, CSS, JavaScript, images. The server just reads a file from disk and sends it. No code executes per request.
- **Dynamic content** = the server runs code to *build* the response. Your API endpoint that queries a database and returns JSON — that's dynamic.
- Your React app in production is static content (it's just JS/HTML/CSS files). Your ASP.NET API is dynamic content.
- This distinction matters for performance, caching, and choosing the right hosting.

### 3.5 — Kestrel: The .NET Web Server

- **Kestrel** is the web server built into ASP.NET Core. When you run `dotnet run`, Kestrel is what listens on that port.
- It's cross-platform (Windows, Linux, macOS) and very fast — it consistently ranks among the top-performing web servers in benchmarks.
- In development, Kestrel is all you need. It handles HTTP directly.
- Analogy: "Kestrel is the engine of your car. It does the real work."

### 3.6 — Reverse Proxies: The Production Reality

- In production, you typically don't expose Kestrel directly to the internet. You put a **reverse proxy** in front of it.
- A reverse proxy sits between the client and your app server. It handles things like: SSL termination, load balancing, request buffering, static file serving, URL rewriting.
- Common reverse proxies: **IIS** (Windows), **nginx** (Linux), **Azure App Service** (cloud).
- Analogy: "If Kestrel is the engine, the reverse proxy is the car's body — it handles the road, the weather, and the passengers so the engine can focus on running."
- You don't need to set this up today, but understand the architecture:

```
Internet → [Reverse Proxy (IIS/nginx)] → [Kestrel] → [Your ASP.NET App]
```

### 3.7 — HTTPS/TLS in 60 Seconds

- **HTTPS = HTTP + TLS encryption.** The data is the same; it's just encrypted in transit.
- **Why it matters:** Without HTTPS, anyone on the network (coffee shop Wi-Fi, ISP, etc.) can read every request and response in plain text — passwords, API keys, user data, everything.
- **Certificates:** A TLS certificate proves "I am really `example.com`." Browsers trust certificates issued by Certificate Authorities (CAs). In development, .NET creates a self-signed dev certificate (`dotnet dev-certs https --trust`).
- **The padlock icon** in the browser = HTTPS is active and the certificate is valid.
- "Every production site should use HTTPS. Full stop. Let's Encrypt makes it free."

### Discussion

> 💬 **Ask:** "When you type `localhost:5000` in your browser, DNS isn't involved. Why not?" (Answer: `localhost` is a special name that resolves locally — your OS knows it maps to `127.0.0.1` without asking any DNS server.)

> 💬 **Ask:** "If Kestrel is fast enough to handle requests on its own, why bother with a reverse proxy in production?" (Let them speculate — then cover: SSL termination, load balancing, static files, security hardening.)

---

## 4 — ASP.NET Core — Getting Started

### Key Concepts

- **ASP.NET Core** = the cross-platform, open-source web framework for .NET. It's not the old ASP.NET from the 2000s — it's a ground-up rewrite.
- **Minimal APIs** vs **Controllers** — two styles for building APIs in .NET. We'll start with Minimal APIs because they're concise and map clearly to the REST concepts we just covered.
- **Program.cs** = the entry point. Everything starts here.

- You already know C#. Frame this as: "You know the language; now you're learning a new *context* for it — web servers instead of console apps."
- ASP.NET Core uses a **builder pattern**: you configure services, then build the app, then configure the HTTP pipeline, then run.
- Show the mental model:

```
var builder = WebApplication.CreateBuilder(args);   // 1. Configure services
// ... add services here ...
var app = builder.Build();                          // 2. Build the app
// ... configure middleware pipeline here ...
app.Run();                                          // 3. Start listening
```

### Hello World ASP.NET Core API

```bash
# Create a new Web API project
dotnet new webapi -n BookstoreApi --no-https
cd BookstoreApi
```

Open `Program.cs` — show what the template gives you. Then simplify to the essentials:

```csharp
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.MapGet("/api/hello", () => Results.Ok(new { message = "Hello from ASP.NET Core!" }));

app.Run();
```

```bash
dotnet run
# Open browser: http://localhost:5000/api/hello
```

**What to show:**
1. The JSON response in the browser.
2. Open DevTools → Network tab → show headers, status code 200, content-type.
3. Stop the server (Ctrl+C), change the message, `dotnet run` again — show the feedback loop.

> 💡 **Tip:** Mention `dotnet watch run` for auto-restart on file changes — the .NET equivalent of hot reload.

### Minimal APIs vs Controllers — Brief Comparison

- **Minimal APIs** (what we just saw): routes defined inline in `Program.cs`. Great for small APIs. Less ceremony.
- **Controllers**: routes defined in classes with attributes (`[HttpGet]`, `[HttpPost]`). Better for large APIs with many endpoints. More structure.
- "AI tools can generate either style. For this course, we'll use Minimal APIs because they make the concepts clearer, but controllers are what you'll see in most production codebases."

### Discussion

> 💬 **Ask:** "What does `Results.Ok(...)` remind you of from our REST discussion?" (Answer: It maps to status code 200. ASP.NET has `Results.Created()`, `Results.NotFound()`, `Results.NoContent()` — each maps to a status code.)

### Common Questions

| Question | How to Answer |
|----------|---------------|
| "Do I need Visual Studio?" | No — VS Code with the C# Dev Kit extension works great. Or use the `dotnet` CLI directly. Visual Studio is also fine if you prefer it. |
| "What about the `Controllers` folder and `WeatherForecast`?" | The default template includes a sample controller. We'll strip that away and start clean. |
| "Is this like Express?" | Same concept, different ecosystem. Express has `app.get()`, ASP.NET has `app.MapGet()`. Express uses middleware with `app.use()`, ASP.NET does too. The mental model transfers. |

---

## 5 — AI-Assisted API Development

### Key Concepts

1. **AI as a coding partner**, not a replacement — you must understand what it generates.
2. **Prompt engineering for APIs** — specificity matters.
3. **Reviewing AI output** — what to check, what to question.

- Frame AI tools (GitHub Copilot, ChatGPT, Claude) as "a junior developer who is fast but sometimes wrong."
- The value of AI increases when *you* know the fundamentals — that's why we taught REST and web concepts first.
- **Garbage in, garbage out**: vague prompts → vague code.

### Prompting Strategies — Show Examples

**❌ Bad prompt:**
> "Make me an API"

**✅ Good prompt:**
> "Create an ASP.NET Core Minimal API in Program.cs for a bookstore. Include CRUD endpoints for a `books` resource at `/api/books`. Each book has: id (int, auto-generated), title (string, required), author (string, required), price (decimal), isbn (string). Use an in-memory list as the data store. Include proper HTTP status codes (201 for creation, 404 when not found, 204 for deletion). Add input validation for required fields. Use .NET 8."

Walk through *why* the good prompt works:
- Specifies framework and style (ASP.NET Core Minimal API)
- Names the resource and fields with types
- States data storage approach
- Defines expected status codes
- Requests validation
- Specifies the .NET version

### Reviewing AI Output — Checklist

Write this on the board or show as a slide:

```
✅ AI Output Review Checklist:
  □ Does it handle errors? (What if the book doesn't exist?)
  □ Does it validate input? (What if title is missing?)
  □ Are status codes correct? (201 for POST, not 200?)
  □ Is it secure? (No SQL injection, no exposed secrets)
  □ Does it follow REST conventions we just learned?
  □ Can I explain every line to someone else?
  □ Did it add unnecessary NuGet packages?
```

> ⚠️ **Important:** "If you can't explain what the AI generated, you don't own that code. On the midterm, *you* have to write and debug it."

### Discussion

> 💬 **Think-pair-share (2 min):** "Write a prompt asking AI to add a `search` feature to the bookstore API. What details would you include?" Have 2–3 pairs share. Critique the prompts together.

### Common Questions

| Question | How to Answer |
|----------|---------------|
| "Can I use AI on assignments?" | Yes — this course *encourages* it. But you must understand and be able to explain your code. Cite your AI tool in comments. |
| "Which AI tool is best?" | They're all useful. GitHub Copilot integrates into your editor. ChatGPT/Claude are great for explaining concepts and generating boilerplate. Use what works for you. |
| "What if the AI gives me wrong code?" | That's expected! Part of the skill is *recognizing* and *fixing* AI mistakes. We'll practice this tonight. |

---

## 6 — Middleware & the ASP.NET Request Pipeline

### Key Concepts

1. **Middleware** = components that form a pipeline to handle HTTP requests and responses.
2. They execute **in order** — like an assembly line. Each piece does one job.
3. Each middleware can: inspect/modify the request, inspect/modify the response, call the next middleware, or short-circuit the pipeline.

- Draw the pipeline on the board:

```
Request → [Logging] → [Auth] → [CORS] → [Routing] → [Endpoint] → Response
             ↓          ↓        ↓          ↓            ↓
           next()     next()   next()     next()     produce response
```

- Analogy: "Middleware is like airport security checkpoints. Each station does one thing, then passes you along — or stops you."
- **Order matters.** If you put authentication *after* routing, unauthenticated requests can reach your endpoints. If you put CORS middleware in the wrong spot, your browser requests will fail.
- In ASP.NET Core, middleware is added in `Program.cs` using `app.Use...()` methods.

### The Pipeline in Practice

Show this conceptual `Program.cs` — emphasize the **order**:

```csharp
var app = builder.Build();

// Middleware pipeline — ORDER MATTERS
app.UseHttpsRedirection();  // Redirect HTTP → HTTPS
app.UseCors("AllowReactApp"); // Handle CORS (must be before auth)
app.UseAuthentication();     // Who are you?
app.UseAuthorization();      // Are you allowed?

app.MapGet("/api/books", () => { /* ... */ }); // Endpoints go last

app.Run();
```

### Custom Middleware

Show a brief example — this is conceptual, not something to type out in full:

```csharp
// Custom logging middleware
app.Use(async (context, next) =>
{
    var start = DateTime.UtcNow;
    Console.WriteLine($"→ {context.Request.Method} {context.Request.Path}");

    await next(); // Call the next middleware

    var duration = DateTime.UtcNow - start;
    Console.WriteLine($"← {context.Response.StatusCode} ({duration.TotalMilliseconds}ms)");
});
```

**What to emphasize:**
1. `await next()` is critical — without it, the pipeline stops here.
2. Code *before* `next()` runs on the way in. Code *after* `next()` runs on the way out.
3. This is the same concept as middleware in any framework. The syntax differs; the idea is identical.

### Discussion

> 💬 **Ask:** "What happens if I put my logging middleware *after* my `MapGet` endpoints?" (Answer: The logging middleware would never run for those routes — the endpoint handles the request and doesn't call a "next" middleware after it.)

> 💬 **Ask:** "If I wanted to block all requests from a certain IP address, where in the pipeline would I put that middleware?" (Answer: Very early — before routing, before auth, before everything.)

### Common Questions

| Question | How to Answer |
|----------|---------------|
| "What's `next()` doing?" | It calls the next middleware in the pipeline. If you don't call it, the request stops here. That's how auth middleware rejects requests — it sends a 401 and never calls `next()`. |
| "Is this like Express middleware?" | Identical concept. Express has `app.use((req, res, next) => ...)`. ASP.NET has `app.Use(async (context, next) => ...)`. Same pattern, different language. |
| "How many middleware can I have?" | As many as you need. Real-world ASP.NET apps often have 10+ middleware components in the pipeline. |

---

## 7 — CORS Deep Dive — Why Your API Works in Postman But Not the Browser

### 7.1 — The Same-Origin Policy

- The **Same-Origin Policy** is a security rule built into every web browser. It says: "JavaScript running on page A can only make HTTP requests to the *same origin* that served page A."
- **What is an "origin"?** It's the combination of three things: **scheme + host + port**.
  - `http://localhost:5173` and `http://localhost:5000` are **different origins** (different ports).
  - `http://example.com` and `https://example.com` are **different origins** (different schemes).
  - `https://api.example.com` and `https://www.example.com` are **different origins** (different hosts).
- **Why?** Without this policy, a malicious website could use your logged-in browser session to make requests to your bank's API. The Same-Origin Policy prevents that.

> 💡 **Analogy:** "Imagine every browser tab is a separate apartment. The Same-Origin Policy says you can only make phone calls to people in your own apartment building. CORS is the system for getting permission to call other buildings."

### 7.2 — What CORS Actually Is

- **CORS** (Cross-Origin Resource Sharing) is a mechanism that lets servers say: "I'm okay with requests from these other origins."
- It's implemented via **HTTP headers**. The server adds headers to its response telling the browser: "Yes, this origin is allowed to call me."
- Key headers:
  - `Access-Control-Allow-Origin`: which origins can call this API (e.g., `http://localhost:5173` or `*`)
  - `Access-Control-Allow-Methods`: which HTTP methods are allowed (GET, POST, PUT, etc.)
  - `Access-Control-Allow-Headers`: which request headers are allowed (Content-Type, Authorization, etc.)

### 7.3 — Simple Requests vs. Preflight Requests

- **Simple requests**: GET or POST with standard headers → browser sends the request directly and checks the `Access-Control-Allow-Origin` header in the response.
- **Preflight requests**: Anything more complex (PUT, DELETE, custom headers, `Content-Type: application/json`) → browser sends an **OPTIONS request first** to ask permission.

```
Browser                                 Server
  |                                       |
  |--- OPTIONS /api/books ------------>   |   ← "Can I send a PUT with JSON?"
  |                                       |
  |<-- 200 OK -------------------------   |   ← "Yes, here are the allowed methods/headers"
  |    Access-Control-Allow-Origin: *     |
  |    Access-Control-Allow-Methods: PUT  |
  |                                       |
  |--- PUT /api/books/1 ------------->    |   ← Actual request (only sent if preflight succeeds)
  |                                       |
  |<-- 200 OK -------------------------   |   ← Actual response
```

- "The preflight is the browser asking for permission. If the server says no (or doesn't respond with the right headers), the browser **blocks the real request** and you see a CORS error in the console."

### 7.4 — Why Postman Doesn't Have CORS Errors

- This is a very common question. The answer is simple: **CORS is enforced by browsers, not servers.**
- Postman, curl, Thunder Client, and server-to-server calls don't enforce CORS because they're not browsers. There's no Same-Origin Policy to enforce.
- The server *always* processes the request regardless of CORS. CORS headers tell the *browser* whether to let JavaScript see the response.

### 7.5 — Configuring CORS in ASP.NET Core

```csharp
// In Program.cs — configure CORS as a service
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:5173") // Your React dev server
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// ... build the app ...

// Add CORS middleware to the pipeline (ORDER MATTERS — before auth, before endpoints)
app.UseCors("AllowReactApp");
```

### 7.6 — Common CORS Mistakes

Walk through these — you *will* hit these:

| Mistake | What Happens | Fix |
|---------|-------------|-----|
| Forgetting to add `app.UseCors()` middleware | You configured the policy but never activated it — CORS headers are never sent | Add `app.UseCors("PolicyName")` to the pipeline |
| Putting `UseCors()` in the wrong order | CORS middleware must run before authentication/authorization and before endpoints | Move it early in the pipeline |
| Using `*` wildcard in production | Allows any website to call your API — security risk | Whitelist specific origins |
| Forgetting `AllowAnyHeader()` | Preflight rejects requests with `Content-Type: application/json` | Add `AllowAnyHeader()` or list specific headers |
| Mismatched origin (trailing slash, wrong port) | `http://localhost:5173` ≠ `http://localhost:5173/` — origins must match exactly | Check the origin string carefully |

### Discussion

> 💬 **Ask:** "Your React app on port 5173 calls your ASP.NET API on port 5000. You get a CORS error. You open Postman, make the same request, and it works. Why?" (Answer: The browser enforces CORS; Postman doesn't. The server processed both requests identically.)

> 💬 **Ask:** "Should you use `AllowAnyOrigin()` / `*` in production? Why or why not?" (Answer: No — it means any website can call your API. In production, whitelist your specific front-end domain.)

### Common Questions

| Question | How to Answer |
|----------|---------------|
| "Can I just disable CORS?" | CORS isn't something you "enable" — it's always there in the browser. You configure your *server* to send headers that tell the browser to relax the restriction for specific origins. |
| "What if I need to allow multiple origins?" | Use `WithOrigins("https://app1.com", "https://app2.com")` — you can list multiple. |
| "Is CORS only for APIs?" | It applies to any cross-origin request from a browser: API calls, fonts, scripts loaded from CDNs. But API calls are where you'll notice it most. |

---

## 8 — Swagger / OpenAPI Documentation

### Key Concepts

1. **OpenAPI Specification** = a standard format (YAML/JSON) for describing REST APIs.
2. **Swagger UI** = interactive documentation generated from the spec.
3. Benefits: auto-generated docs, try-it-out testing, client SDK generation.

- "Documentation is a feature, not an afterthought."
- Show a real Swagger UI page (e.g., Petstore: `https://petstore.swagger.io/`).
- In ASP.NET Core, Swagger support comes via **Swashbuckle** (or the newer **Microsoft.AspNetCore.OpenApi** in .NET 9+).
- The `dotnet new webapi` template includes Swagger by default — show them this.

### Swagger in ASP.NET Core

Show this setup — it's often already in the template:

```csharp
// Program.cs
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
```

**What to show:**
1. Run `dotnet run` and navigate to `/swagger` — the Swagger UI appears.
2. Click "Try it out" on a GET endpoint.
3. "This is what professional APIs look like. And you get it almost for free."

> 💡 **Tip:** "You can ask AI to add XML documentation comments to your endpoints. Swashbuckle picks them up automatically and enriches the Swagger page."

### Discussion

> 💬 **Ask:** "Why would auto-generated documentation be better than a hand-written README?" (Answer: It stays in sync with the code. A README can go stale; Swagger reflects the actual endpoints.)

---

## 9 — Connecting React to ASP.NET Core

### Key Concepts

1. React and ASP.NET Core are **separate applications** running on **different ports**.
2. The browser makes HTTP requests from React to the API using `fetch` or `axios`.
3. CORS (which we just covered) is what makes this work.

- Draw the architecture:

```
[React App :5173]  ←→  [ASP.NET Core API :5000]  ←→  [Database]
   (Vite dev server)         (Kestrel)
```

- In development: two separate processes, two ports, CORS configured.
- In production: you might serve the React static files *from* the ASP.NET app, or use a CDN for the front end and a separate domain for the API. Different teams make different choices.

### The React Side — fetch Example

Show this conceptual React component — the React code is the same regardless of what back end you use:

```jsx
// In a React component
useEffect(() => {
  fetch('http://localhost:5000/api/books')
    .then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then(data => setBooks(data))
    .catch(err => console.error('API error:', err));
}, []);
```

**Key points:**
- Check `res.ok` — a 404 or 500 from the server doesn't throw; `fetch` only throws on network failures.
- Error handling on the client side is an important skill to develop.

> 💡 **Tip:** "Once you move beyond simple GET requests, consider using a library like `axios` which has a slightly friendlier API, or use React Query / TanStack Query for caching and state management around API calls."

### Proxy Configuration (Alternative to CORS in Dev)

- Vite can proxy API requests so the browser thinks they're same-origin:

```js
// vite.config.js
export default defineConfig({
  server: {
    proxy: {
      '/api': 'http://localhost:5000'
    }
  }
});
```

- "This avoids CORS entirely in development. But you should still understand CORS — you'll need it in production."

### Discussion

> 💬 **Ask:** "If your React app fetches `/api/books` (no host) instead of `http://localhost:5000/api/books`, what happens?" (Answer: It hits the Vite dev server, which returns 404 — unless you've configured the proxy.)

---

## 10 — Configuration & Secrets

### Key Concepts

1. **Configuration** = values that change between environments (dev, staging, production).
2. **Secrets** = sensitive values (API keys, connection strings) that must never be in source code.
3. ASP.NET Core has a **layered configuration system** — multiple sources, later sources override earlier ones.

- ASP.NET Core's configuration priority (later wins):
  1. `appsettings.json` — base settings, committed to git
  2. `appsettings.Development.json` — dev overrides, committed to git
  3. **User Secrets** — local dev secrets, never committed (`dotnet user-secrets`)
  4. **Environment variables** — set on the server/host
  5. Command-line arguments

- **User Secrets** are the .NET way to keep secrets out of your repo:

```bash
dotnet user-secrets init
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Server=..."
```

- These are stored in your user profile directory, not in the project folder. They never end up in git.

> ⚠️ **Hammer this point:** "I've seen developers push API keys and connection strings to public GitHub repos. Bots scrape GitHub for exposed secrets. Use User Secrets for development. Use environment variables or Azure Key Vault for production. Never put secrets in `appsettings.json`."

- For production: **Azure Key Vault**, **AWS Secrets Manager**, or platform-level environment variables.

### Discussion

> 💬 **Ask:** "If `appsettings.json` is committed to git, what kind of values should go there?" (Answer: Non-sensitive defaults — log levels, feature flags, allowed CORS origins for dev. Never passwords or API keys.)

---

## 11 — Error Handling Patterns

### Key Concepts

1. **Exception middleware** catches unhandled exceptions so your API returns structured errors instead of crashing.
2. **ProblemDetails** is the standard format (RFC 7807) for API error responses.
3. **Don't leak internal details** to clients — stack traces are for logs, not responses.

- In ASP.NET Core, unhandled exceptions result in a 500 response. The framework won't crash (unlike a raw Node.js server), but the default error response isn't helpful.
- .NET 8+ has built-in support for **ProblemDetails** — a standardized error format:

```json
{
  "type": "https://tools.ietf.org/html/rfc7807",
  "title": "Not Found",
  "status": 404,
  "detail": "Book with ID 999 was not found."
}
```

- "ProblemDetails gives your errors a consistent shape. Clients know exactly what to parse."

### Configuring Error Handling

Show the conceptual setup:

```csharp
// In Program.cs
builder.Services.AddProblemDetails();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage(); // Detailed errors in dev
}
else
{
    app.UseExceptionHandler();  // Generic errors in production
}
```

### Returning Errors from Endpoints

```csharp
app.MapGet("/api/books/{id}", (int id) =>
{
    var book = books.FirstOrDefault(b => b.Id == id);
    return book is not null
        ? Results.Ok(book)
        : Results.NotFound(new { detail = $"Book with ID {id} was not found." });
});
```

**Key points:**
- Use `Results.NotFound()`, `Results.BadRequest()`, `Results.Problem()` — they map to the right status codes.
- In development, show detailed errors. In production, show generic messages and log the details server-side.

### Discussion

> 💬 **Ask:** "Why would showing a stack trace in a production error response be a security risk?" (Answer: Stack traces reveal internal file paths, library versions, database structure — all useful to an attacker.)

### Common Questions

| Question | How to Answer |
|----------|---------------|
| "What's the difference between `UseDeveloperExceptionPage` and `UseExceptionHandler`?" | `DeveloperExceptionPage` shows full stack traces and source code in the browser — great for debugging, terrible for production. `UseExceptionHandler` returns a generic error. |
| "Should I try/catch every endpoint?" | Not usually. Let exceptions bubble up to the global handler. Use explicit status codes (`Results.NotFound()`) for expected cases, and let the exception handler catch truly unexpected errors. |
| "What about validation errors?" | ASP.NET Core can return 400 Bad Request with validation details automatically if you use model validation attributes like `[Required]`. |

---

## 12 — Live Demo: Building a Bookstore CRUD API with AI Assistance

### Setup & Goals

**Goal:** Build a complete CRUD API for a bookstore from scratch using ASP.NET Core, using AI to accelerate development, while narrating decisions and reviewing AI output critically.

### Demo Flow

**Step 1 — Project scaffold**

```bash
dotnet new webapi -n BookstoreDemo --no-https
cd BookstoreDemo
```

**Step 2 — Use AI to generate the base API**

> 🤖 **Live AI prompt (type this into Copilot Chat or ChatGPT):**

```
Rewrite Program.cs for a .NET 8 ASP.NET Core Minimal API bookstore.
Include:
- A Book record with: Id (int), Title (string), Author (string), Price (decimal), Isbn (string)
- An in-memory List<Book> with 3 sample books
- Full CRUD endpoints at /api/books:
  - GET / — list all books
  - GET /{id} — get one book by ID
  - POST / — create a book (validate Title and Author are required, return 201)
  - PUT /{id} — update a book (return 404 if not found)
  - DELETE /{id} — delete a book (return 204, or 404 if not found)
- CORS policy allowing http://localhost:5173
- Swagger/OpenAPI enabled in development
- Global error handling with ProblemDetails
- Use Minimal API style, no controllers
```

**Step 3 — Review the AI output**

> 📋 **Walk through the generated code and ask:**

- "Does the POST endpoint return 201? Let's check." → If not, fix it live.
- "What happens if I POST without a title?" → Test it.
- "Did the AI add CORS? Is the origin correct?"
- "Look at the DELETE route — does it return 204 or 200? Which did we say is correct?"
- "Is ProblemDetails actually wired up?"

> 💡 **Teaching moment:** If the AI made a mistake (it often does), celebrate it: "See? This is exactly why you need to understand REST and ASP.NET. The AI got this wrong. Let's fix it."

**Step 4 — Test with Swagger UI**

```bash
dotnet run
# Open http://localhost:5000/swagger
```

Walk through each endpoint in Swagger UI:
1. **GET /api/books** — show the 3 sample books.
2. **POST /api/books** — create a new book with the "Try it out" feature.
3. **GET /api/books/4** — retrieve the new book.
4. **PUT /api/books/4** — update the price.
5. **DELETE /api/books/4** — remove it (show 204).
6. **GET /api/books/999** — show the 404 error.

**Step 5 — Add a search feature with AI**

> 🤖 **Live AI prompt:**

```
Add a GET /api/books/search endpoint that accepts query parameters:
- ?author=name (partial match, case-insensitive)
- ?minPrice=10&maxPrice=30 (price range filter)
- ?title=keyword (partial match)
Multiple filters should work together (AND logic).
Return 200 with matching books array.
Use ASP.NET Core Minimal API style.
```

Paste the result, review with class, test in Swagger.

### What to Emphasize During Demo

- **Narrate your thinking:** "I'm checking if the AI used the right status codes… let me verify the CORS policy matches our React port…"
- **Show the terminal output** — ASP.NET Core logs requests by default.
- **Make a deliberate mistake** and debug it live (e.g., remove the CORS middleware and show the error when calling from a browser on a different port).
- **Reference earlier sections:** "Remember, middleware order matters — that's why `UseCors` comes before our endpoints."

### Discussion

> 💬 **Ask throughout:** "What should I test next?" Suggest edge cases.

> 💬 **Ask:** "If this were a real bookstore, what's missing from this API?" (Auth, pagination, database, images, etc.)

---

## 13 — Wrap-Up & Exercise Intro

### Exercise: Build a REST API for a Resource of Your Choice

**Hand out or display the exercise prompt:**

> ### In-Class Exercise (finish as homework if needed)
>
> Build an ASP.NET Core Minimal API for **one** of these resources (or propose your own):
> - 🎬 **Movies** (Id, Title, Director, Year, Genre, Rating)
> - 🎵 **Songs** (Id, Title, Artist, Album, Duration, Genre)
> - 🍕 **Recipes** (Id, Name, Cuisine, PrepTime, Servings, Ingredients)
> - 🎮 **Video Games** (Id, Title, Platform, Genre, ReleaseYear, Rating)
>
> **Requirements:**
> 1. Full CRUD (GET all, GET by id, POST, PUT, DELETE)
> 2. At least one search/filter endpoint
> 3. Input validation on POST/PUT (at least 2 required fields)
> 4. Proper HTTP status codes
> 5. CORS configured to allow a React front-end origin
> 6. Swagger documentation enabled
> 7. Configuration via `appsettings.json` (at minimum, the allowed CORS origins)
> 8. Error handling (global exception handler with ProblemDetails)
>
> **AI Usage Policy:**
> - ✅ Use AI to generate boilerplate and endpoints
> - ✅ Use AI to debug errors
> - ✅ Use AI to add Swagger annotations
> - ⚠️ You must be able to **explain every line** of your code
> - ⚠️ Add a comment at the top: `// AI tools used: [list tools]`
>
> **Submission:** Push to your GitHub repo by next Monday.

### Walk Through Getting Started

```bash
dotnet new webapi -n MyApi
cd MyApi
dotnet run
# Open /swagger to verify it works, then start building
```

### Closing Points

- **Recap tonight's arc:** REST theory → how the web works → ASP.NET Core basics → AI assistance → middleware → CORS → Swagger → React integration → configuration → error handling → full build.
- **Preview Week 4:** Databases (Entity Framework Core, SQL Server or PostgreSQL), connecting a real data store, and deployment basics.
- **Remind:** Office hours are [DAY/TIME]. Slack channel is open for questions.

> 💬 **Exit ticket question (ask verbally or post in Slack):** "Name one thing you'd check in AI-generated API code before shipping it." Collect a few answers — reinforces the review mindset.

---

## Appendix A — Additional Resources

| Resource | URL |
|----------|-----|
| ASP.NET Core Documentation | https://learn.microsoft.com/aspnet/core/ |
| Minimal APIs Tutorial | https://learn.microsoft.com/aspnet/core/tutorials/min-web-api |
| HTTP Status Codes Reference | https://httpstatuses.com/ |
| REST API Design Best Practices | https://stackoverflow.blog/2020/03/02/best-practices-for-rest-api-design/ |
| Swagger/OpenAPI Guide | https://swagger.io/docs/specification/about/ |
| MDN: Using Fetch | https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch |
| MDN: CORS | https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS |
| JSONPlaceholder (practice API) | https://jsonplaceholder.typicode.com/ |
| .NET User Secrets | https://learn.microsoft.com/aspnet/core/security/app-secrets |

---

## Appendix B — Troubleshooting Quick Reference

| Problem | Cause | Fix |
|---------|-------|-----|
| CORS error in browser console | CORS middleware not added or wrong origin | Verify `app.UseCors()` is in the pipeline and the origin matches exactly (scheme + host + port) |
| `404 Not Found` on all routes | Endpoints defined after `app.Run()` or wrong URL | Ensure `MapGet`/`MapPost` are before `app.Run()`; check the URL path |
| Swagger page is blank or missing | Swagger not enabled or not in Development mode | Check `app.UseSwagger()` and `app.UseSwaggerUI()` are inside the `IsDevelopment()` block |
| `dotnet run` fails — port in use | Another process on the same port | Kill the other process or change the port in `launchSettings.json` or `appsettings.json` |
| `System.Text.Json` serialization issues | Property naming (PascalCase vs camelCase) | ASP.NET Core defaults to camelCase in JSON. Use `JsonPropertyName` attribute or configure `JsonSerializerOptions` if needed |
| `req.body` / request body is null | Missing `[FromBody]` or wrong content type | Ensure the client sends `Content-Type: application/json` and the endpoint parameter is correctly typed |
| SSL/certificate errors in dev | Dev certificate not trusted | Run `dotnet dev-certs https --trust` |
| `Cannot find SDK` error | .NET SDK not installed or wrong version | Run `dotnet --version` to check; install from https://dot.net |
