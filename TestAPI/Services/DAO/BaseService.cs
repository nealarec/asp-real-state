using MongoDB.Driver;
using TestAPI.Model;

namespace TestAPI.Services.DAO;

public abstract class BaseService<T> where T : class, IEntity
{
    protected readonly IMongoCollection<T> _collection;

    protected BaseService(IMongoCollection<T> collection)
    {
        _collection = collection;
    }

    public virtual async Task<List<T>> GetAsync() =>
        await _collection.Find(_ => true).ToListAsync();

    public virtual async Task<T> GetAsync(string id)
    {
        var entity = await _collection.Find(x => x.Id == id).FirstOrDefaultAsync();
        if (entity == null) throw new KeyNotFoundException($"No se encontró una entidad con el ID {id}");
        return entity;
    }

    public virtual async Task<List<T>> GetAsync(FilterDefinition<T> filter) =>
        await _collection.Find(filter).ToListAsync();

    public virtual async Task<T> CreateAsync(T entity)
    {
        await _collection.InsertOneAsync(entity);
        return entity;
    }

    public virtual async Task<bool> UpdateAsync(string id, T entity)
    {
        var result = await _collection.ReplaceOneAsync(x => x.Id == id, entity, new ReplaceOptions { IsUpsert = false });
        return result.IsAcknowledged && result.ModifiedCount > 0;
    }

    public virtual async Task<bool> DeleteAsync(string id)
    {
        var result = await _collection.DeleteOneAsync(x => x.Id == id);
        return result.IsAcknowledged && result.DeletedCount > 0;
    }
}
