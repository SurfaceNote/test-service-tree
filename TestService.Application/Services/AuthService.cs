using Microsoft.EntityFrameworkCore;
using TestService.Application.Interfaces;
using TestService.Domain.Entities;
using TestService.Domain.Enums;
using TestService.Domain.Exceptions;
using TestService.Domain.Interfaces;
using TestService.Domain.Models;

namespace TestService.Application.Services;

/// <summary>
/// Реализация сервиса аутентификации
/// </summary>
public class AuthService : IAuthService
{
    private readonly IRepositoryBase<User> _userRepository;
    private readonly IRepositoryBase<RefreshToken> _refreshTokenRepository;
    private readonly IJwtTokenService _jwtTokenService;
    private readonly IUnitOfWork _unitOfWork;

    public AuthService(
        IRepositoryBase<User> userRepository,
        IRepositoryBase<RefreshToken> refreshTokenRepository,
        IJwtTokenService jwtTokenService,
        IUnitOfWork unitOfWork)
    {
        _userRepository = userRepository;
        _refreshTokenRepository = refreshTokenRepository;
        _jwtTokenService = jwtTokenService;
        _unitOfWork = unitOfWork;
    }

    public async Task<AuthResult> LoginAsync(
        string username,
        string password,
        CancellationToken cancellationToken = default)
    {
        // Найти пользователя
        var user = await _userRepository.Query()
            .FirstOrDefaultAsync(u => u.Username == username, cancellationToken);

        if (user == null || !BCrypt.Net.BCrypt.Verify(password, user.PasswordHash))
            throw new ValidationException("Неверное имя пользователя или пароль");

        // Создать токены
        var response = await CreateTokensAsync(user, cancellationToken);

        return response;
    }

    public async Task<AuthResult> RegisterAsync(
        string username,
        string password,
        UserRole role,
        CancellationToken cancellationToken = default)
    {
        // Проверить, что роль является допустимым значением enum
        if (!Enum.IsDefined(typeof(UserRole), role))
            throw new ValidationException("Указана недопустимая роль пользователя");

        // Проверить, существует ли пользователь
        var existingUser = await _userRepository.Query()
            .FirstOrDefaultAsync(u => u.Username == username, cancellationToken);

        if (existingUser != null)
            throw new ConflictException("Пользователь с таким именем уже существует");

        // Создать пользователя
        var user = new User
        {
            Username = username,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
            Role = role,
            CreatedAt = DateTime.UtcNow
        };

        await _userRepository.AddAsync(user, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Создать токены
        var response = await CreateTokensAsync(user, cancellationToken);

        return response;
    }

    public async Task<AuthResult> RefreshTokenAsync(
        Guid userId,
        string refreshToken,
        CancellationToken cancellationToken = default)
    {
        // 1. Найти refresh токен в БД по UserId + RefreshToken
        var token = await _refreshTokenRepository.Query()
            .Include(rt => rt.User)
            .FirstOrDefaultAsync(rt => rt.UserId == userId && rt.Token == refreshToken, cancellationToken);

        if (token == null || token.IsRevoked)
            throw new ValidationException("Недействительный RefreshToken");

        if (token.ExpiresAt < DateTime.UtcNow)
            throw new ValidationException("RefreshToken истек");

        // 2. Отозвать старый refresh токен
        token.IsRevoked = true;
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // 3. Создать новые токены
        var response = await CreateTokensAsync(token.User, cancellationToken);

        return response;
    }

    private async Task<AuthResult> CreateTokensAsync(User user, CancellationToken cancellationToken)
    {
        var payload = new TokenPayload
        {
            UserId = user.Id,
            Username = user.Username,
            Role = user.Role
        };

        var accessToken = _jwtTokenService.GenerateAccessToken(payload);
        var refreshTokenValue = _jwtTokenService.GenerateRefreshToken();

        // Сохранить refresh токен
        var refreshToken = new RefreshToken
        {
            Token = refreshTokenValue,
            UserId = user.Id,
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = DateTime.UtcNow.AddDays(30),
            IsRevoked = false
        };

        await _refreshTokenRepository.AddAsync(refreshToken, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new AuthResult
        {
            AccessToken = accessToken,
            RefreshToken = refreshTokenValue,
            Username = user.Username,
            Role = user.Role,
            ExpiresAt = DateTime.UtcNow.AddHours(1)
        };
    }
}


