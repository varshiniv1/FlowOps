using System.Security.Claims;
using FlowOps.Api.Data;
using FlowOps.Api.Models.DTOs;
using FlowOps.Api.Models.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FlowOps.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class OrdersController : ControllerBase
{
    private readonly AppDbContext _db;

    public OrdersController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<List<OrderResponse>>> GetAll([FromQuery] string? status)
    {
        var query = _db.Orders
            .Include(o => o.Items)
            .ThenInclude(oi => oi.Product)
            .AsQueryable();

        if (!string.IsNullOrEmpty(status) && Enum.TryParse<OrderStatus>(status, true, out var parsed))
            query = query.Where(o => o.Status == parsed);

        var orders = await query
            .OrderByDescending(o => o.CreatedAt)
            .Select(o => new OrderResponse(
                o.Id, o.CustomerName, o.CustomerEmail,
                o.Status.ToString(), o.Total, o.CreatedAt,
                o.Items.Select(oi => new OrderItemResponse(
                    oi.Id, oi.ProductId, oi.Product.Name,
                    oi.Quantity, oi.UnitPrice)).ToList()))
            .ToListAsync();

        return Ok(orders);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<OrderResponse>> GetById(Guid id)
    {
        var order = await _db.Orders
            .Include(o => o.Items)
            .ThenInclude(oi => oi.Product)
            .FirstOrDefaultAsync(o => o.Id == id);

        if (order is null) return NotFound();

        return Ok(new OrderResponse(
            order.Id, order.CustomerName, order.CustomerEmail,
            order.Status.ToString(), order.Total, order.CreatedAt,
            order.Items.Select(oi => new OrderItemResponse(
                oi.Id, oi.ProductId, oi.Product.Name,
                oi.Quantity, oi.UnitPrice)).ToList()));
    }

    [HttpPost]
    public async Task<ActionResult<OrderResponse>> Create([FromBody] CreateOrderRequest request)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var productIds = request.Items.Select(i => i.ProductId).ToList();
        var products = await _db.Products
            .Where(p => productIds.Contains(p.Id))
            .ToDictionaryAsync(p => p.Id);

        if (products.Count != productIds.Count)
            return BadRequest(new { message = "One or more products not found" });

        var order = new Order
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            CustomerName = request.CustomerName,
            CustomerEmail = request.CustomerEmail,
            Status = OrderStatus.Pending
        };

        foreach (var item in request.Items)
        {
            var product = products[item.ProductId];

            if (product.QuantityOnHand < item.Quantity)
                return BadRequest(new { message = $"Insufficient stock for {product.Name}" });

            order.Items.Add(new OrderItem
            {
                Id = Guid.NewGuid(),
                ProductId = item.ProductId,
                Quantity = item.Quantity,
                UnitPrice = product.Price
            });

            product.QuantityOnHand -= item.Quantity;

            _db.InventoryAdjustments.Add(new InventoryAdjustment
            {
                Id = Guid.NewGuid(),
                ProductId = item.ProductId,
                Type = AdjustmentType.Sale,
                QuantityChange = -item.Quantity,
                Reason = $"Order {order.Id}",
                AdjustedById = userId
            });
        }

        order.Total = order.Items.Sum(i => i.Quantity * i.UnitPrice);

        _db.Orders.Add(order);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = order.Id },
            new OrderResponse(
                order.Id, order.CustomerName, order.CustomerEmail,
                order.Status.ToString(), order.Total, order.CreatedAt,
                order.Items.Select(oi => new OrderItemResponse(
                    oi.Id, oi.ProductId, products[oi.ProductId].Name,
                    oi.Quantity, oi.UnitPrice)).ToList()));
    }

    [HttpPut("{id:guid}/status")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateOrderStatusRequest request)
    {
        var order = await _db.Orders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == id);

        if (order is null) return NotFound();

        var newStatus = Enum.Parse<OrderStatus>(request.Status);

        if (order.Status == OrderStatus.Cancelled)
            return BadRequest(new { message = "Cannot change status of a cancelled order" });

        if (order.Status == OrderStatus.Fulfilled && newStatus != OrderStatus.Cancelled)
            return BadRequest(new { message = "Fulfilled orders can only be cancelled" });

        if (newStatus == OrderStatus.Cancelled && order.Status == OrderStatus.Pending)
        {
            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            foreach (var item in order.Items)
            {
                var product = await _db.Products.FindAsync(item.ProductId);
                if (product is not null)
                {
                    product.QuantityOnHand += item.Quantity;

                    _db.InventoryAdjustments.Add(new InventoryAdjustment
                    {
                        Id = Guid.NewGuid(),
                        ProductId = item.ProductId,
                        Type = AdjustmentType.ManualCorrection,
                        QuantityChange = item.Quantity,
                        Reason = $"Order {order.Id} cancelled",
                        AdjustedById = userId
                    });
                }
            }
        }

        order.Status = newStatus;
        order.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return Ok(new { status = order.Status.ToString() });
    }
}
