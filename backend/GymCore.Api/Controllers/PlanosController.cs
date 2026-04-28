using GymCore.Api.Data;
using GymCore.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GymCore.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PlanosController : ControllerBase
{
    private readonly AppDbContext _context;

    public PlanosController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Plano>>> Get()
    {
        return await _context.Planos.ToListAsync();
    }

    [HttpPost]
    public async Task<ActionResult<Plano>> Post(Plano plano)
    {
        _context.Planos.Add(plano);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(Get), new { id = plano.Id }, plano);
    }
}
