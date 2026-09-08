using System.ComponentModel.DataAnnotations;

namespace FlowOps.Api.Models.Entities;

public class Product
{
    public Guid Id { get; set; }

    [Required, MaxLength(50)]
    public string Sku { get; set; } = string.Empty;

    [Required, MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(2000)]
    public string? Description { get; set; }

    public decimal Price { get; set; }

    public int QuantityOnHand { get; set; }

    [MaxLength(500)]
    public string? ImageUrl { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<OrderItem> OrderItems { get; set; } = [];

    public ICollection<InventoryAdjustment> InventoryAdjustments { get; set; } = [];
}
