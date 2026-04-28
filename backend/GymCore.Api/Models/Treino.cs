namespace GymCore.Api.Models;

public class Treino
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string Nivel { get; set; } = "Iniciante";
    public string Descricao { get; set; } = string.Empty;
    public string Instrutor { get; set; } = string.Empty;
    public int QuantidadeAlunos { get; set; } = 0;
}
