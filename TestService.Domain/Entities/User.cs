using TestService.Domain.Enums;

namespace TestService.Domain.Entities;

/// <summary>
/// Пользователь системы
/// </summary>
public class User
{
    /// <summary>
    /// Уникальный идентификатор пользователя
    /// </summary>
    public Guid Id { get; set; } = Guid.NewGuid();

    /// <summary>
    /// Имя пользователя (логин)
    /// </summary>
    public string Username { get; set; } = string.Empty;

    /// <summary>
    /// Хеш пароля
    /// </summary>
    public string PasswordHash { get; set; } = string.Empty;

    /// <summary>
    /// Роль пользователя
    /// </summary>
    public UserRole Role { get; set; } = UserRole.User;

    /// <summary>
    /// Дата создания пользователя
    /// </summary>
    public DateTime CreatedAt { get; set; }
    
    /// <summary>
    /// Узлы, созданные пользователем
    /// </summary>
    public ICollection<TreeNode> CreatedNodes { get; set; } = new List<TreeNode>();

    /// <summary>
    /// Refresh токены пользователя
    /// </summary>
    public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
}


