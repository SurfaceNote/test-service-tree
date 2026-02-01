namespace TestService.Application.DTOs;

/// <summary>
/// DTO для узла дерева
/// </summary>
public class TreeNodeDto
{
    /// <summary>
    /// Идентификатор узла
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Название узла
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Идентификатор родительского узла
    /// </summary>
    public Guid? ParentId { get; set; }

    /// <summary>
    /// Дата создания
    /// </summary>
    public DateTime CreatedAt { get; set; }

    /// <summary>
    /// Дата последнего обновления
    /// </summary>
    public DateTime UpdatedAt { get; set; }
}
