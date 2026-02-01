namespace TestService.Domain.Enums;

/// <summary>
/// Роли пользователей в системе
/// </summary>
public enum UserRole
{
    /// <summary>
    /// Обычный пользователь (только чтение и создание)
    /// </summary>
    User = 0,

    /// <summary>
    /// Администратор (полный доступ)
    /// </summary>
    Admin = 1
}


