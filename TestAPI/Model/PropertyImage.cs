
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace TestAPI.Model;
public class PropertyImage
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string IdPropertyImage { get; set; }

    [BsonRepresentation(BsonType.ObjectId)]
    public string IdProperty { get; set; }
    public string File { get; set; }
    public bool Enabled { get; set; }
}
