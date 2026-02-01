namespace TestService.Application.DTOs;

/// <summary>
/// DTO для ответа при входе/регистрации
/// </summary>
public class LoginResponseDto
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
    public string Role { get; set; } = string.Empty;

    /// <summary>
    /// Время истечения access токена
    /// </summary>
    public DateTime ExpiresAt { get; set; }
}

