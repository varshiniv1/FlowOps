using System.ComponentModel.DataAnnotations;

namespace FlowOps.Api.Models.Entities;

public class InventoryAdjustment
{
    public Guid Id { get; set; }

    public Guid ProductId { get; set; }

    public AdjustmentType Type { get; set; }

    public int QuantityChange { get; set; }

    [MaxLength(500)]
    public string? Reason { get; set; }

    public Guid AdjustedById { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Product Product { get; set; } = null!;

    public AppUser AdjustedBy { get; set; } = null!;
}

public enum AdjustmentType
{
    Restock,
    Sale,
    ManualCorrection
}
