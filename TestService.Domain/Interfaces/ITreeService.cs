using TestService.Domain.Entities;
using TestService.Domain.Models;

namespace TestService.Domain.Interfaces;

/// <summary>
/// Интерфейс сервиса управления древовидной структурой
/// </summary>
public interface ITreeService
{
    /// <summary>
    /// Получить узел по идентификатору
    /// </summary>
    Task<TreeNode> GetNodeByIdAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Получить все узлы
    /// </summary>
    Task<List<TreeNode>> GetAllNodesAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Создать новый узел
    /// </summary>
    Task<TreeNode> CreateNodeAsync(string name, Guid? parentId, Guid userId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Обновить узел
    /// </summary>
    Task<TreeNode> UpdateNodeAsync(Guid id, string? name, Guid? parentId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Удалить узел и всех его потомков
    /// </summary>
    Task DeleteNodeAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Экспортировать дерево
    /// </summary>
    Task<List<TreeExportModel>> ExportTreeAsync(CancellationToken cancellationToken = default);
}
