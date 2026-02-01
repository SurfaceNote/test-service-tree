namespace TestService.Application.Interfaces;

/// <summary>
/// Транзакция базы данных
/// </summary>
public interface IDatabaseTransaction : IAsyncDisposable
{
    /// <summary>
    /// Зафиксировать транзакцию
    /// </summary>
    Task CommitAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Откатить транзакцию
    /// </summary>
    Task RollbackAsync(CancellationToken cancellationToken = default);
}


