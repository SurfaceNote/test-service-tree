namespace TestService.Api.Wrappers;

/// <summary>
/// Контейнер для результата API запроса без данных
/// </summary>
public class ApiResultContainer
{
    public bool Success { get; set; }
    public string? Message { get; set; }

    public static ApiResultContainer SuccessResult(string? message = null)
    {
        return new ApiResultContainer
        {
            Success = true,
            Message = message
        };
    }

    public static ApiResultContainer ErrorResult(string message)
    {
        return new ApiResultContainer
        {
            Success = false,
            Message = message
        };
    }
}

/// <summary>
/// Контейнер для результата API запроса с данными
/// </summary>
public class ApiResultContainer<T> : ApiResultContainer
{
    public T? Data { get; set; }

    public static ApiResultContainer<T> SuccessResult(T data, string? message = null)
    {
        return new ApiResultContainer<T>
        {
            Success = true,
            Data = data,
            Message = message
        };
    }

    public new static ApiResultContainer<T> ErrorResult(string message)
    {
        return new ApiResultContainer<T>
        {
            Success = false,
            Message = message
        };
    }
}

