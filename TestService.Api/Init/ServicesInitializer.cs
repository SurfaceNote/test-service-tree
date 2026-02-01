using TestService.Application.Interfaces;
using TestService.Application.Services;
using TestService.Domain.Interfaces;
using TestService.Infrastructure.Services;

namespace TestService.Api.Init;

/// <summary>
/// Инициализация сервисов
/// </summary>
public static class ServicesInitializer
{
    /// <summary>
    /// Регистрация сервисов приложения в DI контейнере
    /// </summary>
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        // Сервисы приложения
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<ITreeService, TreeService>();

        // Инфраструктурные сервисы
        services.AddSingleton<IJwtTokenService, JwtTokenService>();

        return services;
    }
}


