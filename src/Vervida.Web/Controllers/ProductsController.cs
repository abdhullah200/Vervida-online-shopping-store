using Microsoft.AspNetCore.Mvc;
using Vervida.Web.Services;

namespace Vervida.Web.Controllers;
public class ProductsController(IProductApi api) : Controller
{
    public async Task<IActionResult> Index(string? category, string? search, int page = 1)
    {
        List<Product> products;
        try
        {
            products = string.IsNullOrWhiteSpace(category)
                ? await api.GetProductsAsync()
                : await api.GetProductsByCategoryAsync(category);
        }
        catch (Exception ex)
        {
            ViewBag.Error = "Unable to load products. Please try again later.";
            products = new List<Product>();
        }

        if (!string.IsNullOrWhiteSpace(search))
            products = products.Where(p => p.Title.Contains(search, StringComparison.OrdinalIgnoreCase)).ToList();

        ViewBag.Categories = await api.GetCategoriesAsync();
        ViewBag.SelectedCategory = category;
        ViewBag.Search = search;

        const int pageSize = 10;
        var paginated = products.Skip((page - 1) * pageSize).Take(pageSize).ToList();
        return View(paginated);
    }

    public async Task<IActionResult> Details(int id) => Json(await api.GetProductAsync(id));
}