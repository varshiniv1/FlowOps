using FlowOps.Api.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace FlowOps.Api.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(AppDbContext db)
    {
        if (await db.Users.AnyAsync())
            return;

        var admin = new AppUser
        {
            Id = Guid.NewGuid(),
            Email = "admin@flowops.dev",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123!"),
            Role = "Admin",
            FullName = "System Admin"
        };

        var staff = new AppUser
        {
            Id = Guid.NewGuid(),
            Email = "staff@flowops.dev",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Staff123!"),
            Role = "Staff",
            FullName = "Warehouse Staff"
        };

        db.Users.AddRange(admin, staff);

        var products = new[]
        {
            new Product { Id = Guid.NewGuid(), Sku = "WDG-001", Name = "Mechanical Keyboard", Description = "Cherry MX Blue switches, full-size layout", Price = 89.99m, QuantityOnHand = 150 },
            new Product { Id = Guid.NewGuid(), Sku = "WDG-002", Name = "Wireless Mouse", Description = "Ergonomic design, 2.4GHz wireless", Price = 34.99m, QuantityOnHand = 300 },
            new Product { Id = Guid.NewGuid(), Sku = "WDG-003", Name = "USB-C Hub", Description = "7-in-1 USB-C hub with HDMI, SD card, USB 3.0", Price = 49.99m, QuantityOnHand = 200 },
            new Product { Id = Guid.NewGuid(), Sku = "WDG-004", Name = "Monitor Stand", Description = "Adjustable height, holds up to 32\" monitors", Price = 59.99m, QuantityOnHand = 75 },
            new Product { Id = Guid.NewGuid(), Sku = "WDG-005", Name = "Webcam HD", Description = "1080p, built-in microphone, auto-focus", Price = 44.99m, QuantityOnHand = 120 },
        };

        db.Products.AddRange(products);
        await db.SaveChangesAsync();
    }
}
