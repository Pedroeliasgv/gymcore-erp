using GymCore.Api.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

builder.Services.AddCors(options =>
{
    options.AddPolicy("PermitirFrontend", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Usa a variável de ambiente DATABASE_PATH se existir (ex: Railway),
// caso contrário usa o arquivo local gymcore.db
var dbPath = Environment.GetEnvironmentVariable("DATABASE_PATH") ?? "gymcore.db";

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite($"Data Source={dbPath}"));

var app = builder.Build();

// Aplica migrações automaticamente ao iniciar (cria o banco se não existir)
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
}

app.UseCors("PermitirFrontend");

app.MapControllers();

app.Run();