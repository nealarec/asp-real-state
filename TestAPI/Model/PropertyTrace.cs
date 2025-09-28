using System.Text.Json.Serialization;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;


namespace TestAPI.Model;


public class PropertyTrace : IEntity
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    [BsonElement("_id")]
    [JsonPropertyName("id")]
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]

    public string Id { get; set; } = string.Empty;

    [BsonIgnore]
    string IEntity.Id { get => Id; set => Id = value; }

    [BsonRepresentation(BsonType.ObjectId)]
    [BsonElement("idProperty")]
    public string IdProperty { get; set; } = string.Empty;

    [BsonElement("dateSale")]
    public DateTime DateSale { get; set; }

    [BsonRequired]
    [BsonElement("name")]
    public string Name { get; set; } = string.Empty;

    [BsonRequired]
    [BsonElement("value")]
    public decimal Value { get; set; } = 0;

    [BsonRequired]
    [BsonElement("tax")]
    public decimal Tax { get; set; } = 0;
}
