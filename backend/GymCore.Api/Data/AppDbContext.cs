using GymCore.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace GymCore.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Aluno> Alunos => Set<Aluno>();
    public DbSet<Transacao> Transacoes => Set<Transacao>();
    public DbSet<Treino> Treinos => Set<Treino>();
    public DbSet<Plano> Planos => Set<Plano>();
    public DbSet<CheckIn> CheckIns => Set<CheckIn>();
    public DbSet<Usuario> Usuarios => Set<Usuario>();
}