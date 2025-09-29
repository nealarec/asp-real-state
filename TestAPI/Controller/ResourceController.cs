using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using MongoDB.Driver;
using System.ComponentModel.DataAnnotations;
using TestAPI.Model;
using TestAPI.Model.Responses;
using TestAPI.Services.DAO;

namespace TestAPI.Controller;

[ApiController]
[Produces("application/json")]
public abstract class ResourceController<T, TService> : ControllerBase
where T : class, IEntity
    where TService : BaseService<T>
{
    protected readonly ILogger<ResourceController<T, TService>> _logger;
    protected readonly TService _service;
    protected readonly string _resourceName;

    protected ResourceController(TService service, ILogger<ResourceController<T, TService>> logger, string resourceName)
    {
        _service = service;
        _logger = logger;
        _resourceName = resourceName;
    }


    /// <summary>
    /// Gets all resources with optional filtering
    /// </summary>
    protected virtual async Task<ActionResult<IEnumerable<T>>> GetAllAsync(FilterDefinition<T>? filter = null)
    {
        try
        {
            var items = filter == null
                ? await _service.GetAsync()
                : await _service.GetAsync(filter);

            return Ok(items);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error getting {_resourceName}");
            return StatusCode(500, $"Internal server error while getting {_resourceName}");
        }
    }


    /// <summary>
    /// Gets all resources with pagination and optional filtering
    /// </summary>
    /// <param name="page">Page number (default: 1)</param>
    /// <param name="pageSize">Page size (default: 10)</param>
    /// <param name="filter">Filtro opcional</param>
    /// <param name="sortField">Field to sort by</param>
    /// <param name="sortOrder">Sort order (asc/desc)</param>
    /// <returns>Paginated list of resources</returns>
    protected virtual async Task<ActionResult<PaginatedResponse<T>>> GetAllAsync(
        int page = 1,
        int pageSize = 10,
        FilterDefinition<T>? filter = null,
        string? sortField = null,
        string? sortOrder = "asc")
    {
        try
        {
            if (page < 1) page = 1;
            if (pageSize < 1 || pageSize > 100) pageSize = 10;

            // Build sort definition if a field is provided
            SortDefinition<T>? sort = null;
            if (!string.IsNullOrEmpty(sortField))
            {
                var sortBuilder = Builders<T>.Sort;
                sort = sortOrder?.ToLower() == "desc"
                    ? sortBuilder.Descending(sortField)
                    : sortBuilder.Ascending(sortField);
            }

            var result = await _service.GetPaginatedAsync(page, pageSize, filter, sort);

            // Add pagination headers
            Response.Headers["X-Total-Count"] = result.TotalCount.ToString();
            Response.Headers["X-Page"] = result.Page.ToString();
            Response.Headers["X-Page-Size"] = result.PageSize.ToString();
            Response.Headers["X-Total-Pages"] = result.TotalPages.ToString();

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error getting {_resourceName}");
            return StatusCode(500, $"Internal server error while getting {_resourceName}");
        }
    }


    /// <summary>
    /// Gets a resource by its ID
    /// </summary>
    protected virtual async Task<ActionResult<T>> GetByIdAsync(string id, string? customErrorMessage = null)
    {
        if (!ObjectId.TryParse(id, out _))
            return BadRequest("Invalid ID");

        try
        {
            var item = await _service.GetAsync(id);
            return Ok(item);
        }
        catch (KeyNotFoundException)
        {
            return NotFound($"{_resourceName} with ID {id} not found");
        }
        catch (Exception ex)
        {
            var errorMessage = customErrorMessage ?? $"Error getting {_resourceName} with ID: {id}";
            _logger.LogError(ex, errorMessage);
            return StatusCode(500, errorMessage);
        }
    }

    /// <summary>
    /// Creates a new resource
    /// </summary>
    protected virtual async Task<IActionResult> CreateAsync(T entity, string routeName, Func<T, object> routeValues)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var createdEntity = await _service.CreateAsync(entity);
            return CreatedAtRoute(routeName, routeValues(createdEntity), createdEntity);
        }
        catch (ValidationException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error creating new {_resourceName}");
            return StatusCode(500, $"Internal server error while creating {_resourceName}");
        }
    }

    /// <summary>
    /// Updates an existing resource
    /// </summary>
    protected virtual async Task<ActionResult<T>> UpdateAsync(string id, T entity, Action<T>? beforeUpdate = null)
    {
        if (id != entity.Id)
            return BadRequest($"Route ID does not match {_resourceName} ID");

        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            beforeUpdate?.Invoke(entity);
            var result = await _service.UpdateAsync(id, entity);
            if (!result)
                return NotFound();

            // Get the updated entity to return it
            var updatedEntity = await _service.GetAsync(id);
            return Ok(updatedEntity);
        }
        catch (ValidationException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error updating {_resourceName} with ID: {id}");
            return StatusCode(500, $"Internal server error while updating {_resourceName}");
        }
    }

    /// <summary>
    /// Deletes a resource
    /// </summary>
    protected virtual async Task<IActionResult> DeleteAsync(string id)
    {
        if (!ObjectId.TryParse(id, out _))
            return BadRequest("Invalid ID");

        try
        {
            var deleted = await _service.DeleteAsync(id);
            if (!deleted)
                return NotFound();

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error deleting {_resourceName} with ID: {id}");
            return StatusCode(500, $"Internal server error while deleting {_resourceName}");
        }
    }
}
