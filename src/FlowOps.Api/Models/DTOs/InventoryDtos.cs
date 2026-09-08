using System.ComponentModel.DataAnnotations;

namespace FlowOps.Api.Models.DTOs;

public record AdjustInventoryRequest(
    [Required, RegularExpression("^(Restock|Sale|ManualCorrection)$")] string Type,
    int QuantityChange,
    [MaxLength(500)] string? Reason
);

public record InventoryAdjustmentResponse(
    Guid Id,
    string Type,
    int QuantityChange,
    string? Reason,
    string AdjustedByName,
    DateTime CreatedAt
);
