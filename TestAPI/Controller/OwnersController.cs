using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using MongoDB.Driver;
using TestAPI.Model;
using TestAPI.Model.Responses;
using TestAPI.Services.DAO;
using TestAPI.Services.Storage;
using TestAPI.Utils;

namespace TestAPI.Controller;

[Route("api/[controller]")]
public class OwnersController : ResourceController<Owner, OwnerService>
{
    private readonly IStorageService _storageService;
    private readonly PropertyService _propertyService;
    private const string BucketName = "owner-images";

    public OwnersController(
        OwnerService ownerService,
        PropertyService propertyService,
        ILogger<OwnersController> logger,
        IStorageService storageService)
        : base(ownerService, logger, "owner")
    {
        _storageService = storageService;
        _propertyService = propertyService;
    }

    /// <summary>
    /// Gets all owners with pagination and sorting
    /// </summary>
    /// <param name="page">Page number (default: 1)</param>
    /// <param name="pageSize">Page size (default: 10, max: 100)</param>
    /// <param name="search">Search by name</param>
    /// <param name="sortBy">Field to sort by (name, birthday)</param>
    /// <param name="sortOrder">Sort order (asc/desc)</param>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(PaginatedResponse<Owner>))]
    public async Task<ActionResult<PaginatedResponse<Owner>>> Get(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? search = null,
        [FromQuery] string? sortBy = null,
        [FromQuery] string sortOrder = "asc")
    {
        FilterDefinition<Owner>? filter = null;

        if (!string.IsNullOrEmpty(search))
        {
            // Normalize the search term (remove diacritics, handle spaces, etc.)
            var normalizedSearch = search.GetInsensibleRegex();

            // Create a case-insensitive regex pattern
            var searchPattern = new BsonRegularExpression(normalizedSearch, "i");

            filter = Builders<Owner>.Filter.Or(
                Builders<Owner>.Filter.Regex("Name", searchPattern),
                Builders<Owner>.Filter.Regex("Address", searchPattern)
            );
        }

        // Map sort fields
        string? sortField = sortBy?.ToLower() switch
        {
            "name" => "Name",
            "birthday" => "Birthday",
            _ => null
        };

        return await GetAllAsync(page, pageSize, filter, sortField, sortOrder);
    }

    /// <summary>
    /// Gets an owner by ID
    /// </summary>
    /// <param name="id">Owner ID</param>
    [HttpGet("{id:length(24)}", Name = "GetOwner")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Owner))]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<Owner>> GetById(string id)
    {
        return await GetByIdAsync(id);
    }

    /// <summary>
    /// Gets properties owned by an owner
    /// </summary>
    /// <param name="id">Owner ID</param>
    [HttpGet("{id:length(24)}/properties")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(IEnumerable<Property>))]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<IEnumerable<Property>>> GetProperties(string id)
    {
        try
        {

            var owner = await _service.GetAsync(id);
            return Ok(await _propertyService.GetAsync(Builders<Property>.Filter.Eq(x => x.IdOwner, owner.Id)));
        }
        catch (KeyNotFoundException)
        {
            return NotFound($"Owner with ID {id} not found");
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error getting owner properties: {ex.Message}");
        }


    }


    /// <summary>
    /// Uploads or updates an owner's profile photo
    /// </summary>
    /// <param name="id">Owner ID</param>
    /// <param name="file">Image file to upload</param>
    [HttpPost("{id}/photo")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> UploadPhoto(string id, IFormFile file)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest("No file provided or file is empty");
        }

        // Validate file type
        var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif" };
        var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();

        if (string.IsNullOrEmpty(fileExtension) || !allowedExtensions.Contains(fileExtension))
        {
            return BadRequest("Invalid file format. Only JPG, JPEG, PNG or GIF images are allowed.");
        }

        try
        {
            // Verify owner exists
            var owner = await _service.GetAsync(id);
            if (owner == null)
            {
                return NotFound($"Owner with ID {id} not found");
            }

            // Delete previous image if it exists
            if (!string.IsNullOrEmpty(owner.Photo))
            {
                try
                {
                    await _storageService.DeleteFileAsync(owner.Photo, BucketName);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error deleting previous image for owner {OwnerId}", id);
                    // Continue with new image upload even if old image deletion fails
                }
            }

            // Upload the new image
            var prefix = $"owners/{id}";
            var uploadResult = await _storageService.UploadFileAsync(file, BucketName, prefix);

            // Update the photo reference in the owner
            owner.Photo = uploadResult.FileKey;
            await _service.UpdateAsync(id, owner);

            // Return the photo URL
            var photoUrl = _storageService.GetPublicFileUrl(uploadResult.FileKey, BucketName);

            return Ok(new
            {
                PhotoUrl = photoUrl,
                Message = "Profile photo updated successfully"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading profile photo for owner {OwnerId}", id);
            return StatusCode(500, "Error processing request");
        }
    }

    /// <summary>
    /// Creates a new owner
    /// </summary>
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created, Type = typeof(Owner))]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Post([FromBody] Owner newOwner)
    {
        return await CreateAsync(newOwner, "GetOwner", e => new { id = e.Id });
    }

    /// <summary>
    /// Updates an existing owner
    /// </summary>
    /// <param name="id">ID of the owner to update</param>
    [HttpPut("{id:length(24)}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<Owner>> Update(string id, [FromBody] Owner updatedOwner)
    {
        return await UpdateAsync(id, updatedOwner);
    }

    /// <summary>
    /// Deletes an owner
    /// </summary>
    /// <param name="id">ID of the owner to delete</param>
    [HttpDelete("{id:length(24)}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(string id)
    {
        return await DeleteAsync(id);
    }
}
