namespace TestService.Application.Interfaces;

/// <summary>
/// Паттерн Unit of Work для работы с транзакциями
/// </summary>
public interface IUnitOfWork
{
    /// <summary>
    /// Сохранить изменения в базе данных
    /// </summary>
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Начать транзакцию
    /// </summary>
    Task<IDatabaseTransaction> BeginTransactionAsync(CancellationToken cancellationToken = default);
}


