using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace TestAPI.Model;

public class Owner : IEntity
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    [BsonElement("_id")]
    [JsonPropertyName("id")]
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
    public string Id { get; set; } = string.Empty;
    
    [BsonIgnore]
    string IEntity.Id { get => Id; set => Id = value; }

    [Required]
    [BsonElement("name")]
    public string Name { get; set; } = null!;

    [Required]
    [BsonElement("address")]
    public string Address { get; set; } = null!;

    [BsonElement("photo")]
    public string? Photo { get; set; }

    [BsonElement("birthday")]
    [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
    public DateTime Birthday { get; set; }

}
