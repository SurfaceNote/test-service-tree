using TestService.Domain.Enums;
using TestService.Domain.Models;

namespace TestService.Domain.Interfaces;

/// <summary>
/// Интерфейс сервиса аутентификации
/// </summary>
public interface IAuthService
{
    /// <summary>
    /// Вход в систему
    /// </summary>
    Task<AuthResult> LoginAsync(string username, string password, CancellationToken cancellationToken = default);

    /// <summary>
    /// Регистрация нового пользователя
    /// </summary>
    Task<AuthResult> RegisterAsync(string username, string password, UserRole role, CancellationToken cancellationToken = default);

    /// <summary>
    /// Обновление токена доступа по UserId и RefreshToken
    /// </summary>
    Task<AuthResult> RefreshTokenAsync(Guid userId, string refreshToken, CancellationToken cancellationToken = default);
}
