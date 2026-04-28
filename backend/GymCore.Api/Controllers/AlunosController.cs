using GymCore.Api.Data;
using GymCore.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GymCore.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AlunosController : ControllerBase
{
    private readonly AppDbContext _context;

    public AlunosController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<List<Aluno>>> Get()
    {
        return await _context.Alunos.ToListAsync();
    }

    [HttpPost]
    public async Task<ActionResult<Aluno>> Post(Aluno aluno)
    {
        _context.Alunos.Add(aluno);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(Get), new { id = aluno.Id }, aluno);
    }
}