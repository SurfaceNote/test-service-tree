using TestService.Application.DTOs;
using TestService.Domain.Entities;

namespace TestService.Application.Mappers;

/// <summary>
/// Маппер для преобразования TreeNode в DTO и обратно
/// </summary>
public static class TreeNodeMapper
{
    /// <summary>
    /// Преобразовать сущность TreeNode в DTO
    /// </summary>
    public static TreeNodeDto ToDto(this TreeNode node)
    {
        return new TreeNodeDto
        {
            Id = node.Id,
            Name = node.Name,
            ParentId = node.ParentId,
            CreatedAt = node.CreatedAt,
            UpdatedAt = node.UpdatedAt
        };
    }

    /// <summary>
    /// Преобразовать список сущностей в список DTO
    /// </summary>
    public static List<TreeNodeDto> ToDto(this List<TreeNode> nodes)
    {
        return nodes.Select(ToDto).ToList();
    }
}
