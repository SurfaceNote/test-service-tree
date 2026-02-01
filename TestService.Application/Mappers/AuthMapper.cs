using TestService.Application.DTOs;
using TestService.Domain.Models;

namespace TestService.Application.Mappers;

/// <summary>
/// Маппер для преобразования результатов аутентификации в DTO
/// </summary>
public static class AuthMapper
{
    /// <summary>
    /// Преобразовать доменную модель AuthResult в DTO
    /// </summary>
    public static LoginResponseDto ToDto(this AuthResult authResult)
    {
        return new LoginResponseDto
        {
            AccessToken = authResult.AccessToken,
            RefreshToken = authResult.RefreshToken,
            Username = authResult.Username,
            Role = authResult.Role.ToString(),
            ExpiresAt = authResult.ExpiresAt
        };
    }
}
