namespace TestService.Domain.Entities;

/// <summary>
/// Refresh токен для обновления JWT токена
/// </summary>
public class RefreshToken
{
    /// <summary>
    /// Уникальный идентификатор токена
    /// </summary>
    public Guid Id { get; set; } = Guid.NewGuid();

    /// <summary>
    /// Значение токена
    /// </summary>
    public string Token { get; set; } = string.Empty;

    /// <summary>
    /// Идентификатор пользователя
    /// </summary>
    public Guid UserId { get; set; }

    /// <summary>
    /// Дата создания токена
    /// </summary>
    public DateTime CreatedAt { get; set; }

    /// <summary>
    /// Дата истечения токена
    /// </summary>
    public DateTime ExpiresAt { get; set; }

    /// <summary>
    /// Признак отозванного токена
    /// </summary>
    public bool IsRevoked { get; set; }
    
    /// <summary>
    /// Пользователь-владелец токена
    /// </summary>
    public User User { get; set; } = null!;
}


