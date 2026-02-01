using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;
using TestService.Application.Interfaces;

namespace TestService.Infrastructure.Persistence;

/// <summary>
/// Базовая реализация репозитория
/// </summary>
public class RepositoryBase<TEntity, TDbContext> : IRepositoryBase<TEntity>
    where TEntity : class
    where TDbContext : DbContext
{
    private readonly TDbContext _context;
    private readonly DbSet<TEntity> _set;

    public RepositoryBase(TDbContext context)
    {
        _context = context;
        _set = context.Set<TEntity>();
    }

    public IQueryable<TEntity> Query() => _set.AsQueryable();

    public Task<TEntity?> GetByIdAsync(object id, CancellationToken cancellationToken = default)
        => _set.FindAsync(new[] { id }, cancellationToken).AsTask();

    public Task<List<TEntity>> GetAsync(Expression<Func<TEntity, bool>> filter, CancellationToken cancellationToken = default)
        => _set.Where(filter).ToListAsync(cancellationToken);

    public async Task<TEntity> AddAsync(TEntity entity, CancellationToken cancellationToken = default)
    {
        await _set.AddAsync(entity, cancellationToken);
        return entity;
    }

    public Task AddRangeAsync(IEnumerable<TEntity> entities, CancellationToken cancellationToken = default)
        => _set.AddRangeAsync(entities, cancellationToken);

    public Task UpdateAsync(TEntity entity, CancellationToken cancellationToken = default)
    {
        _set.Update(entity);
        return Task.CompletedTask;
    }

    public void Remove(TEntity entity)
    {
        _set.Remove(entity);
    }

    public void RemoveRange(IEnumerable<TEntity> entities)
    {
        _set.RemoveRange(entities);
    }
}


