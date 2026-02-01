using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TestService.Api.Wrappers;
using TestService.Application.DTOs;
using TestService.Application.Interfaces;
using TestService.Application.Mappers;
using TestService.Domain.Constants;
using TestService.Domain.Interfaces;
using TestService.Domain.Models;

namespace TestService.Api.Controllers;

/// <summary>
/// Контролер управления древовидной структурой
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TreeController : ControllerBase
{
    private readonly ITreeService _treeService;

    public TreeController(ITreeService treeService)
    {
        _treeService = treeService;
    }

    /// <summary>
    /// Получить все узлы
    /// </summary>
    [HttpGet("nodes")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllNodes(CancellationToken cancellationToken)
    {
        var nodes = await _treeService.GetAllNodesAsync(cancellationToken);
        var dtos = nodes.ToDto();
        return Ok(ApiResultContainer<List<TreeNodeDto>>.SuccessResult(dtos));
    }

    /// <summary>
    /// Получить узел по идентификатору
    /// </summary>
    [HttpGet("nodes/{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetNodeById(Guid id, CancellationToken cancellationToken)
    {
        var node = await _treeService.GetNodeByIdAsync(id, cancellationToken);
        var dto = node.ToDto();
        return Ok(ApiResultContainer<TreeNodeDto>.SuccessResult(dto));
    }

    /// <summary>
    /// Создать новый узел
    /// </summary>
    [HttpPost("nodes")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateNode([FromBody] CreateNodeDto dto, CancellationToken cancellationToken)
    {
        // Получить UserId из claims авторизованного пользователя
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            return Unauthorized(ApiResultContainer<object>.ErrorResult("Не удалось получить идентификатор пользователя из токена"));
        
        var node = await _treeService.CreateNodeAsync(dto.Name, dto.ParentId, userId, cancellationToken);
        var responseDto = node.ToDto();
        return CreatedAtAction(nameof(GetNodeById), new { id = responseDto.Id }, 
            ApiResultContainer<TreeNodeDto>.SuccessResult(responseDto));
    }

    /// <summary>
    /// Обновить узел (только для администратора)
    /// </summary>
    [HttpPut("nodes/{id}")]
    [Authorize(Roles = Roles.Admin)]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> UpdateNode(Guid id, [FromBody] UpdateNodeDto dto, CancellationToken cancellationToken)
    {
        var node = await _treeService.UpdateNodeAsync(id, dto.Name, dto.ParentId, cancellationToken);
        var responseDto = node.ToDto();
        return Ok(ApiResultContainer<TreeNodeDto>.SuccessResult(responseDto));
    }

    /// <summary>
    /// Удалить узел и всех его потомков (только для администратора)
    /// </summary>
    [HttpDelete("nodes/{id}")]
    [Authorize(Roles = Roles.Admin)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> DeleteNode(Guid id, CancellationToken cancellationToken)
    {
        await _treeService.DeleteNodeAsync(id, cancellationToken);
        return NoContent();
    }

    /// <summary>
    /// Экспортировать всё дерево в JSON
    /// </summary>
    [HttpGet("export")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> ExportTree(CancellationToken cancellationToken)
    {
        var data = await _treeService.ExportTreeAsync(cancellationToken);
        return Ok(ApiResultContainer<List<TreeExportModel>>.SuccessResult(data));
    }
    
}


