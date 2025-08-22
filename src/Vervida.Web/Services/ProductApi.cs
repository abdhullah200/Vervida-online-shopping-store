using Refit;

namespace Vervida.Web.Services;
public interface IProductApi
{
    [Get("/products")]
    Task<List<Product>> GetProductsAsync();

    [Get("/products/{id}")]
    Task<Product> GetProductAsync(int id);

    [Get("/products/category/{category}")]
    Task<List<Product>> GetProductsByCategoryAsync(string category);

    [Get("/products/categories")]
    Task<List<string>> GetCategoriesAsync();
}