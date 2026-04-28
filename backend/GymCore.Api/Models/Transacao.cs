namespace GymCore.Api.Models;

public class Transacao
{
    public int Id { get; set; }
    public DateTime Data { get; set; } = DateTime.Now;
    public string Descricao { get; set; } = string.Empty;
    public string Tipo { get; set; } = "Entrada"; // Entrada ou Saida
    public decimal Valor { get; set; }
    public string Status { get; set; } = "Pago"; // Pago ou Pendente
}
