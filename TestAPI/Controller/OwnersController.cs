using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using MongoDB.Driver;
using TestAPI.Model;
using TestAPI.Services.DAO;

namespace TestAPI.Controller;

[Route("api/[controller]")]
public class OwnersController : ResourceController<Owner, OwnerService>
{
    public OwnersController(OwnerService ownerService, ILogger<OwnersController> logger)
        : base(ownerService, logger, "propietario")
    {
    }

    /// <summary>
    /// Obtiene todos los propietarios
    /// </summary>
    /// <param name="search">Buscar por nombre</param>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(IEnumerable<Owner>))]
    public async Task<ActionResult<IEnumerable<Owner>>> Get([FromQuery] string? search)
    {
        var filter = string.IsNullOrEmpty(search)
            ? null
            : Builders<Owner>.Filter.Regex("name", new BsonRegularExpression(search, "i"));

        return await GetAllAsync(filter);
    }

    /// <summary>
    /// Obtiene un propietario por su ID
    /// </summary>
    /// <param name="id">ID del propietario</param>
    [HttpGet("{id:length(24)}", Name = "GetOwner")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Owner))]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<Owner>> GetById(string id)
    {
        return await GetByIdAsync(id);
    }


    /// <summary>
    /// Crea un nuevo propietario
    /// </summary>
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created, Type = typeof(Owner))]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Post([FromBody] Owner newOwner)
    {
        return await CreateAsync(newOwner, "GetOwner", e => new { id = e.Id });
    }

    /// <summary>
    /// Actualiza un propietario existente
    /// </summary>
    /// <param name="id">ID del propietario a actualizar</param>
    [HttpPut("{id:length(24)}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(string id, [FromBody] Owner updatedOwner)
    {
        return await UpdateAsync(id, updatedOwner);
    }

    /// <summary>
    /// Elimina un propietario
    /// </summary>
    /// <param name="id">ID del propietario a eliminar</param>
    [HttpDelete("{id:length(24)}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(string id)
    {
        return await DeleteAsync(id);
    }
}
