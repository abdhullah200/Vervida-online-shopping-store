# Vervida — Online Shopping Store (ASP.NET Core)

A modern e-commerce demo storefront built with ASP.NET Core MVC featuring a sleek dark theme, interactive product catalog, and shopping cart functionality. The project includes a comprehensive local API with 21 sample products and real product images from Unsplash.

## Features

- 🛍️ **Interactive Product Catalog** - Browse 21 products across multiple categories
- 🛒 **Shopping Cart** - Add/remove items with persistent storage and cart sidebar
- 🔍 **Search & Filter** - Real-time search and category filtering
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile
- 🎨 **Modern UI** - Dark theme with glassmorphism effects and smooth animations
- ⚡ **Fast Performance** - Optimized with lazy loading and efficient caching
- 🎯 **Product Details** - Modal popups with detailed product information

## Quick Links
- Web project: `src/Vervida.Web`
- Local fake API: `/api/LocalProductsApi` (Development)
- Products page: `/Products`
- Home page: `/` (with interactive 3D graphics)
- Contact page: `/Home/Contact`

## Requirements
- .NET 8 SDK
- (optional) Node.js + npm to build scss (`sass` is a devDependency)

## Run Locally

1. **Start the application** from the repository root:

```bash
cd src/Vervida.Web
dotnet run
```

2. **Open your browser** to view the application:

```
http://localhost:5235
```

Alternatively, run without changing directory:

```bash
dotnet run --project src/Vervida.Web/Vervida.Web.csproj
```

## Product Catalog

The application features **21 premium products** across 4 categories:

### Categories
- **Electronics** (6 items) - Headphones, TVs, laptops, charging accessories
- **Women's Clothing** (4 items) - Dresses, blazers, sweaters, jeans, handbags  
- **Men's Clothing** (4 items) - Jackets, shirts, polo shirts, coats
- **Jewelry** (5 items) - Watches, earrings, necklaces, bracelets, rings

### Product Features
- **High-quality images** from Unsplash
- **Original & sale prices** with discount calculations
- **Stock tracking** with availability indicators
- **Customer ratings** with star displays
- **Detailed descriptions** for each product

## Development Notes

- **Environment-based API routing**: In Development, the app uses the local API at `http://localhost:5235/api/LocalProductsApi`. In Production, it would route to an external API like `https://fakestoreapi.com`
- **Local API endpoints**:
  - `GET /api/LocalProductsApi/products` — List all products (21 items)
  - `GET /api/LocalProductsApi/products/{id}` — Get product by ID
  - `GET /api/LocalProductsApi/products/category/{category}` — Filter by category
  - `GET /api/LocalProductsApi/products/categories` — List all categories

## UI Architecture

### Views & Controllers
- **ProductsController** - Handles product listing, filtering, search, and details
- **HomeController** - Landing page with interactive 3D graphics and contact form
- **LocalProductsApiController** - Local API serving 21 sample products

### Frontend Features
- **Cart Management** - Client-side cart with sessionStorage persistence (`vervida_cart` key)
- **Product Modals** - Dynamic product detail popups with quantity controls
- **Search & Filter** - Real-time filtering by category and search terms
- **Responsive Design** - Mobile-first approach with Bootstrap 5
- **Dark Theme** - Custom CSS with glassmorphism effects and neon accents

### JavaScript Modules
- `wwwroot/js/products.js` - Product interactions, cart management, modal handling
- `wwwroot/js/site.js` - Global site functionality, theme system, animations

## Troubleshooting

### Common Issues
- **"Couldn't find a project to run"** - Run from `src/Vervida.Web` directory or use `--project` flag with the `.csproj` path
- **Port conflicts** - The app uses port `5235` by default. Check if another process is using this port
- **Missing images** - The local API serves high-quality Unsplash images; check your internet connection if images don't load
- **Cart not persisting** - Cart data is stored in sessionStorage and will reset when the browser session ends

### Development Environment
- **Codespaces/GitHub.dev** - The app is configured to listen on `0.0.0.0` and honors the `PORT` environment variable for proper forwarding
- **Hot reload** - Use `dotnet watch run` for automatic reload during development
- **SCSS compilation** - Run `npm run sass` to compile custom stylesheets (requires Node.js)

## Technology Stack

- **Backend**: ASP.NET Core 8 MVC
- **API Client**: Refit for HTTP client management  
- **Frontend**: Bootstrap 5, custom CSS with glassmorphism effects
- **JavaScript**: Vanilla JS with ES6+ features
- **3D Graphics**: Three.js for interactive homepage elements
- **Icons**: Bootstrap Icons
- **Fonts**: Google Fonts (Inter)

## Performance Features

- **Lazy loading** for product images
- **Client-side caching** with sessionStorage
- **Optimized CSS** with minimal external dependencies
- **Responsive images** with proper sizing
- **Smooth animations** with CSS transitions and transforms

## Next Steps / Roadmap

### Immediate Improvements
- [ ] **Enhanced cart functionality** - Quantity controls, remove items, order totals
- [ ] **User authentication** - Login/register system with persistent carts
- [ ] **Product reviews** - Customer review system with ratings
- [ ] **Payment integration** - Stripe/PayPal checkout process

### Advanced Features  
- [ ] **Product recommendations** - AI-powered suggestions
- [ ] **Inventory management** - Real-time stock updates
- [ ] **Order tracking** - Order history and status updates
- [ ] **Admin dashboard** - Product management interface
- [ ] **Multi-language support** - Internationalization (i18n)
- [ ] **Progressive Web App** - Offline functionality and push notifications

### Technical Improvements
- [ ] **Unit tests** - Comprehensive test coverage
- [ ] **CI/CD pipeline** - Automated testing and deployment
- [ ] **Docker containerization** - Easy deployment and scaling
- [ ] **API versioning** - Support for multiple API versions
- [ ] **Caching layer** - Redis for improved performance

## Screenshots & Demo

### Homepage
- Interactive 3D graphics powered by Three.js
- Modern glassmorphism design with dark theme
- Smooth animations and hover effects

### Products Page  
- Grid layout with responsive cards
- Real-time search and category filtering
- Product details in modal popups
- Shopping cart integration with badge counter

### Cart Functionality
- Slide-out cart sidebar with proper z-index layering
- Session-based storage (persists during browser session)
- Add/remove items with visual feedback
- Checkout preparation (integration ready)

---

**Vervida** - Premium online shopping experience with modern web technologies.

*Generated README - Last updated: December 2024*
