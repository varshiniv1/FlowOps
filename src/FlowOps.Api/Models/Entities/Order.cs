using System.ComponentModel.DataAnnotations;

namespace FlowOps.Api.Models.Entities;

public class Order
{
    public Guid Id { get; set; }

    public Guid UserId { get; set; }

    public OrderStatus Status { get; set; } = OrderStatus.Pending;

    [Required, MaxLength(200)]
    public string CustomerName { get; set; } = string.Empty;

    [MaxLength(254)]
    public string? CustomerEmail { get; set; }

    public decimal Total { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public AppUser User { get; set; } = null!;

    public ICollection<OrderItem> Items { get; set; } = [];
}

public enum OrderStatus
{
    Pending,
    Fulfilled,
    Cancelled
}
