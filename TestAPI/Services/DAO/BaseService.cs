using MongoDB.Driver;
using TestAPI.Model;
using TestAPI.Model.Responses;

namespace TestAPI.Services.DAO;

public abstract class BaseService<T> where T : class, IEntity
{
    protected readonly IMongoCollection<T> _collection;

    protected BaseService(IMongoCollection<T> collection)
    {
        _collection = collection;
    }

    public virtual async Task<PaginatedResponse<T>> GetPaginatedAsync(
        int page = 1,
        int pageSize = 10,
        FilterDefinition<T>? filter = null,
        SortDefinition<T>? sort = null)
    {
        var query = filter == null
            ? _collection.Find(_ => true)
            : _collection.Find(filter);

        if (sort != null)
        {
            query = query.Sort(sort);
        }

        var totalCount = await query.CountDocumentsAsync();
        var items = await query
            .Skip((page - 1) * pageSize)
            .Limit(pageSize)
            .ToListAsync();

        return new PaginatedResponse<T>
        {
            Data = items,
            Page = page,
            PageSize = pageSize,
            TotalCount = (int)totalCount
        };
    }

    public virtual async Task<List<T>> GetAsync() =>
        await _collection.Find(_ => true).ToListAsync();

    public virtual async Task<T> GetAsync(string id)
    {
        var entity = await _collection.Find(x => x.Id == id).FirstOrDefaultAsync();
        if (entity == null) throw new KeyNotFoundException($"No entity found with ID {id}");
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
        return result.IsAcknowledged && result.MatchedCount > 0;
    }

    public virtual async Task<bool> DeleteAsync(string id)
    {
        var result = await _collection.DeleteOneAsync(x => x.Id == id);
        return result.IsAcknowledged && result.DeletedCount > 0;
    }
}
