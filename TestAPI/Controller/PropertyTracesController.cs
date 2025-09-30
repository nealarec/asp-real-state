using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using MongoDB.Driver;
using System.ComponentModel.DataAnnotations;
using TestAPI.Model;
using TestAPI.Services.DAO;

namespace TestAPI.Controller;

/// <summary>
/// Controller for managing property transaction history
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
        : base(traceService, logger, "property history")
    {
        _propertyService = propertyService;
    }

    /// <summary>
    /// Gets the transaction history of a property
    /// </summary>
    /// <param name="propertyId">Property ID</param>
    /// <param name="startDate">Optional start date (format: yyyy-MM-dd)</param>
    /// <param name="endDate">Optional end date (format: yyyy-MM-dd)</param>
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
            return BadRequest("Invalid property ID");

        try
        {
            // Verify the property exists
            var property = await _propertyService.GetAsync(propertyId);
            if (property == null)
                return NotFound($"Property with ID {propertyId} not found");

            // Create filter
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
            _logger.LogError(ex, "Error getting history for property with ID: {PropertyId}", propertyId);
            return StatusCode(500, $"Error getting history for property with ID: {propertyId}");
        }
    }

    /// <summary>
    /// Gets a specific transaction by ID
    /// </summary>
    /// <param name="propertyId">Property ID</param>
    /// <param name="id">Transaction ID</param>
    [HttpGet("{id:length(24)}")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(PropertyTrace))]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<PropertyTrace>> GetById(string propertyId, string id)
    {
        if (!ObjectId.TryParse(propertyId, out _))
            return BadRequest("Invalid property ID");

        if (!ObjectId.TryParse(id, out _))
            return BadRequest("Invalid transaction ID");

        try
        {
            // Verify the property exists
            var property = await _propertyService.GetAsync(propertyId);
            if (property == null)
                return NotFound($"Property with ID {propertyId} not found");

            var trace = await _service.GetAsync(id);
            if (trace == null || trace.IdProperty != propertyId)
                return NotFound($"Transaction with ID {id} not found for the specified property");

            return Ok(trace);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting transaction with ID: {TraceId} for property with ID: {PropertyId}", id, propertyId);
            return StatusCode(500, $"Error getting transaction with ID: {id} for property with ID: {propertyId}");
        }
    }

    /// <summary>
    /// Registers a new transaction for a property
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
            return BadRequest("Invalid property ID");

        if (trace == null)
            return BadRequest("Trace data is required");

        // Validate the model
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            // Verify the property exists
            var property = await _propertyService.GetAsync(propertyId);
            if (property == null)
                return NotFound($"Property with ID {propertyId} not found");

            // Assign the property to the trace
            trace.IdProperty = propertyId;

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
            _logger.LogError(ex, "Error registering transaction for property with ID: {PropertyId}", propertyId);
            return StatusCode(500, $"Error registering transaction for property with ID: {propertyId}");
        }
    }

    /// <summary>
    /// Updates an existing transaction
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
            return BadRequest("Invalid property ID");

        if (!ObjectId.TryParse(id, out _))
            return BadRequest("Invalid transaction ID");

        if (updatedTrace == null)
            return BadRequest("Transaction data is required");

        // Validate the model
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            // Verify the transaction exists and belongs to the property
            var existingTrace = await _service.GetAsync(id);
            if (existingTrace == null || existingTrace.IdProperty != propertyId)
                return NotFound($"Transaction with ID {id} not found for the specified property");

            // Update only allowed fields
            existingTrace.Name = updatedTrace.Name;
            existingTrace.Value = updatedTrace.Value;
            existingTrace.Tax = updatedTrace.Tax;
            existingTrace.DateSale = updatedTrace.DateSale;

            await _service.UpdateAsync(id, existingTrace);
            return Ok(existingTrace);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating transaction with ID: {TraceId} for property with ID: {PropertyId}", id, propertyId);
            return StatusCode(500, $"Error updating transaction with ID: {id} for property with ID: {propertyId}");
        }
    }

    /// <summary>
    /// Deletes a transaction
    /// </summary>
    [HttpDelete("{id:length(24)}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteTrace(string propertyId, string id)
    {
        if (!ObjectId.TryParse(propertyId, out _))
            return BadRequest("Invalid property ID");

        if (!ObjectId.TryParse(id, out _))
            return BadRequest("Invalid transaction ID");

        try
        {
            // Verify the transaction exists and belongs to the property
            var existingTrace = await _service.GetAsync(id);
            if (existingTrace == null || existingTrace.IdProperty != propertyId)
                return NotFound($"Transaction with ID {id} not found for the specified property");

            await _service.DeleteAsync(id);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting transaction with ID: {TraceId} for property with ID: {PropertyId}", id, propertyId);
            return StatusCode(500, $"Error deleting transaction with ID: {id} for property with ID: {propertyId}");
        }
    }
}