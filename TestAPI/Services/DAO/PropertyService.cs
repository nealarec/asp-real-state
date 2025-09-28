using System.ComponentModel.DataAnnotations;
using MongoDB.Driver;
using TestAPI.Model;

namespace TestAPI.Services.DAO;

public class PropertyService : BaseService<Property>
{
    private readonly OwnerService _ownerService;

    public PropertyService(MongoDBService mongoDB, OwnerService ownerService)
        : base(mongoDB.GetCollection<Property>("properties"))
    {
        _ownerService = ownerService;

        // Crear índices para búsquedas comunes
        var nameIndexKeys = Builders<Property>.IndexKeys.Ascending(x => x.Name);
        var ownerIndexKeys = Builders<Property>.IndexKeys.Ascending(x => x.IdOwner);
        var priceIndexKeys = Builders<Property>.IndexKeys.Ascending(x => x.Price);

        _collection.Indexes.CreateOne(new CreateIndexModel<Property>(nameIndexKeys));
        _collection.Indexes.CreateOne(new CreateIndexModel<Property>(ownerIndexKeys));
        _collection.Indexes.CreateOne(new CreateIndexModel<Property>(priceIndexKeys));
    }


    public async Task<Owner> GetOwnerAsync(string id)
    {
        var property = await GetAsync(id);
        return await _ownerService.GetAsync(property.IdOwner);
    }

    public override async Task<Property> CreateAsync(Property property)
    {
        if (property == null)
            throw new ArgumentNullException(nameof(property));

        // Verificar que el propietario exista
        var owner = await _ownerService.GetAsync(property.IdOwner);
        if (owner == null)
        {
            throw new ValidationException($"No existe un propietario con el ID: {property.IdOwner}");
        }

        // Validar campos requeridos
        if (string.IsNullOrWhiteSpace(property.Name))
            throw new ValidationException("El nombre de la propiedad es requerido");

        if (string.IsNullOrWhiteSpace(property.Address))
            throw new ValidationException("La dirección de la propiedad es requerida");

        return await base.CreateAsync(property);
    }
}
