namespace GymCore.Api.Models;

public class Plano
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public decimal ValorMensal { get; set; }
    public string Beneficios { get; set; } = string.Empty; // CSV
    public bool Destaque { get; set; } = false;
}
