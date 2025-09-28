using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using MongoDB.Driver;
using TestAPI.Model;
using TestAPI.Services.DAO;

namespace TestAPI.Controller;

[Route("api/[controller]")]
[ApiController]
public class PropertiesController : ResourceController<Property, PropertyService>
{
    public PropertiesController(PropertyService propertyService, ILogger<PropertiesController> logger)
        : base(propertyService, logger, "propiedad")
    {
    }

    /// <summary>
    /// Obtiene todas las propiedades con filtrado opcional
    /// </summary>
    /// <param name="search">Texto para buscar en nombre o dirección</param>
    /// <param name="ownerId">Filtrar por ID del propietario</param>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(IEnumerable<Property>))]
    public async Task<ActionResult<IEnumerable<Property>>> Get(
        [FromQuery] string? search = null,
        [FromQuery] string? ownerId = null)
    {
        var filters = new List<FilterDefinition<Property>>();

        if (!string.IsNullOrEmpty(search))
        {
            var searchFilter = Builders<Property>.Filter.Or(
                Builders<Property>.Filter.Regex(x => x.Name, new BsonRegularExpression(search, "i")),
                Builders<Property>.Filter.Regex(x => x.Address, new BsonRegularExpression(search, "i"))
            );
            filters.Add(searchFilter);
        }

        if (!string.IsNullOrEmpty(ownerId) && ObjectId.TryParse(ownerId, out _))
        {
            filters.Add(Builders<Property>.Filter.Eq(x => x.IdOwner, ownerId));
        }

        var filter = filters.Count > 0
            ? Builders<Property>.Filter.And(filters)
            : null;

        return await GetAllAsync(filter);
    }

    /// <summary>
    /// Obtiene una propiedad por su ID
    /// </summary>
    /// <param name="id">ID de la propiedad</param>
    [HttpGet("{id:length(24)}")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Property))]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<Property>> GetById(string id)
    {
        return await GetByIdAsync(id);
    }

    /// <summary>
    /// Obtiene el propietario de una propiedad
    /// </summary>
    /// <param name="id">ID de la propiedad</param>
    [HttpGet("{id:length(24)}/owner")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(IEnumerable<Property>))]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<IEnumerable<Property>>> GetByOwner(string id)
    {
        if (!ObjectId.TryParse(id, out _))
            return BadRequest("ID de propietario no válido");

        try
        {
            var properties = await _service.GetOwnerAsync(id);
            return Ok(properties);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error al obtener las propiedades del propietario con ID: {id}");
            return StatusCode(500, $"Error al obtener las propiedades del propietario con ID: {id}");
        }
    }

    /// <summary>
    /// Crea una nueva propiedad
    /// </summary>
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created, Type = typeof(Property))]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateProperty([FromBody] Property newProperty)
    {
        return await CreateAsync(newProperty, "GetById", e => new { id = e.Id });
    }

    /// <summary>
    /// Actualiza una propiedad existente
    /// </summary>
    [HttpPut("{id:length(24)}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<Property>> Update(string id, [FromBody] Property updatedProperty)
    {
        return await base.UpdateAsync(id, updatedProperty);
    }
}
