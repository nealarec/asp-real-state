using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;


namespace TestAPI.Model;


public class PropertyTrace : IEntity
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    [BsonElement("_id")]
    public string Id { get; set; }

    [BsonIgnore]
    string IEntity.Id { get => Id; set => Id = value; }

    [BsonRepresentation(BsonType.ObjectId)]
    [BsonElement("idProperty")]
    public string IdProperty { get; set; }

    [BsonElement("dateSale")]
    public DateTime DateSale { get; set; }

    [BsonElement("name")]
    public string Name { get; set; }

    [BsonElement("value")]
    public decimal Value { get; set; }

    [BsonElement("tax")]
    public decimal Tax { get; set; }
}
