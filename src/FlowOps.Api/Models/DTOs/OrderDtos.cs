using System.ComponentModel.DataAnnotations;

namespace FlowOps.Api.Models.DTOs;

public record CreateOrderRequest(
    [Required, MaxLength(200)] string CustomerName,
    [MaxLength(254)] string? CustomerEmail,
    [Required, MinLength(1)] List<CreateOrderItemRequest> Items
);

public record CreateOrderItemRequest(
    [Required] Guid ProductId,
    [Range(1, int.MaxValue)] int Quantity
);

public record UpdateOrderStatusRequest(
    [Required, RegularExpression("^(Pending|Fulfilled|Cancelled)$")] string Status
);

public record OrderResponse(
    Guid Id,
    string CustomerName,
    string? CustomerEmail,
    string Status,
    decimal Total,
    DateTime CreatedAt,
    List<OrderItemResponse> Items
);

public record OrderItemResponse(
    Guid Id,
    Guid ProductId,
    string ProductName,
    int Quantity,
    decimal UnitPrice
);
