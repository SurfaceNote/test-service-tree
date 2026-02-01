using Microsoft.EntityFrameworkCore;
using TestService.Application.Interfaces;

namespace TestService.Infrastructure.Persistence;

/// <summary>
/// Реализация паттерна Unit of Work
/// </summary>
public class UnitOfWork<TDbContext> : IUnitOfWork
    where TDbContext : DbContext
{
    private readonly TDbContext _context;

    public UnitOfWork(TDbContext context)
    {
        _context = context;
    }

    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task<IDatabaseTransaction> BeginTransactionAsync(CancellationToken cancellationToken = default)
    {
        var transaction = await _context.Database.BeginTransactionAsync(cancellationToken);
        return new DatabaseTransaction(transaction);
    }
}


