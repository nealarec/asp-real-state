using MongoDB.Driver;
using TestAPI.Model;

namespace TestAPI.Services.DAO;

public class OwnerService : BaseService<Owner>
{
    public OwnerService(MongoDBService mongoDB)
        : base(mongoDB.GetCollection<Owner>("owners"))
    {
        // Create text index for name searches
        var indexKeys = Builders<Owner>.IndexKeys.Text(x => x.Name);
        _collection.Indexes.CreateOne(new CreateIndexModel<Owner>(indexKeys));
    }
}
