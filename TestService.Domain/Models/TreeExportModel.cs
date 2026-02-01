namespace TestService.Domain.Models;

/// <summary>
/// Модель для экспорта дерева в JSON
/// </summary>
public class TreeExportModel
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public List<TreeExportModel>? Children { get; set; }
}


