namespace GymCore.Api.Models;

public class Aluno
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string Cpf { get; set; } = string.Empty;
    public string Plano { get; set; } = "Mensal";
    public string Status { get; set; } = "Ativo";
}