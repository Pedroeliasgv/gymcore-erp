using GymCore.Api.Data;
using GymCore.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GymCore.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TransacoesController : ControllerBase
{
    private readonly AppDbContext _context;

    public TransacoesController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Transacao>>> Get()
    {
        return await _context.Transacoes.OrderByDescending(t => t.Data).ToListAsync();
    }

    [HttpPost]
    public async Task<ActionResult<Transacao>> Post(Transacao transacao)
    {
        _context.Transacoes.Add(transacao);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(Get), new { id = transacao.Id }, transacao);
    }
}
