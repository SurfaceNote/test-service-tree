namespace TestService.Domain.Exceptions;

/// <summary>
/// Базовое исключение для бизнес-логики
/// </summary>
public class BusinessException : Exception
{
    public BusinessException(string message) : base(message)
    {
    }

    public BusinessException(string message, Exception innerException) 
        : base(message, innerException)
    {
    }
}

/// <summary>
/// Исключение, когда сущность не найдена
/// </summary>
public class NotFoundException : BusinessException
{
    public NotFoundException(string message) : base(message)
    {
    }
}

/// <summary>
/// Исключение при нарушении бизнес-правил
/// </summary>
public class ValidationException : BusinessException
{
    public ValidationException(string message) : base(message)
    {
    }
}

/// <summary>
/// Исключение при конфликте данных
/// </summary>
public class ConflictException : BusinessException
{
    public ConflictException(string message) : base(message)
    {
    }
}

