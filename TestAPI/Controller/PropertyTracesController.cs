using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using MongoDB.Driver;
using System.ComponentModel.DataAnnotations;
using TestAPI.Model;
using TestAPI.Services.DAO;

namespace TestAPI.Controller;

/// <summary>
/// Controlador para gestionar el historial de transacciones de propiedades
/// </summary>
[Route("api/properties/{propertyId:length(24)}/traces")]
[ApiController]
public class PropertyTracesController : ResourceController<PropertyTrace, PropertyTraceService>
{
    private readonly PropertyService _propertyService;

    public PropertyTracesController(
        PropertyTraceService traceService,
        PropertyService propertyService,
        ILogger<PropertyTracesController> logger)
        : base(traceService, logger, "historial de propiedad")
    {
        _propertyService = propertyService;
    }

    /// <summary>
    /// Obtiene el historial de transacciones de una propiedad
    /// </summary>
    /// <param name="propertyId">ID de la propiedad</param>
    /// <param name="startDate">Fecha de inicio opcional (formato: yyyy-MM-dd)</param>
    /// <param name="endDate">Fecha de fin opcional (formato: yyyy-MM-dd)</param>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(IEnumerable<PropertyTrace>))]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<IEnumerable<PropertyTrace>>> GetHistory(
        string propertyId,
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null)
    {
        if (!ObjectId.TryParse(propertyId, out _))
            return BadRequest("ID de propiedad no válido");

        try
        {
            // Verificar que la propiedad exista
            var property = await _propertyService.GetAsync(propertyId);
            if (property == null)
                return NotFound($"No se encontró la propiedad con ID: {propertyId}");

            // Crear filtro
            var filters = new List<FilterDefinition<PropertyTrace>>
            {
                Builders<PropertyTrace>.Filter.Eq(x => x.IdProperty, propertyId)
            };

            if (startDate.HasValue)
                filters.Add(Builders<PropertyTrace>.Filter.Gte(x => x.DateSale, startDate.Value));
            if (endDate.HasValue)
                filters.Add(Builders<PropertyTrace>.Filter.Lte(x => x.DateSale, endDate.Value));

            var filter = filters.Count > 1
                ? Builders<PropertyTrace>.Filter.And(filters)
                : filters.FirstOrDefault();

            return await GetAllAsync(filter);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener el historial de la propiedad con ID: {PropertyId}", propertyId);
            return StatusCode(500, $"Error al obtener el historial de la propiedad con ID: {propertyId}");
        }
    }

    /// <summary>
    /// Obtiene una transacción específica por su ID
    /// </summary>
    /// <param name="propertyId">ID de la propiedad</param>
    /// <param name="id">ID de la transacción</param>
    [HttpGet("{id:length(24)}")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(PropertyTrace))]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<PropertyTrace>> GetById(string propertyId, string id)
    {
        if (!ObjectId.TryParse(propertyId, out _))
            return BadRequest("ID de propiedad no válido");

        if (!ObjectId.TryParse(id, out _))
            return BadRequest("ID de transacción no válido");

        try
        {
            // Verificar que la propiedad exista
            var property = await _propertyService.GetAsync(propertyId);
            if (property == null)
                return NotFound($"No se encontró la propiedad con ID: {propertyId}");

            var trace = await _service.GetAsync(id);
            if (trace == null || trace.IdProperty != propertyId)
                return NotFound($"No se encontró la transacción con ID: {id} para la propiedad especificada");

            return Ok(trace);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener la transacción con ID: {TraceId} de la propiedad con ID: {PropertyId}", id, propertyId);
            return StatusCode(500, $"Error al obtener la transacción con ID: {id} de la propiedad con ID: {propertyId}");
        }
    }

    /// <summary>
    /// Registra una nueva transacción para una propiedad
    /// </summary>
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created, Type = typeof(PropertyTrace))]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> CreateTrace(
        string propertyId,
        [FromBody] PropertyTrace trace)
    {
        if (!ObjectId.TryParse(propertyId, out _))
            return BadRequest("ID de propiedad no válido");

        if (trace == null)
            return BadRequest("Los datos del rastreo son requeridos");

        // Validar el modelo
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            // Verificar que la propiedad exista
            var property = await _propertyService.GetAsync(propertyId);
            if (property == null)
                return NotFound($"No se encontró la propiedad con ID: {propertyId}");

            // Asignar la propiedad al rastreo
            trace.IdProperty = propertyId;
            trace.DateSale = DateTime.UtcNow;

            var createdTrace = await _service.CreateAsync(trace);
            return CreatedAtAction(
                nameof(GetById),
                new { propertyId, id = createdTrace.Id },
                createdTrace);
        }
        catch (ValidationException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al registrar la transacción para la propiedad con ID: {PropertyId}", propertyId);
            return StatusCode(500, $"Error al registrar la transacción para la propiedad con ID: {propertyId}");
        }
    }

    /// <summary>
    /// Actualiza una transacción existente
    /// </summary>
    [HttpPut("{id:length(24)}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateTrace(
        string propertyId,
        string id,
        [FromBody] PropertyTrace updatedTrace)
    {
        if (!ObjectId.TryParse(propertyId, out _))
            return BadRequest("ID de propiedad no válido");

        if (!ObjectId.TryParse(id, out _))
            return BadRequest("ID de transacción no válido");

        if (updatedTrace == null)
            return BadRequest("Los datos de la transacción son requeridos");

        // Validar el modelo
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            // Verificar que la transacción exista y pertenezca a la propiedad
            var existingTrace = await _service.GetAsync(id);
            if (existingTrace == null || existingTrace.IdProperty != propertyId)
                return NotFound($"No se encontró la transacción con ID: {id} para la propiedad especificada");

            // Actualizar solo los campos permitidos
            existingTrace.Name = updatedTrace.Name;
            existingTrace.Value = updatedTrace.Value;
            existingTrace.Tax = updatedTrace.Tax;
            existingTrace.DateSale = updatedTrace.DateSale;

            await _service.UpdateAsync(id, existingTrace);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al actualizar la transacción con ID: {TraceId} de la propiedad con ID: {PropertyId}", id, propertyId);
            return StatusCode(500, $"Error al actualizar la transacción con ID: {id} de la propiedad con ID: {propertyId}");
        }
    }

    /// <summary>
    /// Elimina una transacción
    /// </summary>
    [HttpDelete("{id:length(24)}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteTrace(string propertyId, string id)
    {
        if (!ObjectId.TryParse(propertyId, out _))
            return BadRequest("ID de propiedad no válido");

        if (!ObjectId.TryParse(id, out _))
            return BadRequest("ID de transacción no válido");

        try
        {
            // Verificar que la transacción exista y pertenezca a la propiedad
            var existingTrace = await _service.GetAsync(id);
            if (existingTrace == null || existingTrace.IdProperty != propertyId)
                return NotFound($"No se encontró la transacción con ID: {id} para la propiedad especificada");

            await _service.DeleteAsync(id);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al eliminar la transacción con ID: {TraceId} de la propiedad con ID: {PropertyId}", id, propertyId);
            return StatusCode(500, $"Error al eliminar la transacción con ID: {id} de la propiedad con ID: {propertyId}");
        }
    }
}