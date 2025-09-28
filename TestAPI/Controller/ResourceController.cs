using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using MongoDB.Driver;
using System.ComponentModel.DataAnnotations;
using TestAPI.Model;
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
    /// Obtiene todos los recursos con filtrado opcional
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
            _logger.LogError(ex, $"Error al obtener los {_resourceName}");
            return StatusCode(500, $"Error interno del servidor al obtener los {_resourceName}");
        }
    }

    /// <summary>
    /// Obtiene un recurso por su ID
    /// </summary>
    protected virtual async Task<ActionResult<T>> GetByIdAsync(string id, string? customErrorMessage = null)
    {
        if (!ObjectId.TryParse(id, out _))
            return BadRequest("ID no válido");

        try
        {
            var item = await _service.GetAsync(id);
            return Ok(item);
        }
        catch (KeyNotFoundException)
        {
            return NotFound($"No se encontró el {_resourceName} con ID: {id}");
        }
        catch (Exception ex)
        {
            var errorMessage = customErrorMessage ?? $"Error al obtener el {_resourceName} con ID: {id}";
            _logger.LogError(ex, errorMessage);
            return StatusCode(500, errorMessage);
        }
    }

    /// <summary>
    /// Crea un nuevo recurso
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
            _logger.LogError(ex, $"Error al crear un nuevo {_resourceName}");
            return StatusCode(500, $"Error interno del servidor al crear el {_resourceName}");
        }
    }

    /// <summary>
    /// Actualiza un recurso existente
    /// </summary>
    protected virtual async Task<IActionResult> UpdateAsync(string id, T entity, Action<T>? beforeUpdate = null)
    {
        if (id != entity.Id)
            return BadRequest($"El ID de la ruta no coincide con el ID del {_resourceName}");

        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            beforeUpdate?.Invoke(entity);
            var result = await _service.UpdateAsync(id, entity);
            if (!result)
                return NotFound();

            return NoContent();
        }
        catch (ValidationException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error al actualizar el {_resourceName} con ID: {id}");
            return StatusCode(500, $"Error interno del servidor al actualizar el {_resourceName}");
        }
    }

    /// <summary>
    /// Elimina un recurso
    /// </summary>
    protected virtual async Task<IActionResult> DeleteAsync(string id)
    {
        if (!ObjectId.TryParse(id, out _))
            return BadRequest("ID no válido");

        try
        {
            var deleted = await _service.DeleteAsync(id);
            if (!deleted)
                return NotFound();

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error al eliminar el {_resourceName} con ID: {id}");
            return StatusCode(500, $"Error interno del servidor al eliminar el {_resourceName}");
        }
    }
}
