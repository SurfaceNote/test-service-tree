using TestService.Domain.Enums;

namespace TestService.Domain.Models;

/// <summary>
/// Результат аутентификации с токенами
/// </summary>
public class AuthResult
{
    /// <summary>
    /// JWT Access Token
    /// </summary>
    public string AccessToken { get; set; } = string.Empty;

    /// <summary>
    /// Refresh Token
    /// </summary>
    public string RefreshToken { get; set; } = string.Empty;

    /// <summary>
    /// Имя пользователя
    /// </summary>
    public string Username { get; set; } = string.Empty;

    /// <summary>
    /// Роль пользователя
    /// </summary>
    public UserRole Role { get; set; }

    /// <summary>
    /// Время истечения access токена
    /// </summary>
    public DateTime ExpiresAt { get; set; }
}

