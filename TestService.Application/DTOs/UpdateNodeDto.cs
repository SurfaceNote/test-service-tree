namespace TestService.Application.DTOs;

/// <summary>
/// DTO для обновления узла
/// </summary>
public class UpdateNodeDto
{
    /// <summary>
    /// Новое название узла
    /// </summary>
    public string? Name { get; set; }

    /// <summary>
    /// Новый идентификатор родительского узла
    /// </summary>
    public Guid? ParentId { get; set; }
}
