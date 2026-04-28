using GymCore.Api.Data;
using GymCore.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GymCore.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TreinosController : ControllerBase
{
    private readonly AppDbContext _context;

    public TreinosController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Treino>>> Get()
    {
        return await _context.Treinos.ToListAsync();
    }

    [HttpPost]
    public async Task<ActionResult<Treino>> Post(Treino treino)
    {
        _context.Treinos.Add(treino);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(Get), new { id = treino.Id }, treino);
    }
}
