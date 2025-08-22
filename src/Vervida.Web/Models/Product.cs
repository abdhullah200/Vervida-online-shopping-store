public record Product(
    int Id,
    string Title,
    decimal Price,
    string Category,
    string Image,
    string Description,
    Rating Rating);

public record Rating(decimal Rate, int Count);