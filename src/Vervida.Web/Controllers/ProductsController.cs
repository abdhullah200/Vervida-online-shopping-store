using Microsoft.AspNetCore.Mvc;
using Vervida.Web.Services;
using Vervida.Web.Models;
using Refit;

namespace Vervida.Web.Controllers;

public class ProductsController : Controller
{
    private readonly IProductApi _api;
    private readonly ILogger<ProductsController> _logger;

    public ProductsController(IProductApi api, ILogger<ProductsController> logger)
    {
        _api = api;
        _logger = logger;
    }

    public async Task<IActionResult> Index(string? category, string? search, int page = 1)
    {
        List<Product> products;
        List<string> categories = new();
        bool usedFallback = false;
        
        try
        {
            _logger.LogInformation("Attempting to fetch products from API");
            
            if (string.IsNullOrWhiteSpace(category))
            {
                products = await _api.GetProductsAsync();
            }
            else
            {
                products = await _api.GetProductsByCategoryAsync(category);
            }
            
            categories = await _api.GetCategoriesAsync();
            _logger.LogInformation($"Successfully fetched {products.Count} products from API");
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "API failed, using fallback products");
            
            // Use fallback products
            products = GetFallbackProducts();
            categories = products.Select(p => p.Category).Distinct().OrderBy(c => c).ToList();
            usedFallback = true;
            ViewBag.Error = "Unable to load products from API. Showing sample data.";
        }

        // Apply search filter
        if (!string.IsNullOrWhiteSpace(search))
        {
            products = products.Where(p => 
                p.Title.Contains(search, StringComparison.OrdinalIgnoreCase) ||
                p.Description.Contains(search, StringComparison.OrdinalIgnoreCase) ||
                p.Category.Contains(search, StringComparison.OrdinalIgnoreCase)
            ).ToList();
        }

        // Set ViewBag properties
        ViewBag.Categories = categories;
        ViewBag.SelectedCategory = category;
        ViewBag.Search = search;
        ViewBag.TotalCount = products.Count;
        ViewBag.Page = page;
        ViewBag.UsedFallback = usedFallback;

        // Pagination
        const int pageSize = 10;
        var totalPages = (int)Math.Ceiling((double)products.Count / pageSize);
        ViewBag.TotalPages = totalPages;
        ViewBag.HasPreviousPage = page > 1;
        ViewBag.HasNextPage = page < totalPages;
        
        var paginatedProducts = products
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToList();

