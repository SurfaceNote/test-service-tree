using TestService.Domain.Enums;

namespace TestService.Domain.Models;

/// <summary>
/// Полезная нагрузка JWT токена
/// </summary>
public class TokenPayload
{
    /// <summary>
    /// Идентификатор пользователя
    /// </summary>
    public Guid UserId { get; set; }

    /// <summary>
    /// Имя пользователя
    /// </summary>
    public string Username { get; set; } = string.Empty;

    /// <summary>
    /// Роль пользователя
    /// </summary>
    public UserRole Role { get; set; }
}


