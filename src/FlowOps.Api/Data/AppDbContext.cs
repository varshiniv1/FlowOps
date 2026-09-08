using FlowOps.Api.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace FlowOps.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<AppUser> Users => Set<AppUser>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<InventoryAdjustment> InventoryAdjustments => Set<InventoryAdjustment>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<AppUser>(entity =>
        {
            entity.HasIndex(u => u.Email).IsUnique();
        });

        modelBuilder.Entity<Product>(entity =>
        {
            entity.HasIndex(p => p.Sku).IsUnique();
            entity.Property(p => p.Price).HasPrecision(18, 2);
        });

        modelBuilder.Entity<Order>(entity =>
        {
            entity.Property(o => o.Total).HasPrecision(18, 2);
            entity.Property(o => o.Status)
                  .HasConversion<string>()
                  .HasMaxLength(20);

            entity.HasOne(o => o.User)
                  .WithMany(u => u.Orders)
                  .HasForeignKey(o => o.UserId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<OrderItem>(entity =>
        {
            entity.Property(oi => oi.UnitPrice).HasPrecision(18, 2);

            entity.HasOne(oi => oi.Order)
                  .WithMany(o => o.Items)
                  .HasForeignKey(oi => oi.OrderId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(oi => oi.Product)
                  .WithMany(p => p.OrderItems)
                  .HasForeignKey(oi => oi.ProductId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<InventoryAdjustment>(entity =>
        {
            entity.Property(ia => ia.Type)
                  .HasConversion<string>()
                  .HasMaxLength(30);

            entity.HasOne(ia => ia.Product)
                  .WithMany(p => p.InventoryAdjustments)
                  .HasForeignKey(ia => ia.ProductId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(ia => ia.AdjustedBy)
                  .WithMany(u => u.InventoryAdjustments)
                  .HasForeignKey(ia => ia.AdjustedById)
                  .OnDelete(DeleteBehavior.Restrict);
        });
    }
}
