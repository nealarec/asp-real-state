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
/// Controller for managing property images
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
        : base(imageService, logger, "property image")
    {
        _propertyService = propertyService;
        _s3Service = s3Service;
    }

    /// <summary>
    /// Gets all images for a property
    /// </summary>
    /// <param name="propertyId">Property ID</param>
    /// <param name="enabledOnly">Filter only enabled images (optional)</param>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(IEnumerable<PropertyImage>))]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<IEnumerable<PropertyImage>>> GetByProperty(
        string propertyId,
        [FromQuery] bool? enabledOnly = true)
    {
        if (!ObjectId.TryParse(propertyId, out _))
            return BadRequest("Invalid property ID");

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
            _logger.LogError(ex, "Error getting images for property with ID: {PropertyId}", propertyId);
            return StatusCode(500, $"Error getting images for property with ID: {propertyId}");
        }
    }

    /// <summary>
    /// Gets a specific image for a property
    /// </summary>
    /// <param name="propertyId">Property ID</param>
    /// <param name="id">Image ID</param>
    [HttpGet("{id:length(24)}")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(PropertyImage))]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<PropertyImage>> GetById(string propertyId, string id)
    {
        if (!ObjectId.TryParse(propertyId, out _))
            return BadRequest("Invalid property ID");

        if (!ObjectId.TryParse(id, out _))
            return BadRequest("Invalid image ID");

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
            _logger.LogError(ex, "Error getting image");
            return StatusCode(500, "Error getting image");
        }
    }

    /// <summary>
    /// Uploads a new image for a property
    /// </summary>
    /// <param name="propertyId">Property ID</param>
    /// <param name="file">Image file to upload</param>
    [HttpPost]
    [RequestSizeLimit(10 * 1024 * 1024)] // 10MB max file size
    [ProducesResponseType(StatusCodes.Status201Created, Type = typeof(PropertyImage))]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UploadImage(string propertyId, IFormFile file)
    {
        if (!ObjectId.TryParse(propertyId, out _))
            return BadRequest("Invalid property ID");

        if (file == null || file.Length == 0)
            return BadRequest("No valid file provided");

        try
        {
            // Verify property exists
            var property = await _propertyService.GetAsync(propertyId);
            if (property == null)
                return NotFound($"Property with ID {propertyId} not found");

            // Generate a unique file name
            var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
            var fileKey = $"properties/{propertyId}/{fileName}";

            // Upload the file to S3
            using (var stream = file.OpenReadStream())
            {
                await _s3Service.UploadFileAsync(file, fileKey, BucketName);
            }

            // Create the image record
            var image = new PropertyImage
            {
                Id = ObjectId.GenerateNewId().ToString(),
                IdProperty = propertyId,
                File = fileKey,
                Enabled = true
            };

            // Save to database
            var createdImage = await _service.CreateAsync(image);

            // Generate public URL
            var imageUrl = _s3Service.GetPublicFileUrl(fileKey, BucketName);

            return CreatedAtAction(nameof(GetById), new { propertyId, id = createdImage.Id }, createdImage);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading image for property {PropertyId}", propertyId);
            return StatusCode(500, "Error uploading image");
        }
    }
    /// <summary>
    /// Deletes an image from a property
    /// </summary>
    /// <param name="propertyId">Property ID</param>
    /// <param name="id">Image ID</param>
    [HttpDelete("{id:length(24)}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteImage(string propertyId, string id)
    {
        if (!ObjectId.TryParse(propertyId, out _))
            return BadRequest("Invalid property ID");

        if (!ObjectId.TryParse(id, out _))
            return BadRequest("Invalid image ID");
        try
        {
            // Verify the image exists and belongs to the property
            var image = await _service.GetAsync(id);
            if (image == null || image.IdProperty != propertyId)
                return NotFound($"Image with ID {id} not found for the specified property");

            // Delete file from S3
            try
            {
                await _s3Service.DeleteFileAsync(image.File, BucketName);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to delete file from S3: {FileKey}", image.File);
                // Continue even if file deletion fails
            }

            // Delete record from database
            var result = await _service.DeleteAsync(id);
            if (!result)
            {
                _logger.LogWarning("Failed to delete image with ID: {ImageId} from database", id);
                return StatusCode(500, "Error deleting image from database");
            }

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing image for property with ID: {PropertyId}", propertyId);
            return StatusCode(500, $"Error processing image for property with ID: {propertyId}");
        }
    }
}
