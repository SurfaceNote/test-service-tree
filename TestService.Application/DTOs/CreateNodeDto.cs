namespace TestService.Application.DTOs;

/// <summary>
/// DTO для создания нового узла
/// </summary>
public class CreateNodeDto
{
    /// <summary>
    /// Название узла
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Идентификатор родительского узла
    /// </summary>
    public Guid? ParentId { get; set; }
}
