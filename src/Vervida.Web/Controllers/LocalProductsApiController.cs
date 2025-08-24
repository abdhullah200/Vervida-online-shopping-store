using Microsoft.AspNetCore.Mvc;
using Vervida.Web.Models;
using System.Net;
using System.Text;

namespace Vervida.Web.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LocalProductsApiController : ControllerBase
{
    private static string SvgDataUri(string title)
    {
        var safe = WebUtility.HtmlEncode(title);
        var svg = $"<svg xmlns='http://www.w3.org/2000/svg' width='600' height='400'><rect width='100%' height='100%' fill='#1a1a2e'/><text x='50%' y='50%' font-size='28' fill='#ffffff' dominant-baseline='middle' text-anchor='middle' font-family='Inter, Arial, sans-serif'>{safe}</text></svg>";
        var bytes = Encoding.UTF8.GetBytes(svg);
        return "data:image/svg+xml;base64," + Convert.ToBase64String(bytes);
    }

    private static readonly List<Product> _products = new()
    {
        // Electronics
        new Product(1, "Premium Wireless Headphones", 299.99m, "electronics", "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop&auto=format", "High-quality wireless headphones with active noise cancellation, premium sound quality, and 30-hour battery life. Perfect for music lovers and professionals.", new Rating(4.8m, 245), 399.99m, 15),
        new Product(2, "4K Smart TV 55 inch", 799.99m, "electronics", "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=500&h=500&fit=crop&auto=format", "Ultra-HD 4K Smart TV with HDR, built-in streaming apps, and voice control. Crystal clear picture quality for the ultimate viewing experience.", new Rating(4.6m, 189), 999.99m, 8),
        new Product(3, "Gaming Laptop Pro", 1299.99m, "electronics", "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500&h=500&fit=crop&auto=format", "High-performance gaming laptop with RTX graphics, 16GB RAM, and 1TB SSD. Built for gaming enthusiasts and content creators.", new Rating(4.7m, 156), 1599.99m, 5),
        new Product(4, "Wireless Charging Pad", 49.99m, "electronics", "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=500&h=500&fit=crop&auto=format", "Fast wireless charging pad compatible with all Qi-enabled devices. Sleek design with LED indicators and overcharge protection.", new Rating(4.3m, 92), 69.99m, 25),
        new Product(5, "Bluetooth Speaker Waterproof", 89.99m, "electronics", "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&h=500&fit=crop&auto=format", "Portable waterproof Bluetooth speaker with 360-degree sound, 12-hour battery life, and rugged design for outdoor adventures.", new Rating(4.5m, 134), null, 18),

        // Women's Clothing
        new Product(6, "Elegant Summer Maxi Dress", 89.99m, "women's clothing", "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=500&h=500&fit=crop&auto=format", "Beautiful floral maxi dress perfect for summer occasions. Lightweight fabric with adjustable straps and flowing silhouette.", new Rating(4.4m, 87), 129.99m, 12),
        new Product(7, "Professional Blazer", 149.99m, "women's clothing", "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=500&h=500&fit=crop&auto=format", "Tailored blazer perfect for office wear. Premium fabric with classic cut and versatile styling options for professional women.", new Rating(4.6m, 203), 199.99m, 9),
        new Product(8, "Cozy Winter Sweater", 69.99m, "women's clothing", "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=500&h=500&fit=crop&auto=format", "Soft cashmere blend sweater with ribbed texture. Available in multiple colors, perfect for layering during cold seasons.", new Rating(4.7m, 156), null, 20),
        new Product(9, "High-Waisted Jeans", 79.99m, "women's clothing", "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500&h=500&fit=crop&auto=format", "Comfortable high-waisted jeans with stretch fabric. Classic straight-leg cut that flatters all body types.", new Rating(4.2m, 178), 99.99m, 16),

        // Men's Clothing
        new Product(10, "Classic Denim Jacket", 99.99m, "men's clothing", "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&h=500&fit=crop&auto=format", "Timeless denim jacket with vintage wash and comfortable fit. A wardrobe essential for casual and smart-casual looks.", new Rating(4.5m, 123), 139.99m, 14),
        new Product(11, "Business Dress Shirt", 59.99m, "men's clothing", "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=500&h=500&fit=crop&auto=format", "Crisp white dress shirt made from premium cotton. Perfect for business meetings and formal occasions.", new Rating(4.3m, 201), null, 22),
        new Product(12, "Casual Polo Shirt", 39.99m, "men's clothing", "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=500&h=500&fit=crop&auto=format", "Comfortable polo shirt in premium cotton pique. Available in various colors, perfect for weekend casual wear.", new Rating(4.1m, 145), 59.99m, 28),
        new Product(13, "Winter Wool Coat", 249.99m, "men's clothing", "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=500&h=500&fit=crop&auto=format", "Premium wool coat with classic tailoring and warm lining. Perfect for cold weather with sophisticated style.", new Rating(4.8m, 89), 349.99m, 7),

        // Jewelry
        new Product(14, "Classic Men's Watch", 199.99m, "jewelery", "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=500&h=500&fit=crop&auto=format", "Elegant timepiece with leather strap and water resistance up to 100m. Swiss movement with classic design.", new Rating(4.7m, 234), 299.99m, 11),
        new Product(15, "Diamond Stud Earrings", 599.99m, "jewelery", "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500&h=500&fit=crop&auto=format", "Brilliant cut diamond stud earrings set in 14k white gold. Perfect for everyday elegance or special occasions.", new Rating(4.9m, 156), 799.99m, 6),
        new Product(16, "Gold Chain Necklace", 299.99m, "jewelery", "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&h=500&fit=crop&auto=format", "18k gold plated chain necklace with adjustable length. Hypoallergenic and perfect for layering with other jewelry.", new Rating(4.5m, 178), null, 13),
        new Product(17, "Silver Bracelet Set", 89.99m, "jewelery", "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=500&h=500&fit=crop&auto=format", "Set of three sterling silver bracelets with different textures. Can be worn together or separately.", new Rating(4.3m, 92), 129.99m, 18),
        new Product(18, "Vintage Ring Collection", 149.99m, "jewelery", "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500&h=500&fit=crop&auto=format", "Set of vintage-inspired rings with antique finish. Includes 3 different designs in various sizes.", new Rating(4.6m, 134), 199.99m, 15),

        // Additional Electronics
        new Product(19, "Smart Fitness Tracker", 129.99m, "electronics", "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=500&h=500&fit=crop&auto=format", "Advanced fitness tracker with heart rate monitoring, GPS, and 7-day battery life. Track your health and fitness goals.", new Rating(4.4m, 287), 179.99m, 21),
        new Product(20, "Wireless Mouse & Keyboard Set", 79.99m, "electronics", "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&h=500&fit=crop&auto=format", "Ergonomic wireless mouse and keyboard set with long battery life. Perfect for office or home use.", new Rating(4.2m, 165), null, 16),

        // More Women's Clothing
        new Product(21, "Leather Handbag", 199.99m, "women's clothing", "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop&auto=format", "Genuine leather handbag with multiple compartments. Spacious and stylish for everyday use.", new Rating(4.7m, 145), 299.99m, 8),
    };

    [HttpGet("products")]
    public ActionResult<List<Product>> GetProducts() => _products;

    [HttpGet("products/{id}")]
    public ActionResult<Product?> GetProduct(int id) => _products.FirstOrDefault(p => p.Id == id);

    [HttpGet("products/category/{category}")]
    public ActionResult<List<Product>> GetProductsByCategory(string category)
    {
        var list = _products.Where(p => string.Equals(p.Category, category, StringComparison.OrdinalIgnoreCase)).ToList();
        return list;
    }

    [HttpGet("products/categories")]
    public ActionResult<List<string>> GetCategories() => _products.Select(p => p.Category).Distinct().ToList();
}
