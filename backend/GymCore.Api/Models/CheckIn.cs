namespace GymCore.Api.Models;

public class CheckIn
{
    public int Id { get; set; }
    public DateTime DataHora { get; set; } = DateTime.Now;
    public string NomeAluno { get; set; } = string.Empty;
    public string Status { get; set; } = "Liberado"; // Liberado ou Bloqueado
    public string Motivo { get; set; } = string.Empty; // Ex: "Plano OK", "Inadimplente"
}
