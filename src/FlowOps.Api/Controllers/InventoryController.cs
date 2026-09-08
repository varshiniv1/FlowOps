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
public class InventoryController : ControllerBase
{
    private readonly AppDbContext _db;

    public InventoryController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet("{productId:guid}/history")]
    public async Task<ActionResult<List<InventoryAdjustmentResponse>>> GetHistory(Guid productId)
    {
        var productExists = await _db.Products.AnyAsync(p => p.Id == productId);
        if (!productExists) return NotFound();

        var history = await _db.InventoryAdjustments
            .Where(ia => ia.ProductId == productId)
            .Include(ia => ia.AdjustedBy)
            .OrderByDescending(ia => ia.CreatedAt)
            .Select(ia => new InventoryAdjustmentResponse(
                ia.Id,
                ia.Type.ToString(),
                ia.QuantityChange,
                ia.Reason,
                ia.AdjustedBy.FullName ?? ia.AdjustedBy.Email,
                ia.CreatedAt))
            .ToListAsync();

        return Ok(history);
    }

    [HttpPost("{productId:guid}/adjust")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<InventoryAdjustmentResponse>> Adjust(
        Guid productId, [FromBody] AdjustInventoryRequest request)
    {
        var product = await _db.Products.FindAsync(productId);
        if (product is null) return NotFound();

        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var user = await _db.Users.FindAsync(userId);

        var adjustmentType = Enum.Parse<AdjustmentType>(request.Type);

        product.QuantityOnHand += request.QuantityChange;

        if (product.QuantityOnHand < 0)
            return BadRequest(new { message = "Adjustment would result in negative stock" });

        var adjustment = new InventoryAdjustment
        {
            Id = Guid.NewGuid(),
            ProductId = productId,
            Type = adjustmentType,
            QuantityChange = request.QuantityChange,
            Reason = request.Reason,
            AdjustedById = userId
        };

        _db.InventoryAdjustments.Add(adjustment);
        product.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return Ok(new InventoryAdjustmentResponse(
            adjustment.Id,
            adjustment.Type.ToString(),
            adjustment.QuantityChange,
            adjustment.Reason,
            user?.FullName ?? user?.Email ?? "",
            adjustment.CreatedAt));
    }
}
