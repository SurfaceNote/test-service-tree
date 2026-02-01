using Microsoft.EntityFrameworkCore;
using TestService.Domain.Entities;

namespace TestService.Infrastructure.Persistence;

/// <summary>
/// Контекст базы данных приложения
/// </summary>
public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    /// <summary>
    /// Узлы дерева
    /// </summary>
    public DbSet<TreeNode> TreeNodes => Set<TreeNode>();

    /// <summary>
    /// Пользователи
    /// </summary>
    public DbSet<User> Users => Set<User>();

    /// <summary>
    /// Refresh токены
    /// </summary>
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Применить все конфигурации из текущей сборки
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);
    }
}


