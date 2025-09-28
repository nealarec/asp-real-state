using MongoDB.Driver;
using TestAPI.Model;
using TestAPI.Services.Interfaces;

namespace TestAPI.Services.DAO;

public class OwnerService : BaseService<Owner>
{
    private readonly IS3Service _s3Service;
    private const string BucketName = "owner-images";
    private readonly ILogger<OwnerService> _logger;

    public OwnerService(MongoDBService mongoDB, IS3Service s3Service, ILogger<OwnerService> logger)
        : base(mongoDB.GetCollection<Owner>("owners"))
    {
        _s3Service = s3Service;
        _logger = logger;

        // Create text index for name searches
        var indexKeys = Builders<Owner>.IndexKeys.Text(x => x.Name);
        _collection.Indexes.CreateOne(new CreateIndexModel<Owner>(indexKeys));
    }

    public override async Task<List<Owner>> GetAsync()
    {
        var owners = await base.GetAsync();
        _logger.LogInformation("Obteniendo todos los propietarios");
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
        owners.Select(owner => UpdatePhotoUrl(owner));
        return owners;
    }


    private Owner UpdatePhotoUrl(Owner owner)
    {
        _logger.LogInformation("Actualizando URL de la foto de perfil para el propietario {OwnerId}", owner.Id);
        if (!string.IsNullOrEmpty(owner.Photo))
        {
            try
            {
                owner.Photo = _s3Service.GetPublicFileUrl(owner.Photo, BucketName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener la URL de la foto de perfil para el propietario {OwnerId}", owner.Id);
            }
        }
        return owner;
    }
}
