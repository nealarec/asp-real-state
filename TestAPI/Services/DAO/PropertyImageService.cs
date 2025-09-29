using MongoDB.Driver;
using TestAPI.Model;

namespace TestAPI.Services.DAO;

public class PropertyImageService : BaseService<PropertyImage>
{
    public PropertyImageService(MongoDBService mongoDB)
        : base(mongoDB.GetCollection<PropertyImage>("propertyImages"))
    {
        // Create indexes for common searches
        var propertyIndexKeys = Builders<PropertyImage>.IndexKeys.Ascending(x => x.IdProperty);
        var enabledIndexKeys = Builders<PropertyImage>.IndexKeys.Ascending(x => x.Enabled);

        _collection.Indexes.CreateOne(new CreateIndexModel<PropertyImage>(propertyIndexKeys));
        _collection.Indexes.CreateOne(new CreateIndexModel<PropertyImage>(enabledIndexKeys));
    }

}
