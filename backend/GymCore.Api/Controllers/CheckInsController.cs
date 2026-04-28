using GymCore.Api.Data;
using GymCore.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GymCore.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CheckInsController : ControllerBase
{
    private readonly AppDbContext _context;

    public CheckInsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<CheckIn>>> Get()
    {
        return await _context.CheckIns.OrderByDescending(c => c.DataHora).Take(20).ToListAsync();
    }

    [HttpPost]
    public async Task<ActionResult<CheckIn>> Post(CheckIn checkIn)
    {
        _context.CheckIns.Add(checkIn);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(Get), new { id = checkIn.Id }, checkIn);
    }
}
