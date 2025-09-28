using System.ComponentModel.DataAnnotations;
using MongoDB.Driver;
using TestAPI.Model;
using TestAPI.Services.Interfaces;

namespace TestAPI.Services.DAO;

public class PropertyService : BaseService<Property>
{
    private readonly OwnerService _ownerService;
    private readonly PropertyImageService _imgService;
    private readonly IS3Service _s3Service;
    private readonly ILogger<PropertyService> _logger;

    public PropertyService(
        MongoDBService mongoDB,
        OwnerService ownerService,
        PropertyImageService propertyImageService,
        IS3Service s3Service,
        ILogger<PropertyService> logger)
        : base(mongoDB.GetCollection<Property>("properties"))
    {
        _ownerService = ownerService;
        _imgService = propertyImageService;
        _s3Service = s3Service;
        _logger = logger;

        // Crear índices para búsquedas comunes
        var nameIndexKeys = Builders<Property>.IndexKeys.Ascending(x => x.Name);
        var ownerIndexKeys = Builders<Property>.IndexKeys.Ascending(x => x.IdOwner);
        var priceIndexKeys = Builders<Property>.IndexKeys.Ascending(x => x.Price);

        _collection.Indexes.CreateOne(new CreateIndexModel<Property>(nameIndexKeys));
        _collection.Indexes.CreateOne(new CreateIndexModel<Property>(ownerIndexKeys));
        _collection.Indexes.CreateOne(new CreateIndexModel<Property>(priceIndexKeys));
    }

    public override async Task<List<Property>> GetAsync()
    {
        var props = await base.GetAsync();

        // Procesar cada propiedad para agregar la URL de la imagen de portada
        foreach (var property in props)
        {
            try
            {
                property.CoverImageUrl = await GetCoverImageAsync(property.Id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener la imagen de portada para la propiedad {PropertyId}", property.Id);
                property.CoverImageUrl = string.Empty;
            }
        }

        return props;
    }

    public override async Task<List<Property>> GetAsync(FilterDefinition<Property> filter = null)
    {
        var props = await base.GetAsync(filter);

        // Procesar cada propiedad para agregar la URL de la imagen de portada
        foreach (var property in props)
        {
            try
            {
                property.CoverImageUrl = await GetCoverImageAsync(property.Id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener la imagen de portada para la propiedad {PropertyId}", property.Id);
                property.CoverImageUrl = string.Empty;
            }
        }

        return props;
    }


    public override async Task<Property> GetAsync(string id)
    {
        var property = await base.GetAsync(id);
        property.CoverImageUrl = await GetCoverImageAsync(property.Id);
        return property;
    }

    public async Task<Owner?> GetOwnerAsync(string id)
    {
        try
        {
            var property = await GetAsync(id);
            return await _ownerService.GetAsync(property.IdOwner);
        }
        catch (KeyNotFoundException)
        {
            return null;
        }
    }

    public async Task<string> GetCoverImageAsync(string id)
    {
        try
        {
            var filter = Builders<PropertyImage>.Filter.Eq(x => x.IdProperty, id);
            var images = await _imgService.GetAsync(filter);
            var image = images.FirstOrDefault();

            if (image == null || string.IsNullOrEmpty(image.File))
            {
                return string.Empty;
            }

            return _s3Service.GetPublicFileUrl(image.File, _s3Service.PropertyImageBucketName);
        }
        catch
        {
            return string.Empty;
        }
    }
}
