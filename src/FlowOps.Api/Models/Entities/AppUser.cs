using System.ComponentModel.DataAnnotations;

namespace FlowOps.Api.Models.Entities;

public class AppUser
{
    public Guid Id { get; set; }

    [Required, MaxLength(254)]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string PasswordHash { get; set; } = string.Empty;

    [Required, MaxLength(20)]
    public string Role { get; set; } = "Staff";

    [MaxLength(100)]
    public string? FullName { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Order> Orders { get; set; } = [];

    public ICollection<InventoryAdjustment> InventoryAdjustments { get; set; } = [];
}
