namespace TestService.Domain.Entities;

/// <summary>
/// Узел древовидной иерархической структуры
/// </summary>
public class TreeNode
{
    /// <summary>
    /// Уникальный идентификатор узла
    /// </summary>
    public Guid Id { get; set; } = Guid.NewGuid();

    /// <summary>
    /// Название узла
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Идентификатор родительского узла (null для корневых узлов)
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

    /// <summary>
    /// Идентификатор пользователя, создавшего узел
    /// </summary>
    public Guid CreatedBy { get; set; }
    
    /// <summary>
    /// Родительский узел
    /// </summary>
    public TreeNode? Parent { get; set; }

    /// <summary>
    /// Дочерние узлы
    /// </summary>
    public ICollection<TreeNode> Children { get; set; } = new List<TreeNode>();

    /// <summary>
    /// Создатель узла
    /// </summary>
    public User Creator { get; set; } = null!;
}


