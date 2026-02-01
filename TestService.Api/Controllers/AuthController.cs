using Microsoft.AspNetCore.Mvc;
using TestService.Api.Attributes;
using TestService.Api.Wrappers;
using TestService.Application.DTOs;
using TestService.Application.Mappers;
using TestService.Domain.Enums;
using System.Security.Claims;
using TestService.Domain.Interfaces;

namespace TestService.Api.Controllers;

/// <summary>
/// Контролер аутентификации
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    /// <summary>
    /// Вход в систему
    /// </summary>
    [HttpPost("login")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Login([FromBody] LoginRequest request, CancellationToken cancellationToken)
    {
        var authResult = await _authService.LoginAsync(request.Username, request.Password, cancellationToken);
        var dto = authResult.ToDto();
        return Ok(ApiResultContainer<LoginResponseDto>.SuccessResult(dto));
    }

    /// <summary>
    /// Регистрация нового пользователя
    /// </summary>
    [HttpPost("register")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request, CancellationToken cancellationToken)
    {
        var authResult = await _authService.RegisterAsync(request.Username, request.Password, request.Role, cancellationToken);
        var dto = authResult.ToDto();
        return CreatedAtAction(nameof(Login), ApiResultContainer<LoginResponseDto>.SuccessResult(dto));
    }

    /// <summary>
    /// Обновление токена доступа
    /// </summary>
    [HttpPost("refresh")]
    [AuthorizeWithExpiredToken]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequest request, CancellationToken cancellationToken)
    {
        // Получить UserId из claims авторизованного пользователя
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            return Unauthorized(ApiResultContainer<object>.ErrorResult("Не удалось получить идентификатор пользователя из токена"));

        var authResult = await _authService.RefreshTokenAsync(userId, request.RefreshToken, cancellationToken);
        var dto = authResult.ToDto();
        return Ok(ApiResultContainer<LoginResponseDto>.SuccessResult(dto));
    }
}

public record LoginRequest(string Username, string Password);
public record RegisterRequest(string Username, string Password, UserRole Role = UserRole.User);
public record RefreshTokenRequest(string RefreshToken);


