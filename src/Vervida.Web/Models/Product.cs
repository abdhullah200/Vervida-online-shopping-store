public record Product(
    int Id,
    string Title,
    decimal Price,
    string Category,
    string Image,
    string Description,
    Rating Rating,
    decimal? OriginalPrice = null,
    int Stock = 0);

public record Rating(decimal Rate, int Count);