
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace TestAPI.Model;

public class Property
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string IdProperty { get; set; }
    public string Name { get; set; }
    public string Address { get; set; }
    public decimal Price { get; set; }
    public string CodeInternal { get; set; }
    public int Year { get; set; }

    [BsonRepresentation(BsonType.ObjectId)]
    public string IdOwner { get; set; }
}