using MongoDB.Driver;
using TestAPI.Model;

namespace TestAPI.Services.DAO;

public class PropertyTraceService : BaseService<PropertyTrace>
{
    public PropertyTraceService(MongoDBService mongoDB)
        : base(mongoDB.GetCollection<PropertyTrace>("propertyTraces"))
    {
        // Crear índices para búsquedas comunes
        var propertyIdIndexKeys = Builders<PropertyTrace>.IndexKeys.Ascending(x => x.IdProperty);
        var dateSaleIndexKeys = Builders<PropertyTrace>.IndexKeys.Descending(x => x.DateSale);

        _collection.Indexes.CreateOne(new CreateIndexModel<PropertyTrace>(propertyIdIndexKeys));
        _collection.Indexes.CreateOne(new CreateIndexModel<PropertyTrace>(dateSaleIndexKeys));
    }
}
