using FlowOps.Api.Data;
using FlowOps.Api.Models.DTOs;
using FlowOps.Api.Models.Entities;
using FlowOps.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FlowOps.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProductsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly S3StorageService _storage;

    public ProductsController(AppDbContext db, S3StorageService storage)
    {
        _db = db;
        _storage = storage;
    }

    [HttpGet]
    public async Task<ActionResult<List<ProductResponse>>> GetAll()
    {
        var products = await _db.Products
            .OrderBy(p => p.Name)
            .ToListAsync();

        var response = products.Select(p => new ProductResponse(
            p.Id, p.Sku, p.Name, p.Description,
            p.Price, p.QuantityOnHand,
            p.ImageUrl != null ? _storage.GetPresignedUrl(p.ImageUrl) : null,
            p.CreatedAt)).ToList();

        return Ok(response);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ProductResponse>> GetById(Guid id)
    {
        var p = await _db.Products.FindAsync(id);
        if (p is null) return NotFound();

        return Ok(new ProductResponse(
            p.Id, p.Sku, p.Name, p.Description,
            p.Price, p.QuantityOnHand,
            p.ImageUrl != null ? _storage.GetPresignedUrl(p.ImageUrl) : null,
            p.CreatedAt));
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ProductResponse>> Create([FromBody] CreateProductRequest request)
    {
        if (await _db.Products.AnyAsync(p => p.Sku == request.Sku))
            return Conflict(new { message = "SKU already exists" });

        var product = new Product
        {
            Id = Guid.NewGuid(),
            Sku = request.Sku,
            Name = request.Name,
            Description = request.Description,
            Price = request.Price,
            QuantityOnHand = request.QuantityOnHand
        };

        _db.Products.Add(product);
        await _db.SaveChangesAsync();

        var response = new ProductResponse(
            product.Id, product.Sku, product.Name, product.Description,
            product.Price, product.QuantityOnHand, product.ImageUrl, product.CreatedAt);

        return CreatedAtAction(nameof(GetById), new { id = product.Id }, response);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ProductResponse>> Update(Guid id, [FromBody] UpdateProductRequest request)
    {
        var product = await _db.Products.FindAsync(id);
        if (product is null) return NotFound();

        product.Name = request.Name;
        product.Description = request.Description;
        product.Price = request.Price;
        product.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return Ok(new ProductResponse(
            product.Id, product.Sku, product.Name, product.Description,
            product.Price, product.QuantityOnHand,
            product.ImageUrl != null ? _storage.GetPresignedUrl(product.ImageUrl) : null,
            product.CreatedAt));
    }

    [HttpPost("{id:guid}/image")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> UploadImage(Guid id, IFormFile file)
    {
        var product = await _db.Products.FindAsync(id);
        if (product is null) return NotFound();

        if (file.Length == 0 || file.Length > 5 * 1024 * 1024)
            return BadRequest("File must be between 1 byte and 5MB");

        var allowed = new[] { "image/jpeg", "image/png", "image/webp" };
        if (!allowed.Contains(file.ContentType))
            return BadRequest("Only JPEG, PNG, and WebP images are allowed");

        if (product.ImageUrl != null)
            await _storage.DeleteAsync(product.ImageUrl);

        using var stream = file.OpenReadStream();
        var key = await _storage.UploadAsync(stream, file.FileName, file.ContentType);

        product.ImageUrl = key;
        product.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return Ok(new { imageUrl = _storage.GetPresignedUrl(key) });
    }

    [HttpDelete("{id:guid}/image")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> DeleteImage(Guid id)
    {
        var product = await _db.Products.FindAsync(id);
        if (product is null) return NotFound();
        if (product.ImageUrl is null) return NoContent();

        await _storage.DeleteAsync(product.ImageUrl);
        product.ImageUrl = null;
        product.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return NoContent();
    }
}
