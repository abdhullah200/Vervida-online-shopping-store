# Vervida — Online Shopping Store (ASP.NET Core)

A demo storefront built with ASP.NET Core MVC that fetches product data from an API. The project includes a small local fake API for development so the UI works without external network access.

Quick links
- Web project: `src/Vervida.Web`
- Local fake API: `/api/LocalProductsApi` (Development)
- Products page: `/Products`
- Contact page: `/Home/Contact`

Requirements
- .NET 8 SDK
- (optional) Node.js + npm to build scss (`sass` is a devDependency)

Run locally
1. From the repository root (or directly):

```bash
cd src/Vervida.Web
dotnet run
```

2. By default the app listens on port `5235`. Open:

```
http://localhost:5235
```

Or run without changing directory:

```bash
dotnet run --project src/Vervida.Web/Vervida.Web.csproj
```

Development notes
- In Development the app routes Refit API calls to the local fake API at `http://localhost:5235/api/LocalProductsApi` so the UI shows sample products even when the external API is unavailable.
- Local API endpoints (examples):
	- `GET /api/LocalProductsApi/products` — list products
	- `GET /api/LocalProductsApi/products/{id}` — product details
	- `GET /api/LocalProductsApi/products/categories` — categories

UI notes
- Products view: `src/Vervida.Web/Views/Products/Index.cshtml`
- Cart UI is client-side and stores state in `localStorage` under key `vervida-cart`.
- JS entry for product interactions: `wwwroot/js/products.js` — this file hydrates the cart and provides Add-to-cart, modal and cart sidebar behaviours.

Troubleshooting
- If `dotnet run` says "Couldn't find a project to run", run it from `src/Vervida.Web` or pass `--project` with the `.csproj` path.
- When running in Codespaces / GitHub.dev, ensure the forwarded port is open. The app is configured to listen on `0.0.0.0` and honor the `PORT` env var.
- If product images are missing, the local API serves inline SVG placeholders. Inspect `<img>` element `src` values in the browser devtools.

Next steps / TODO
- Improve cart UI: quantity controls, remove item, persist across sessions (already saved to `localStorage`).
- Replace sample SVG images with real assets.
- Add tests and CI pipeline.

Contact
- For development questions see `/Home/Contact` in the app.

--
Generated README — edit as needed.
