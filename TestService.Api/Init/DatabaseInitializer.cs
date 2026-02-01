using Microsoft.EntityFrameworkCore;
using TestService.Infrastructure.Persistence;

namespace TestService.Api.Init;

/// <summary>
/// Инициализация базы данных
/// </summary>
public static class DatabaseInitializer
{
    /// <summary>
    /// Регистрация базы данных
    /// </summary>
    public static IServiceCollection AddDatabaseConfiguration(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseSqlite(configuration.GetConnectionString("DefaultConnection")));

        return services;
    }

    /// <summary>
    /// Применение миграций при запуске приложения
    /// </summary>
    public static async Task ApplyMigrationsAsync(this IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        await context.Database.MigrateAsync();
    }
}


