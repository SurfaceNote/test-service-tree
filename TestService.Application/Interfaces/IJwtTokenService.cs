using TestService.Domain.Models;

namespace TestService.Application.Interfaces;

/// <summary>
/// Сервис для работы с JWT токенами
/// </summary>
public interface IJwtTokenService
{
    /// <summary>
    /// Сгенерировать Access токен
    /// </summary>
    string GenerateAccessToken(TokenPayload payload);

    /// <summary>
    /// Сгенерировать Refresh токен
    /// </summary>
    string GenerateRefreshToken();
}


