using MongoDB.Driver;
using TestAPI.Model;
using TestAPI.Model.Responses;
using TestAPI.Services.Storage;

namespace TestAPI.Services.DAO;

public class OwnerService : BaseService<Owner>
{
    private readonly IStorageService _storageService;
    private const string BucketName = "owner-images";
    private readonly ILogger<OwnerService> _logger;

    public OwnerService(MongoDBService mongoDB, IStorageService storageService, ILogger<OwnerService> logger)
        : base(mongoDB.GetCollection<Owner>("owners"))
    {
        _storageService = storageService;
        _logger = logger;

        // Create text index for name searches
        var indexKeys = Builders<Owner>.IndexKeys.Ascending(x => x.Name);
        _collection.Indexes.CreateOne(new CreateIndexModel<Owner>(indexKeys));
    }

    public override async Task<List<Owner>> GetAsync()
    {
        var owners = await base.GetAsync();
        foreach (var owner in owners) UpdatePhotoUrl(owner);
        return owners;
    }

    public override async Task<Owner> GetAsync(string id)
    {
        var owner = await base.GetAsync(id);
        UpdatePhotoUrl(owner);
        return owner;
    }

    public override async Task<List<Owner>> GetAsync(FilterDefinition<Owner> filter)
    {
        var owners = await base.GetAsync(filter);
        foreach (var owner in owners) UpdatePhotoUrl(owner);
        return owners;
    }



    public override async Task<PaginatedResponse<Owner>> GetPaginatedAsync(
        int page = 1,
        int pageSize = 10,
        FilterDefinition<Owner>? filter = null,
        SortDefinition<Owner>? sort = null)
    {
        var owners = await base.GetPaginatedAsync(page, pageSize, filter, sort);
        foreach (var owner in owners.Data) UpdatePhotoUrl(owner);
        return owners;
    }


    private Owner UpdatePhotoUrl(Owner owner)
    {
        if (!string.IsNullOrEmpty(owner.Photo))
        {
            try
            {
                owner.Photo = _storageService.GetPublicFileUrl(owner.Photo, BucketName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting profile photo URL for owner {OwnerId}", owner.Id);
            }
        }
        return owner;
    }
}
