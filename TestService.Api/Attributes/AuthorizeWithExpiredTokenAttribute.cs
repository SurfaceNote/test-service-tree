using Microsoft.AspNetCore.Authorization;

namespace TestService.Api.Attributes;

/// <summary>
/// Атрибут авторизации, который разрешает использование истекших токенов.
/// Используется для эндпоинта refresh token.
/// </summary>
public class AuthorizeWithExpiredTokenAttribute : AuthorizeAttribute
{
    public AuthorizeWithExpiredTokenAttribute()
    {
        AuthenticationSchemes = "BearerWithExpiredToken";
    }
}

