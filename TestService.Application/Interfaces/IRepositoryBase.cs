using System.Linq.Expressions;

namespace TestService.Application.Interfaces;

/// <summary>
/// Базовый репозиторий для работы с сущностями
/// </summary>
public interface IRepositoryBase<TEntity> where TEntity : class
{
    /// <summary>
    /// Получить IQueryable для построения запросов
    /// </summary>
    IQueryable<TEntity> Query();

    /// <summary>
    /// Получить сущность по идентификатору
    /// </summary>
    Task<TEntity?> GetByIdAsync(object id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Получить список сущностей по фильтру
    /// </summary>
    Task<List<TEntity>> GetAsync(Expression<Func<TEntity, bool>> filter, CancellationToken cancellationToken = default);

    /// <summary>
    /// Добавить новую сущность
    /// </summary>
    Task<TEntity> AddAsync(TEntity entity, CancellationToken cancellationToken = default);

    /// <summary>
    /// Добавить несколько сущностей
    /// </summary>
    Task AddRangeAsync(IEnumerable<TEntity> entities, CancellationToken cancellationToken = default);

    /// <summary>
    /// Обновить сущность
    /// </summary>
    Task UpdateAsync(TEntity entity, CancellationToken cancellationToken = default);

    /// <summary>
    /// Удалить сущность
    /// </summary>
    void Remove(TEntity entity);

    /// <summary>
    /// Удалить несколько сущностей
    /// </summary>
    void RemoveRange(IEnumerable<TEntity> entities);
}


