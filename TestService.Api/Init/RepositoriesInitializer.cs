using TestService.Application.Interfaces;
using TestService.Domain.Entities;
using TestService.Infrastructure.Persistence;

namespace TestService.Api.Init;

/// <summary>
/// Инициализация репозиториев
/// </summary>
public static class RepositoriesInitializer
{
    /// <summary>
    /// Регистрация репозиториев в DI контейнере
    /// </summary>
    public static IServiceCollection AddRepositories(this IServiceCollection services)
    {
        // Регистрация generic репозиториев
        services.AddScoped<IRepositoryBase<TreeNode>, RepositoryBase<TreeNode, ApplicationDbContext>>();
        services.AddScoped<IRepositoryBase<User>, RepositoryBase<User, ApplicationDbContext>>();
        services.AddScoped<IRepositoryBase<RefreshToken>, RepositoryBase<RefreshToken, ApplicationDbContext>>();

        // Регистрация Unit of Work
        services.AddScoped<IUnitOfWork, UnitOfWork<ApplicationDbContext>>();

        return services;
    }
}


