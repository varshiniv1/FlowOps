using System.ComponentModel.DataAnnotations;

namespace FlowOps.Api.Models.DTOs;

public record CreateProductRequest(
    [Required, MaxLength(50)] string Sku,
    [Required, MaxLength(200)] string Name,
    [MaxLength(2000)] string? Description,
    [Range(0.01, double.MaxValue)] decimal Price,
    [Range(0, int.MaxValue)] int QuantityOnHand
);

public record UpdateProductRequest(
    [Required, MaxLength(200)] string Name,
    [MaxLength(2000)] string? Description,
    [Range(0.01, double.MaxValue)] decimal Price
);

public record ProductResponse(
    Guid Id,
    string Sku,
    string Name,
    string? Description,
    decimal Price,
    int QuantityOnHand,
    string? ImageUrl,
    DateTime CreatedAt
);
