using Microsoft.AspNetCore.Mvc;
using Vervida.Web.Services;
using Vervida.Web.Models;

namespace Vervida.Web.Controllers;
public class ProductsController(IProductApi api) : Controller
{
    public async Task<IActionResult> Index(string? category, string? search, int page = 1)
    {
        List<Product> products;
        List<string> categories = new();
        bool usedFallback = false;
        try
        {
            products = string.IsNullOrWhiteSpace(category)
                ? await api.GetProductsAsync()
                : await api.GetProductsByCategoryAsync(category);
        }
        catch
        {
            // Fallback sample products
            products = new List<Product>
            {
                new Product(1, "Sample T-Shirt", 19.99m, "Clothing", "https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg", "A cool t-shirt for everyday wear.", new Rating(4.5m, 120)),
                new Product(2, "Sample Watch", 99.99m, "Accessories", "https://fakestoreapi.com/img/71li-ujtlUL._AC_UX679_.jpg", "Stylish wrist watch.", new Rating(4.8m, 80)),
                new Product(3, "Sample Shoes", 49.99m, "Footwear", "https://fakestoreapi.com/img/61IBBVJvSDL._AC_SY879_.jpg", "Comfortable running shoes.", new Rating(4.2m, 60)),
                new Product(4, "Sample Bag", 29.99m, "Accessories", "https://fakestoreapi.com/img/81QpkIctqPL._AC_SX679_.jpg", "Trendy shoulder bag.", new Rating(4.0m, 40)),
                new Product(5, "Sample Jacket", 59.99m, "Clothing", "https://fakestoreapi.com/img/71YXzeOuslL._AC_UY879_.jpg", "Warm winter jacket.", new Rating(4.7m, 30)),
            };
            usedFallback = true;
            ViewBag.Error = "Showing sample products. API unavailable.";
        }

        try
        {
            categories = usedFallback
                ? new List<string> { "Clothing", "Accessories", "Footwear" }
                : await api.GetCategoriesAsync();
        }
        catch
        {
            if (!usedFallback)
                ViewBag.Error = "Unable to load categories. Please try again later.";
        }

        if (!string.IsNullOrWhiteSpace(search))
            products = products.Where(p => p.Title.Contains(search, StringComparison.OrdinalIgnoreCase)).ToList();

        ViewBag.Categories = categories;
        ViewBag.SelectedCategory = category;
        ViewBag.Search = search;
        ViewBag.TotalCount = products.Count;
        ViewBag.Page = page;

        const int pageSize = 10;
        var paginated = products.Skip((page - 1) * pageSize).Take(pageSize).ToList();
        return View(paginated);
    }

    public async Task<IActionResult> Details(int id)
    {
        try
        {
            return Json(await api.GetProductAsync(id));
        }
        catch
        {
            // Fallback sample product
            var sample = new Product(id, "Sample Product", 9.99m, "Misc", "https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg", "Sample description.", new Rating(4.0m, 10));
            return Json(sample);
        }
    }
}