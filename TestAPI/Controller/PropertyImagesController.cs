using Amazon.S3;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using MongoDB.Driver;
using System.IO;
using TestAPI.Model;
using TestAPI.Services.DAO;
using TestAPI.Services.Interfaces;

namespace TestAPI.Controller;

/// <summary>
/// Controlador para gestionar las imágenes de las propiedades
/// </summary>
[Route("api/properties/{propertyId:length(24)}/images")]
[ApiController]
public class PropertyImagesController : ResourceController<PropertyImage, PropertyImageService>
{
    private readonly PropertyService _propertyService;
    private readonly IS3Service _s3Service;
    private const string BucketName = "property-images";

    public PropertyImagesController(
        PropertyImageService imageService,
        PropertyService propertyService,
        IS3Service s3Service,
        ILogger<PropertyImagesController> logger)
        : base(imageService, logger, "imagen de propiedad")
    {
        _propertyService = propertyService;
        _s3Service = s3Service;
    }

    /// <summary>
    /// Obtiene todas las imágenes de una propiedad
    /// </summary>
    /// <param name="propertyId">ID de la propiedad</param>
    /// <param name="enabledOnly">Filtrar solo imágenes habilitadas (opcional)</param>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(IEnumerable<PropertyImage>))]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<IEnumerable<PropertyImage>>> GetByProperty(
        string propertyId,
        [FromQuery] bool? enabledOnly = true)
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
            var filters = new List<FilterDefinition<PropertyImage>>
            {
                Builders<PropertyImage>.Filter.Eq(x => x.IdProperty, propertyId)
            };

            if (enabledOnly == true)
            {
                filters.Add(Builders<PropertyImage>.Filter.Eq(x => x.Enabled, true));
            }

            var filter = Builders<PropertyImage>.Filter.And(filters);
            var images = await _service.GetAsync(filter);

            // Mapear las imágenes para incluir la URL completa
            var result = images.Select(image => new
            {
                image.Id,
                image.IdProperty,
                image.Enabled,
                FileUrl = _s3Service.GetPublicFileUrl(image.File, BucketName),
                FileName = Path.GetFileName(image.File),
                FileKey = image.File
            });

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener las imágenes de la propiedad con ID: {PropertyId}", propertyId);
            return StatusCode(500, $"Error al obtener las imágenes de la propiedad con ID: {propertyId}");
        }
    }

    /// <summary>
    /// Obtiene una imagen específica de una propiedad
    /// </summary>
    /// <param name="propertyId">ID de la propiedad</param>
    /// <param name="id">ID de la imagen</param>
    [HttpGet("{id:length(24)}")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(PropertyImage))]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<PropertyImage>> GetById(string propertyId, string id)
    {
        if (!ObjectId.TryParse(propertyId, out _))
            return BadRequest("ID de propiedad no válido");

        if (!ObjectId.TryParse(id, out _))
            return BadRequest("ID de imagen no válido");

        try
        {
            // Verificar que la propiedad exista
            var property = await _propertyService.GetAsync(propertyId);
            if (property == null)
                return NotFound($"No se encontró la propiedad con ID: {propertyId}");

            var image = await _service.GetAsync(id);
            if (image == null || image.IdProperty != propertyId)
                return NotFound($"No se encontró la imagen con ID: {id} para la propiedad especificada");

            // Obtener las URLs públicas
            var fileUrl = _s3Service.GetPublicFileUrl(image.File, BucketName);
            string? thumbnailUrl = null;
            if (!string.IsNullOrEmpty(image.Thumbnail))
            {
                thumbnailUrl = _s3Service.GetPublicFileUrl(image.Thumbnail, BucketName);
            }

            // Devolver la imagen con las URLs completas
            return Ok(new
            {
                image.Id,
                image.IdProperty,
                image.Enabled,
                FileUrl = fileUrl,
                ThumbnailUrl = thumbnailUrl,
                FileName = Path.GetFileName(image.File),
                FileKey = image.File,
                ThumbnailKey = image.Thumbnail
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener la imagen con ID: {ImageId} de la propiedad con ID: {PropertyId}", id, propertyId);
            return StatusCode(500, $"Error al obtener la imagen con ID: {id} de la propiedad con ID: {propertyId}");
        }
    }

    /// <summary>
    /// Crea una nueva imagen para una propiedad
    /// </summary>
    /// <param name="propertyId">ID de la propiedad</param>
    /// <param name="image">Datos de la imagen</param>
    [HttpPost]
    [RequestSizeLimit(10 * 1024 * 1024)] // 10MB max file size
    [ProducesResponseType(StatusCodes.Status201Created, Type = typeof(PropertyImage))]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UploadImage(string propertyId, IFormFile file)
    {
        if (!ObjectId.TryParse(propertyId, out _))
            return BadRequest("ID de propiedad no válido");

        if (file == null || file.Length == 0)
            return BadRequest("No se ha proporcionado un archivo válido");

        try
        {
            // Verificar que la propiedad exista
            var property = await _propertyService.GetAsync(propertyId);
            if (property == null)
                return NotFound($"No se encontró la propiedad con ID: {propertyId}");

            // Subir el archivo a S3
            var uploadResult = await _s3Service.UploadFileAsync(file, BucketName, propertyId);

            // Crear el registro en la base de datos
            var image = new PropertyImage
            {
                Id = ObjectId.GenerateNewId().ToString(),
                IdProperty = propertyId,
                File = uploadResult.FileKey,  // Guardamos la clave del archivo en S3
                Thumbnail = !string.IsNullOrEmpty(uploadResult.ThumbnailKey) ? uploadResult.ThumbnailKey : null,
                Enabled = true
            };

            await _service.CreateAsync(image);

            // Construir las URLs públicas
            var fileUrl = _s3Service.GetPublicFileUrl(uploadResult.FileKey, BucketName);
            string? thumbnailUrl = null;
            if (!string.IsNullOrEmpty(uploadResult.ThumbnailKey))
            {
                thumbnailUrl = _s3Service.GetPublicFileUrl(uploadResult.ThumbnailKey, BucketName);
            }

            // Devolvemos la URL completa de la imagen y la miniatura
            return CreatedAtAction(nameof(GetById), new { propertyId, id = image.Id }, new
            {
                image.Id,
                image.IdProperty,
                image.Enabled,
                FileUrl = fileUrl,
                ThumbnailUrl = thumbnailUrl,
                FileName = uploadResult.FileName,
                Size = uploadResult.Size,
                UploadedAt = DateTime.UtcNow
            });
        }
        catch (AmazonS3Exception ex)
        {
            _logger.LogError(ex, "Error al subir la imagen a S3 para la propiedad con ID: {PropertyId}", propertyId);
            return StatusCode(500, "Error al procesar el archivo en el almacenamiento");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al crear la imagen para la propiedad con ID: {PropertyId}", propertyId);
            return StatusCode(500, $"Error al crear la imagen para la propiedad con ID: {propertyId}");
        }
    }

    /// <summary>
    /// Actualiza una imagen de propiedad existente
    /// </summary>
    /// <param name="propertyId">ID de la propiedad</param>
    /// <param name="id">ID de la imagen</param>
    /// <param name="file">Nuevo archivo de imagen (opcional)</param>
    /// <param name="enabled">Estado habilitado/deshabilitado (opcional)</param>
    [HttpPut("{id:length(24)}")]
    [RequestSizeLimit(10 * 1024 * 1024)] // 10MB max file size
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(PropertyImage))]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateImage(string propertyId, string id, IFormFile? file = null, bool? enabled = null)
    {
        if (!ObjectId.TryParse(propertyId, out _))
            return BadRequest("ID de propiedad no válido");

        if (!ObjectId.TryParse(id, out _))
            return BadRequest("ID de imagen no válido");

        if (file == null && !enabled.HasValue)
            return BadRequest("Debe proporcionar al menos un campo para actualizar");

        try
        {
            // Verificar que la propiedad exista
            var property = await _propertyService.GetAsync(propertyId);
            if (property == null)
                return NotFound($"No se encontró la propiedad con ID: {propertyId}");

            // Obtener la imagen existente
            var existingImage = await _service.GetAsync(id);
            if (existingImage == null || existingImage.IdProperty != propertyId)
                return NotFound($"No se encontró la imagen con ID: {id} para la propiedad especificada");

            // Guardar el nombre del archivo antiguo para eliminarlo después
            string? oldFileKey = null;

            // Actualizar el archivo si se proporcionó uno nuevo
            if (file != null && file.Length > 0)
            {
                // Guardar la clave del archivo antiguo para eliminarlo después
                oldFileKey = existingImage.File;

                // Usar el método UpdateFileAsync que se encarga de la lógica de actualización
                var uploadResult = await _s3Service.UpdateFileAsync(
                    oldFileKey,
                    file,
                    BucketName,
                    propertyId);

                // Actualizar las referencias a los archivos
                existingImage.File = uploadResult.FileKey;
                existingImage.Thumbnail = !string.IsNullOrEmpty(uploadResult.ThumbnailKey) ? uploadResult.ThumbnailKey : null;
            }

            // Actualizar el estado si se proporcionó
            if (enabled.HasValue)
                existingImage.Enabled = enabled.Value;

            // Guardar los cambios en la base de datos
            await _service.UpdateAsync(id, existingImage);

            // Obtener las URLs públicas actualizadas
            var fileUrl = _s3Service.GetPublicFileUrl(existingImage.File, BucketName);
            string? thumbnailUrl = null;
            if (!string.IsNullOrEmpty(existingImage.Thumbnail))
            {
                thumbnailUrl = _s3Service.GetPublicFileUrl(existingImage.Thumbnail, BucketName);
            }

            return Ok(new
            {
                existingImage.Id,
                existingImage.IdProperty,
                existingImage.Enabled,
                FileUrl = fileUrl,
                ThumbnailUrl = thumbnailUrl,
                FileName = Path.GetFileName(existingImage.File),
                FileKey = existingImage.File,
                ThumbnailKey = existingImage.Thumbnail,
                UpdatedAt = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al actualizar la imagen con ID: {ImageId} de la propiedad con ID: {PropertyId}", id, propertyId);
            return StatusCode(500, $"Error al actualizar la imagen con ID: {id} de la propiedad con ID: {propertyId}: {ex.Message}");
        }
    }
    /// <param name="propertyId">ID de la propiedad</param>
    /// <param name="id">ID de la imagen</param>
    /// <summary>
    /// Elimina una imagen de propiedad
    /// </summary>
    /// <param name="propertyId">ID de la propiedad</param>
    /// <param name="id">ID de la imagen</param>
    [HttpDelete("{id:length(24)}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteImage(string propertyId, string id)
    {
        if (!ObjectId.TryParse(propertyId, out _))
            return BadRequest("ID de propiedad no válido");

        if (!ObjectId.TryParse(id, out _))
            return BadRequest("ID de imagen no válido");

        try
        {
            // Verificar que la imagen exista y pertenezca a la propiedad
            var image = await _service.GetAsync(id);
            if (image == null || image.IdProperty != propertyId)
                return NotFound($"No se encontró la imagen con ID: {id} para la propiedad especificada");

            // Eliminar el archivo de S3
            try
            {
                await _s3Service.DeleteFileAsync(image.File, BucketName);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "No se pudo eliminar el archivo de S3: {FileKey}", image.File);
                // Continuar aunque falle la eliminación del archivo
            }

            // Eliminar el registro de la base de datos
            var result = await _service.DeleteAsync(id);
            if (!result)
            {
                _logger.LogWarning("No se pudo eliminar la imagen con ID: {ImageId} de la base de datos", id);
                return StatusCode(500, "Error al eliminar la imagen de la base de datos");
            }

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al eliminar la imagen con ID: {ImageId} de la propiedad con ID: {PropertyId}", id, propertyId);
            return StatusCode(500, $"Error al eliminar la imagen con ID: {id} de la propiedad con ID: {propertyId}");
        }
    }
}
