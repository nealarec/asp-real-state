using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using MongoDB.Driver;
using TestAPI.Model;
using TestAPI.Services.DAO;
using TestAPI.Services.Interfaces;

namespace TestAPI.Controller;

[Route("api/[controller]")]
public class OwnersController : ResourceController<Owner, OwnerService>
{
    private readonly IS3Service _s3Service;
    private const string BucketName = "owner-images";

    public OwnersController(
        OwnerService ownerService,
        ILogger<OwnersController> logger,
        IS3Service s3Service)
        : base(ownerService, logger, "propietario")
    {
        _s3Service = s3Service;
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
    /// Sube o actualiza la foto de perfil de un propietario
    /// </summary>
    /// <param name="id">ID del propietario</param>
    /// <param name="file">Archivo de imagen a subir</param>
    [HttpPost("{id}/photo")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> UploadPhoto(string id, IFormFile file)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest("No se ha proporcionado ningún archivo o está vacío");
        }

        // Validar el tipo de archivo
        var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif" };
        var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();

        if (string.IsNullOrEmpty(fileExtension) || !allowedExtensions.Contains(fileExtension))
        {
            return BadRequest("Formato de archivo no válido. Se permiten solo imágenes JPG, JPEG, PNG o GIF.");
        }

        try
        {
            // Verificar que el propietario existe
            var owner = await _service.GetAsync(id);
            if (owner == null)
            {
                return NotFound($"No se encontró un propietario con ID: {id}");
            }

            // Eliminar la imagen anterior si existe
            if (!string.IsNullOrEmpty(owner.Photo))
            {
                try
                {
                    await _s3Service.DeleteFileAsync(owner.Photo, BucketName);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error al eliminar la imagen anterior del propietario {OwnerId}", id);
                    // Continuar con la carga de la nueva imagen aunque falle la eliminación de la anterior
                }
            }

            // Subir la nueva imagen
            var prefix = $"owners/{id}";
            var uploadResult = await _s3Service.UploadFileAsync(file, BucketName, prefix);

            // Actualizar la referencia de la foto en el propietario
            owner.Photo = uploadResult.FileKey;
            await _service.UpdateAsync(id, owner);

            // Devolver la URL de la foto
            var photoUrl = _s3Service.GetPublicFileUrl(uploadResult.FileKey, BucketName);

            return Ok(new
            {
                PhotoUrl = photoUrl,
                Message = "Foto de perfil actualizada correctamente"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al cargar la foto de perfil para el propietario {OwnerId}", id);
            return StatusCode(500, "Error al procesar la solicitud");
        }
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
    public async Task<ActionResult<Owner>> Update(string id, [FromBody] Owner updatedOwner)
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
