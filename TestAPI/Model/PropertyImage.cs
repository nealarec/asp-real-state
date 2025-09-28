
using System.Text.Json.Serialization;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace TestAPI.Model;
public class PropertyImage : IEntity
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    [BsonElement("_id")]
    [JsonPropertyName("id")]
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]

    public required string Id { get; set; } = string.Empty;

    [BsonIgnore]
    string IEntity.Id { get => Id; set => Id = value ?? string.Empty; }

    [BsonRequired]
    [BsonRepresentation(BsonType.ObjectId)]
    [BsonElement("idProperty")]
    public string IdProperty { get; set; } = string.Empty;

    [BsonRequired]
    [BsonElement("file")]
    public string File { get; set; } = string.Empty;

    [BsonElement("thumbnail")]
    public string? Thumbnail { get; set; }

    [BsonElement("enabled")]
    public bool Enabled { get; set; } = true;
}
