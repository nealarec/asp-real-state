using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using MongoDB.Driver;
using TestAPI.Model;
using TestAPI.Model.Responses;
using TestAPI.Services.DAO;
using TestAPI.Utils;

namespace TestAPI.Controller;

[Route("api/[controller]")]
[ApiController]
public class PropertiesController : ResourceController<Property, PropertyService>
{
    public PropertiesController(PropertyService propertyService, ILogger<PropertiesController> logger)
        : base(propertyService, logger, "property")
    {
    }

    /// <summary>
    /// Gets metadata about properties (price ranges, years, etc.)
    /// </summary>
    [HttpGet("metadata")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(PropertyMetadataResponse))]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<PropertyMetadataResponse>> GetMetadata()
    {
        try
        {
            // Obtener metadatos usando agregación de MongoDB
            var metadata = await _service.GetPropertyMetadataAsync();
            return Ok(metadata);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving property metadata");
            return StatusCode(500, "Error retrieving property metadata");
        }
    }

    /// <summary>
    /// Gets all properties with pagination, sorting and optional filtering
    /// </summary>
    /// <param name="page">Page number (default: 1)</param>
    /// <param name="pageSize">Page size (default: 10, max: 100)</param>
    /// <param name="search">Text to search in name or address</param>
    /// <param name="ownerId">Filter by owner ID</param>
    /// <param name="sortBy">Field to sort by (name, address, price, year)</param>
    /// <param name="sortOrder">Sort order (asc/desc)</param>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(PaginatedResponse<Property>))]
    public async Task<ActionResult<PaginatedResponse<Property>>> Get(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? search = null,
        [FromQuery] string? ownerId = null,
        [FromQuery] decimal? minPrice = null,
        [FromQuery] decimal? maxPrice = null,
        [FromQuery] int? minYear = null,
        [FromQuery] int? maxYear = null,
        [FromQuery] string? sortBy = null,
        [FromQuery] string sortOrder = "asc")
    {
        var filters = new List<FilterDefinition<Property>>();

        if (!string.IsNullOrEmpty(search))
        {
            // Normalize the search term (remove diacritics, handle spaces, etc.)
            var normalizedSearch = search.GetInsensibleRegex();

            // Create a case-insensitive regex pattern
            var searchPattern = new BsonRegularExpression(normalizedSearch, "i");

            var searchFilter = Builders<Property>.Filter.Or(
                Builders<Property>.Filter.Regex(x => x.Name, searchPattern),
                Builders<Property>.Filter.Regex(x => x.Address, searchPattern),
                Builders<Property>.Filter.Regex(x => x.CodeInternal, searchPattern)
            );
            filters.Add(searchFilter);
        }

        if (!string.IsNullOrEmpty(ownerId) && ObjectId.TryParse(ownerId, out _))
        {
            filters.Add(Builders<Property>.Filter.Eq(x => x.IdOwner, ownerId));
        }

        if (minPrice.HasValue)
        {
            filters.Add(Builders<Property>.Filter.Gte(x => x.Price, minPrice.Value));
        }

        if (maxPrice.HasValue)
        {
            filters.Add(Builders<Property>.Filter.Lte(x => x.Price, maxPrice.Value));
        }

        if (minYear.HasValue)
        {
            filters.Add(Builders<Property>.Filter.Gte(x => x.Year, minYear.Value));
        }

        if (maxYear.HasValue)
        {
            filters.Add(Builders<Property>.Filter.Lte(x => x.Year, maxYear.Value));
        }

        var filter = filters.Count > 0
            ? Builders<Property>.Filter.And(filters)
            : null;

        // Map sort fields
        string? sortField = sortBy?.ToLower() switch
        {
            "name" => "Name",
            "address" => "Address",
            "price" => "Price",
            "year" => "Year",
            _ => null
        };

        return await GetAllAsync(page, pageSize, filter, sortField, sortOrder);
    }

    /// <summary>
    /// Gets a property by its ID
    /// </summary>
    /// <param name="id">Property ID</param>
    [HttpGet("{id:length(24)}", Name = "GetById")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Property))]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<Property>> GetById(string id)
    {
        return await GetByIdAsync(id);
    }

    /// <summary>
    /// Gets the owner of a property
    /// </summary>
    /// <param name="id">Property ID</param>
    [HttpGet("{id:length(24)}/owner")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(IEnumerable<Property>))]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<IEnumerable<Property>>> GetByOwner(string id)
    {
        if (!ObjectId.TryParse(id, out _))
            return BadRequest("Invalid owner ID");

        try
        {
            var properties = await _service.GetOwnerAsync(id);
            return Ok(properties);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error getting properties for owner with ID: {id}");
            return StatusCode(500, $"Error getting properties for owner with ID: {id}");
        }
    }

    /// <summary>
    /// Creates a new property
    /// </summary>
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created, Type = typeof(Property))]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateProperty([FromBody] Property newProperty)
    {
        return await CreateAsync(newProperty, "GetById", e => new { id = e.Id });
    }

    /// <summary>
    /// Updates an existing property
    /// </summary>
    [HttpPut("{id:length(24)}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<Property>> Update(string id, [FromBody] Property updatedProperty)
    {
        return await base.UpdateAsync(id, updatedProperty);
    }

    /// <summary>
    /// Deletes an existing property
    /// </summary>
    [HttpDelete("{id:length(24)}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(string id)
    {
        return await DeleteAsync(id);
    }
}
