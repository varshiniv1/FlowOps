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
public class ProductsController : ControllerBase
{
    private readonly AppDbContext _db;

    public ProductsController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<List<ProductResponse>>> GetAll()
    {
        var products = await _db.Products
            .OrderBy(p => p.Name)
            .Select(p => new ProductResponse(
                p.Id, p.Sku, p.Name, p.Description,
                p.Price, p.QuantityOnHand, p.ImageUrl, p.CreatedAt))
            .ToListAsync();

        return Ok(products);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ProductResponse>> GetById(Guid id)
    {
        var p = await _db.Products.FindAsync(id);
        if (p is null) return NotFound();

        return Ok(new ProductResponse(
            p.Id, p.Sku, p.Name, p.Description,
            p.Price, p.QuantityOnHand, p.ImageUrl, p.CreatedAt));
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
            product.Price, product.QuantityOnHand, product.ImageUrl, product.CreatedAt));
    }
}
