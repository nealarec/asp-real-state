
using System.Text.Json.Serialization;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace TestAPI.Model;

public class Property : IEntity
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    [BsonElement("_id")]
    [JsonPropertyName("id")]
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
    public string Id { get; set; } = string.Empty;

    [BsonIgnore]
    string IEntity.Id { get => Id; set => Id = value; }

    [BsonRequired]
    [BsonElement("name")]
    public string Name { get; set; } = string.Empty;

    [BsonRequired]
    [BsonElement("address")]
    public string Address { get; set; } = string.Empty;

    [BsonRequired]
    [BsonElement("price")]
    public decimal Price { get; set; }

    [BsonRequired]
    [BsonElement("codeInternal")]
    public string CodeInternal { get; set; } = string.Empty;

    [BsonRequired]
    [BsonElement("year")]
    public int Year { get; set; }

    [BsonRequired]
    [BsonRepresentation(BsonType.ObjectId)]
    [BsonElement("idOwner")]
    public string IdOwner { get; set; } = string.Empty;

    [BsonIgnore]
    [JsonPropertyName("coverImageUrl")]
    public string? CoverImageUrl { get; set; } = "";
}