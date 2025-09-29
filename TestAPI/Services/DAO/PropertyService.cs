using MongoDB.Bson;
using MongoDB.Driver;
using TestAPI.Model;
using TestAPI.Model.Responses;
using TestAPI.Services.Storage;

namespace TestAPI.Services.DAO;

public class PropertyService : BaseService<Property>
{
    private readonly OwnerService _ownerService;
    private readonly PropertyImageService _imgService;
    private readonly IStorageService _storageService;
    private readonly ILogger<PropertyService> _logger;

    public PropertyService(
        MongoDBService mongoDB,
        OwnerService ownerService,
        PropertyImageService propertyImageService,
        IStorageService storageService,
        ILogger<PropertyService> logger)
        : base(mongoDB.GetCollection<Property>("properties"))
    {
        _ownerService = ownerService;
        _imgService = propertyImageService;
        _storageService = storageService;
        _logger = logger;

        // Create indexes for common searches
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
                _logger.LogError(ex, "Error getting cover image for property {PropertyId}", property.Id);
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
                _logger.LogError(ex, "Error getting cover image for property {PropertyId}", property.Id);
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

    public override async Task<PaginatedResponse<Property>> GetPaginatedAsync(
        int page = 1,
        int pageSize = 10,
        FilterDefinition<Property>? filter = null,
        SortDefinition<Property>? sort = null)
    {
        var props = await base.GetPaginatedAsync(page, pageSize, filter, sort);

        // Procesar cada propiedad para agregar la URL de la imagen de portada
        foreach (var property in props.Data)
        {
            try
            {
                property.CoverImageUrl = await GetCoverImageAsync(property.Id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting cover image for property {PropertyId}", property.Id);
                property.CoverImageUrl = string.Empty;
            }
        }

        return props;
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

            return _storageService.GetPublicFileUrl(image.File, _storageService.PropertyImageBucketName);
        }
        catch
        {
            return string.Empty;
        }
    }

    // Helper method to safely get decimal values
    private decimal GetDecimalValue(BsonValue value, decimal defaultValue = 0)
    {
        try
        {
            if (value == null || value.IsBsonNull) return defaultValue;

            if (value.IsDecimal128) return Decimal128.ToDecimal(value.AsDecimal128);
            if (value.IsDouble) return Convert.ToDecimal(value.AsDouble);
            if (value.IsInt32) return value.AsInt32;
            if (value.IsInt64) return value.AsInt64;

            return defaultValue;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error converting decimal value: {Value}", value);
            return defaultValue;
        }
    }

    public async Task<PropertyMetadataResponse> GetPropertyMetadataAsync()
    {
        _logger.LogInformation("Starting to get property metadata");

        try
        {
            _logger.LogDebug("Building aggregation pipeline");
            var pipeline = new[]
            {
                new BsonDocument("$group",
                    new BsonDocument
                    {
                        { "_id", BsonNull.Value },
                        { "minPrice", new BsonDocument("$min", "$price") },
                        { "maxPrice", new BsonDocument("$max", "$price") },
                        { "avgPrice", new BsonDocument("$avg", "$price") },
                        { "minYear", new BsonDocument("$min", "$year") },
                        { "maxYear", new BsonDocument("$max", "$year") },
                        { "totalProperties", new BsonDocument("$sum", 1) }
                    }
                )
            };

            _logger.LogDebug("Executing aggregation query in MongoDB");
            var result = await _collection.Aggregate<BsonDocument>(pipeline).FirstOrDefaultAsync();

            // Log the raw result for debugging
            _logger.LogDebug("Aggregation result: {Result}", result?.ToJson());

            // If there are no properties or the aggregation returned null, return default values
            if (result == null || !result.Contains("totalProperties") || result["totalProperties"].AsInt32 == 0)
            {
                _logger.LogInformation("No properties found in the database, returning default values");
                return new PropertyMetadataResponse
                {
                    PriceRange = new PriceRange { Min = 0, Max = 0, Average = 0 },
                    YearRange = new YearRange { Min = 1900, Max = DateTime.Now.Year },
                    TotalProperties = 0
                };
            }

            _logger.LogInformation("Processing aggregation results");

            var response = new PropertyMetadataResponse
            {
                PriceRange = new PriceRange
                {
                    Min = GetDecimalValue(result.GetValue("minPrice", BsonNull.Value)),
                    Max = GetDecimalValue(result.GetValue("maxPrice", BsonNull.Value), 10000000),
                    Average = GetDecimalValue(result.GetValue("avgPrice", BsonNull.Value))
                },
                YearRange = new YearRange
                {
                    Min = (int)GetDecimalValue(result.GetValue("minYear", BsonNull.Value), 1900),
                    Max = (int)GetDecimalValue(result.GetValue("maxYear", BsonNull.Value), DateTime.Now.Year)
                },
                TotalProperties = (int)GetDecimalValue(result.GetValue("totalProperties", BsonNull.Value), 0)
            };

            _logger.LogInformation("Metadata generated successfully. Total properties: {Count}", response.TotalProperties);
            _logger.LogDebug("Rango de precios: Min={MinPrice}, Max={MaxPrice}, Promedio={AvgPrice}",
                response.PriceRange.Min, response.PriceRange.Max, response.PriceRange.Average);
            _logger.LogDebug("Rango de años: Min={MinYear}, Max={MaxYear}",
                response.YearRange.Min, response.YearRange.Max);

            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting property metadata");
            // Return default values in case of error
            return new PropertyMetadataResponse
            {
                PriceRange = new PriceRange { Min = 0, Max = 0, Average = 0 },
                YearRange = new YearRange { Min = 1900, Max = DateTime.Now.Year },
                TotalProperties = 0
            };
        }
    }
}