        return View(paginatedProducts);
    }

    public async Task<IActionResult> Details(int id)
    {
        try
        {
            _logger.LogInformation($"Fetching details for product {id}");
            var product = await _api.GetProductAsync(id);
            return Json(product);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"API failed for product {id}");
            
            // Return fallback product
            var fallbackProduct = GetFallbackProducts().FirstOrDefault(p => p.Id == id);
            if (fallbackProduct != null)
            {
                return Json(fallbackProduct);
            }
            
            // If no fallback found, create a generic one
            var genericProduct = new Product(
                id, 
                $"Product {id}", 
                29.99m, 
                "General", 
                "https://via.placeholder.com/400x400?text=Product", 
                "Product details unavailable at this time.", 
                new Rating(4.0m, 10)
            );
            
            return Json(genericProduct);
        }
    }

    private static List<Product> GetFallbackProducts()
    {
        return new List<Product>
        {
            new Product(1, "Premium Cotton T-Shirt", 29.99m, "men's clothing", "https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg", "Premium quality cotton t-shirt with comfortable fit and modern design. Perfect for casual wear and everyday activities.", new Rating(4.5m, 120)),
            new Product(2, "Luxury Swiss Watch", 299.99m, "jewelery", "https://fakestoreapi.com/img/71li-ujtlUL._AC_UX679_.jpg", "Elegant Swiss-made timepiece with precision movement and premium leather strap. A perfect blend of style and functionality.", new Rating(4.8m, 85)),
            new Product(3, "Athletic Running Shoes", 89.99m, "men's clothing", "https://fakestoreapi.com/img/61IBBVJvSDL._AC_SY879_.jpg", "High-performance running shoes with advanced cushioning and breathable mesh upper. Designed for comfort and durability.", new Rating(4.3m, 67)),
            new Product(4, "Designer Leather Bag", 149.99m, "women's clothing", "https://fakestoreapi.com/img/81QpkIctqPL._AC_SX679_.jpg", "Handcrafted leather bag with multiple compartments and timeless design. Perfect for work or casual outings.", new Rating(4.6m, 43)),
            new Product(5, "Winter Parka Jacket", 179.99m, "men's clothing", "https://fakestoreapi.com/img/71YXzeOuslL._AC_UY879_.jpg", "Insulated winter jacket with water-resistant exterior and removable hood. Keeps you warm in harsh weather conditions.", new Rating(4.7m, 38)),
            new Product(6, "Wireless Bluetooth Headphones", 199.99m, "electronics", "https://fakestoreapi.com/img/51eg55uWmdL._AC_UX679_.jpg", "Premium wireless headphones with active noise cancellation and 30-hour battery life. Crystal clear audio quality.", new Rating(4.4m, 92)),
            new Product(7, "Fjallraven Foldsack Backpack", 109.95m, "men's clothing", "https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg", "Durable backpack perfect for outdoor adventures. Made with high-quality materials and ergonomic design.", new Rating(3.9m, 120)),
            new Product(8, "Mens Cotton Jacket", 55.99m, "men's clothing", "https://fakestoreapi.com/img/71li-ujtlUL._AC_UX679_.jpg", "Great outerwear for Spring/Autumn/Winter. Suitable for many occasions, casual, etc.", new Rating(4.7m, 500)),
            new Product(9, "Mens Casual T-Shirts", 22.30m, "men's clothing", "https://fakestoreapi.com/img/71YXzeOuslL._AC_UY879_.jpg", "Comfortable cotton t-shirt available in various colors. Perfect for everyday casual wear.", new Rating(4.1m, 259)),
            new Product(10, "John Hardy Women's Legends Necklace", 695.00m, "jewelery", "https://fakestoreapi.com/img/71pWzhdJNwL._AC_UL640_QL65_ML3_.jpg", "From our Legends Collection, the Naga was inspired by the mythical water dragon.", new Rating(4.6m, 400)),
            new Product(11, "Solid Gold Petite Micropave", 168.00m, "jewelery", "https://fakestoreapi.com/img/61sbMiUnoGL._AC_UL640_QL65_ML3_.jpg", "Satisfaction Guaranteed. Return or exchange any order within 30 days.", new Rating(3.9m, 70)),
            new Product(12, "White Gold Plated Princess", 9.99m, "jewelery", "https://fakestoreapi.com/img/71YAIFU48IL._AC_UL640_QL65_ML3_.jpg", "Classic Created Wedding Engagement Solitaire Diamond Promise Ring.", new Rating(3.0m, 400)),
            new Product(13, "Pierced Owl Rose Gold Plated", 10.99m, "jewelery", "https://fakestoreapi.com/img/51UDEzMJVpL._AC_UL640_QL65_ML3_.jpg", "Rose Gold Plated Double Flared Tunnel Plug Earrings. Made of 316L Stainless Steel.", new Rating(1.9m, 100)),
            new Product(14, "WD 2TB Elements Portable", 64.00m, "electronics", "https://fakestoreapi.com/img/61IBBVJvSDL._AC_SY879_.jpg", "USB 3.0 and USB 2.0 Compatibility Fast data transfers Improve PC Performance.", new Rating(3.3m, 203)),
            new Product(15, "SanDisk SSD PLUS 1TB", 109.00m, "electronics", "https://fakestoreapi.com/img/61U7T1koQqL._AC_SX679_.jpg", "Easy upgrade for faster boot up, shutdown, application load and response.", new Rating(2.9m, 470)),
            new Product(16, "Silicon Power 256GB SSD", 109.00m, "electronics", "https://fakestoreapi.com/img/71kWymZ+c+L._AC_SX679_.jpg", "3D NAND flash are applied to deliver high transfer speeds.", new Rating(4.8m, 319)),
            new Product(17, "WD 4TB Gaming Drive", 114.00m, "electronics", "https://fakestoreapi.com/img/61mtL65D4cL._AC_SX679_.jpg", "Expand your PS4 gaming experience, Play anywhere Fast and easy, setup.", new Rating(4.8m, 400)),
            new Product(18, "Acer SB220Q Monitor", 599.00m, "electronics", "https://fakestoreapi.com/img/81QpkIctqPL._AC_SX679_.jpg", "21.5 inches Full HD (1920 x 1080) widescreen IPS display.", new Rating(2.9m, 250)),
            new Product(19, "Samsung 49-Inch Monitor", 999.99m, "electronics", "https://fakestoreapi.com/img/81Zt42ioCgL._AC_SX679_.jpg", "49 INCH SUPER ULTRAWIDE 32:9 CURVED GAMING MONITOR.", new Rating(2.2m, 140)),
            new Product(20, "OPNA Women's Short Sleeve", 7.95m, "women's clothing", "https://fakestoreapi.com/img/51eg55uWmdL._AC_UX679_.jpg", "100% Polyester, Machine wash, 100% cationic polyester interlock.", new Rating(4.5m, 146))
        };
    }
}