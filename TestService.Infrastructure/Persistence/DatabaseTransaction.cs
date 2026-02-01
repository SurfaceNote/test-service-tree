using Microsoft.EntityFrameworkCore.Storage;
using TestService.Application.Interfaces;

namespace TestService.Infrastructure.Persistence;

/// <summary>
/// Реализация транзакции базы данных
/// </summary>
public class DatabaseTransaction : IDatabaseTransaction
{
    private readonly IDbContextTransaction _transaction;

    public DatabaseTransaction(IDbContextTransaction transaction)
    {
        _transaction = transaction;
    }

    public Task CommitAsync(CancellationToken cancellationToken = default)
        => _transaction.CommitAsync(cancellationToken);

    public Task RollbackAsync(CancellationToken cancellationToken = default)
        => _transaction.RollbackAsync(cancellationToken);

    public ValueTask DisposeAsync()
        => _transaction.DisposeAsync();
}


