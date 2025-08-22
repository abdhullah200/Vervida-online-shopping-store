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
        new Product(1, "Sample T-Shirt", 19.99m, "Clothing", SvgDataUri("Sample T-Shirt"), "A cool t-shirt for everyday wear.", new Rating(4.5m, 120)),
        new Product(2, "Sample Watch", 99.99m, "Accessories", SvgDataUri("Sample Watch"), "Stylish wrist watch.", new Rating(4.8m, 80)),
        new Product(3, "Sample Shoes", 49.99m, "Footwear", SvgDataUri("Sample Shoes"), "Comfortable running shoes.", new Rating(4.2m, 60)),
        new Product(4, "Sample Bag", 29.99m, "Accessories", SvgDataUri("Sample Bag"), "Trendy shoulder bag.", new Rating(4.0m, 40)),
        new Product(5, "Sample Jacket", 59.99m, "Clothing", SvgDataUri("Sample Jacket"), "Warm winter jacket.", new Rating(4.7m, 30)),
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
