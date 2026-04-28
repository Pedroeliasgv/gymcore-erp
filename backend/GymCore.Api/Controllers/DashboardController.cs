using GymCore.Api.Data;
using GymCore.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GymCore.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DashboardController : ControllerBase
{
    private readonly AppDbContext _context;

    public DashboardController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<object>> Get()
    {
        var alunos = await _context.Alunos.ToListAsync();
        var transacoes = await _context.Transacoes.ToListAsync();
        var checkins = await _context.CheckIns.Where(c => c.DataHora.Date == DateTime.Today).ToListAsync();

        int alunosAtivos = alunos.Count(a => a.Status == "Ativo");
        decimal receitaMensal = transacoes
            .Where(t => t.Tipo == "Entrada" && t.Status == "Pago" && t.Data.Month == DateTime.Now.Month)
            .Sum(t => t.Valor);
            
        int totalAlunos = alunos.Count > 0 ? alunos.Count : 1;
        int inadimplentes = alunos.Count(a => a.Status == "Inadimplente");
        int taxaInadimplencia = (int)Math.Round((double)inadimplentes / totalAlunos * 100);

        return new
        {
            AlunosAtivos = alunosAtivos,
            ReceitaMensal = receitaMensal,
            Inadimplencia = taxaInadimplencia,
            CheckInsHoje = checkins.Count,
            GraficoReceita = new[] { 32000, 34500, 36000, 38200, 41000, (int)receitaMensal } // Dados mockados + real
        };
    }
}
