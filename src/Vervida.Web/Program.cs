using Vervida.Web.Services;
using Refit;

var builder = WebApplication.CreateBuilder(args);

// Ensure the app listens on all network interfaces so external port forwarding works (e.g. Codespaces)
var port = Environment.GetEnvironmentVariable("PORT") ?? "5235";
builder.WebHost.UseUrls($"http://0.0.0.0:{port}");

// Add services to the container.
builder.Services.AddControllersWithViews();

// Register Refit client for IProductApi. In Development use local API controller path; otherwise use fakestoreapi.
var productApiBase = builder.Environment.IsDevelopment()
    ? new Uri($"http://localhost:{port}/api/LocalProductsApi")
    : new Uri("https://fakestoreapi.com");

builder.Services.AddRefitClient<IProductApi>()
    .ConfigureHttpClient(c => c.BaseAddress = productApiBase);

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
    app.UseHttpsRedirection();
}

app.UseStaticFiles();

app.UseRouting();

app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.Run();