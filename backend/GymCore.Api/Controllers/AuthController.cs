using GymCore.Api.Data;
using GymCore.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GymCore.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;

    public AuthController(AppDbContext context)
    {
        _context = context;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var usuario = await _context.Usuarios.FirstOrDefaultAsync(u => u.Email == request.Email && u.Senha == request.Senha);
        
        if (usuario != null)
        {
            return Ok(new { 
                Success = true, 
                Token = "ugym-auth-token-" + Guid.NewGuid().ToString(), 
                User = usuario.Nome,
                UserId = usuario.Id,
                Email = usuario.Email
            });
        }
        
        // Fallback for demo admin
        if (request.Email == "admin@ugym.com" && request.Senha == "admin123")
        {
            return Ok(new { 
                Success = true, 
                Token = "ugym-auth-token-xyz987", 
                User = "Administrador",
                UserId = 0,
                Email = "admin@ugym.com"
            });
        }
        
        return Unauthorized(new { 
            Success = false, 
            Message = "E-mail ou senha inválidos." 
        });
    }

    [HttpPut("profile/{id}")]
    public async Task<IActionResult> UpdateProfile(int id, [FromBody] UpdateProfileRequest request)
    {
        var usuario = await _context.Usuarios.FindAsync(id);
        if (usuario == null) return NotFound(new { Success = false, Message = "Usuário não encontrado." });

        usuario.Nome = request.Nome;
        usuario.Email = request.Email;
        if (!string.IsNullOrEmpty(request.NovaSenha))
        {
            usuario.Senha = request.NovaSenha;
        }

        await _context.SaveChangesAsync();
        return Ok(new { Success = true, Message = "Perfil atualizado com sucesso!", User = usuario.Nome, Email = usuario.Email });
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        if (await _context.Usuarios.AnyAsync(u => u.Email == request.Email))
        {
            return BadRequest(new { Success = false, Message = "Este e-mail já está em uso." });
        }

        var novoUsuario = new Usuario
        {
            Nome = request.Nome,
            Email = request.Email,
            Senha = request.Senha
        };

        _context.Usuarios.Add(novoUsuario);
        await _context.SaveChangesAsync();

        return Ok(new { Success = true, Message = "Usuário cadastrado com sucesso!" });
    }
}

public class LoginRequest
{
    public string Email { get; set; } = string.Empty;
    public string Senha { get; set; } = string.Empty;
}

public class RegisterRequest
{
    public string Nome { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Senha { get; set; } = string.Empty;
}

public class UpdateProfileRequest
{
    public string Nome { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string NovaSenha { get; set; } = string.Empty;
}
