using Microsoft.EntityFrameworkCore;
using TestService.Application.Interfaces;
using TestService.Domain.Entities;
using TestService.Domain.Exceptions;
using TestService.Domain.Interfaces;
using TestService.Domain.Models;

namespace TestService.Application.Services;

/// <summary>
/// Реализация сервиса управления древовидной структурой
/// </summary>
public class TreeService : ITreeService
{
    private readonly IRepositoryBase<TreeNode> _treeRepository;
    private readonly IUnitOfWork _unitOfWork;

    public TreeService(
        IRepositoryBase<TreeNode> treeRepository,
        IUnitOfWork unitOfWork)
    {
        _treeRepository = treeRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<TreeNode> GetNodeByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var node = await _treeRepository.GetByIdAsync(id, cancellationToken);

        if (node == null)
            throw new NotFoundException("Узел не найден");

        return node;
    }

    public async Task<List<TreeNode>> GetAllNodesAsync(CancellationToken cancellationToken = default)
    {
        var nodes = await _treeRepository.Query()
            .AsNoTracking()
            .ToListAsync(cancellationToken);

        return nodes;
    }

    public async Task<TreeNode> CreateNodeAsync(
        string name,
        Guid? parentId,
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        // Если указан родитель, проверить его существование
        if (parentId.HasValue)
        {
            var parentExists = await _treeRepository.Query()
                .AnyAsync(n => n.Id == parentId.Value, cancellationToken);

            if (!parentExists)
                throw new NotFoundException("Родительский узел не найден");
        }

        var node = new TreeNode
        {
            Name = name,
            ParentId = parentId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            CreatedBy = userId
        };

        await _treeRepository.AddAsync(node, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return node;
    }

    public async Task<TreeNode> UpdateNodeAsync(
        Guid id,
        string? name,
        Guid? parentId,
        CancellationToken cancellationToken = default)
    {
        await using var transaction = await _unitOfWork.BeginTransactionAsync(cancellationToken);

        try
        {
            var node = await _treeRepository.GetByIdAsync(id, cancellationToken);

            if (node == null)
                throw new NotFoundException("Узел не найден");

            // Обновить поля
            if (!string.IsNullOrWhiteSpace(name))
                node.Name = name;

            // Если меняется ParentId, проверить на циклические ссылки
            if (parentId.HasValue)
            {
                var hasCycle = await HasCircularReferenceAsync(id, parentId.Value, cancellationToken);
                if (hasCycle)
                    throw new ValidationException("Обнаружена циклическая ссылка");

                node.ParentId = parentId;
            }

            node.UpdatedAt = DateTime.UtcNow;

            await _treeRepository.UpdateAsync(node, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);

            return node;
        }
        catch
        {
            await transaction.RollbackAsync(cancellationToken);
            throw;
        }
    }

    public async Task DeleteNodeAsync(Guid id, CancellationToken cancellationToken = default)
    {
        await using var transaction = await _unitOfWork.BeginTransactionAsync(cancellationToken);

        try
        {
            // Получить все узлы для каскадного удаления
            var nodesToDelete = await GetDescendantsAsync(id, cancellationToken);

            if (!nodesToDelete.Any())
                throw new NotFoundException("Узел не найден");

            // Удалить все узлы (от детей к родителям)
            _treeRepository.RemoveRange(nodesToDelete.OrderByDescending(n => n.ParentId.HasValue));

            await _unitOfWork.SaveChangesAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);
        }
        catch
        {
            await transaction.RollbackAsync(cancellationToken);
            throw;
        }
    }

    public async Task<List<TreeExportModel>> ExportTreeAsync(CancellationToken cancellationToken = default)
    {
        var allNodes = await _treeRepository.Query()
            .AsNoTracking()
            .ToListAsync(cancellationToken);

        // Найти корневые узлы
        var rootNodes = allNodes.Where(n => n.ParentId == null).ToList();

        var exportTree = rootNodes.Select(root => BuildTreeRecursive(root, allNodes)).ToList();

        return exportTree;
    }

    /// <summary>
    /// Проверка на циклическую ссылку
    /// </summary>
    private async Task<bool> HasCircularReferenceAsync(Guid nodeId, Guid newParentId, CancellationToken cancellationToken)
    {
        var currentId = newParentId;

        while (currentId != Guid.Empty)
        {
            if (currentId == nodeId)
                return true;

            var parent = await _treeRepository.GetByIdAsync(currentId, cancellationToken);
            if (parent?.ParentId == null)
                break;

            currentId = parent.ParentId.Value;
        }

        return false;
    }

    /// <summary>
    /// Получить узел и всех его потомков для каскадного удаления
    /// </summary>
    private async Task<List<TreeNode>> GetDescendantsAsync(Guid nodeId, CancellationToken cancellationToken)
    {
        var result = new List<TreeNode>();
        var node = await _treeRepository.GetByIdAsync(nodeId, cancellationToken);

        if (node == null)
            return result;

        result.Add(node);

        // Рекурсивно получить всех детей
        var children = await _treeRepository.Query()
            .Where(n => n.ParentId == nodeId)
            .ToListAsync(cancellationToken);

        foreach (var child in children)
        {
            var descendants = await GetDescendantsAsync(child.Id, cancellationToken);
            result.AddRange(descendants);
        }

        return result;
    }

    /// <summary>
    /// Рекурсивно построить дерево для экспорта
    /// </summary>
    private TreeExportModel BuildTreeRecursive(TreeNode node, List<TreeNode> allNodes)
    {
        var children = allNodes
            .Where(n => n.ParentId == node.Id)
            .Select(child => BuildTreeRecursive(child, allNodes))
            .ToList();

        return new TreeExportModel
        {
            Id = node.Id,
            Name = node.Name,
            CreatedAt = node.CreatedAt,
            Children = children.Any() ? children : null
        };
    }
}


