using System.Net;
using System.Net.Http.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc.Testing;
using MongoDB.Driver;
using NUnit.Framework;
using TestAPI.Model;
using TestAPI.Model.Responses;
using TestAPI.Services.DAO;

namespace TestAPI.Tests.Integration;

[TestFixture]
public class PropertiesControllerTests : IntegrationTestBase
{
    private PropertyService _propertyService;

    [SetUp]
    public void Setup()
    {
        _propertyService = CreatePropertyService();
    }

    [Test]
    public async Task GetProperties_WhenCalled_ReturnsPaginatedListOfProperties()
    {
        // Arrange
        var owner = await CreateTestOwner();
        await CreateTestProperty("Test Property 1", owner.Id);
        await CreateTestProperty("Test Property 2", owner.Id);

        // Act
        var response = await _client.GetAsync("/api/properties?page=1&pageSize=10");
        var result = await response.Content.ReadFromJsonAsync<PaginatedResponse<Property>>();

        // Assert
        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.OK));
        Assert.That(result, Is.Not.Null);
        Assert.That(result.Data, Is.Not.Null);
        Assert.That(result.Page, Is.EqualTo(1));
        Assert.That(result.PageSize, Is.EqualTo(10));
        Assert.That(result.TotalCount, Is.GreaterThanOrEqualTo(2));
    }

    [Test]
    public async Task GetPropertyById_WithValidId_ReturnsProperty()
    {
        // Arrange
        var owner = await CreateTestOwner();
        var testProperty = await CreateTestProperty("Test Property", owner.Id);

        // Act
        var response = await _client.GetAsync($"/api/properties/{testProperty.Id}");
        var property = await response.Content.ReadFromJsonAsync<Property>();

        // Assert
        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.OK));
        Assert.That(property, Is.Not.Null);
        Assert.That(property!.Name, Is.EqualTo("Test Property"));
    }

    [Test]
    public async Task GetPropertyById_WithInvalidId_ReturnsNotFound()
    {
        // Arrange
        var invalidId = "507f1f77bcf86cd799439011"; // Valid ID that doesn't exist

        // Act
        var response = await _client.GetAsync($"/api/properties/{invalidId}");

        // Assert
        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.NotFound));
    }

    [Test]
    public async Task CreateProperty_WithValidData_ReturnsCreatedProperty()
    {
        // Arrange
        var owner = await CreateTestOwner();
        var newProperty = new Property
        {
            Name = "New Test Property",
            Address = "123 Test St",
            Price = 100000,
            CodeInternal = "PROP-001",
            Year = 2023,
            IdOwner = owner.Id
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/properties", newProperty);

        // Debug: Print response content
        var responseContent = await response.Content.ReadAsStringAsync();
        Console.WriteLine($"Response Content: {responseContent}");

        // Assert status code first
        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.Created), $"Expected Created (201) but got {response.StatusCode}. Response: {responseContent}");

        // Try to deserialize
        var createdProperty = await response.Content.ReadFromJsonAsync<Property>();
        Assert.That(createdProperty, Is.Not.Null, "Failed to deserialize response to Property");
        Assert.That(createdProperty!.Name, Is.EqualTo("New Test Property"));
        Assert.That(createdProperty.Id, Is.Not.Null.Or.Empty, "Created property should have an ID");
    }

    [Test]
    public async Task UpdateProperty_WithValidData_ReturnsUpdatedProperty()
    {
        // Arrange
        var owner = await CreateTestOwner();
        var testProperty = await CreateTestProperty("Test Property", owner.Id);

        var updatedProperty = new Property
        {
            Id = testProperty.Id,
            Name = "Updated Test Property",
            Address = testProperty.Address,
            Price = 200000,
            CodeInternal = testProperty.CodeInternal,
            Year = testProperty.Year,
            IdOwner = testProperty.IdOwner
        };

        // Act
        var response = await _client.PutAsJsonAsync($"/api/properties/{testProperty.Id}", updatedProperty);

        // Debug: Print response content
        var responseContent = await response.Content.ReadAsStringAsync();
        Console.WriteLine($"Update Response Content: {responseContent}");

        // Assert status code first
        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.OK),
            $"Expected OK (200) but got {response.StatusCode}. Response: {responseContent}");

        // Try to deserialize the response
        var updated = await response.Content.ReadFromJsonAsync<Property>();

        // If deserialization fails, try to get the property from the database
        if (updated == null)
        {
            Console.WriteLine("Failed to deserialize update response. Trying to get the property directly...");
            var getResponse = await _client.GetAsync($"/api/properties/{testProperty.Id}");
            updated = await getResponse.Content.ReadFromJsonAsync<Property>();
        }

        // Verify the updated properties
        Assert.That(updated, Is.Not.Null, "Failed to get updated property");
        Assert.That(updated!.Name, Is.EqualTo("Updated Test Property"));
        Assert.That(updated.Price, Is.EqualTo(200000));
    }

    [Test]
    public async Task DeleteProperty_WithValidId_ReturnsNoContent()
    {
        // Arrange
        var owner = await CreateTestOwner();
        var testProperty = await CreateTestProperty("Test Property to Delete", owner.Id);

        // Act
        var response = await _client.DeleteAsync($"/api/properties/{testProperty.Id}");

        // Assert
        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.NoContent));

        // Verify it no longer exists
        var getResponse = await _client.GetAsync($"/api/properties/{testProperty.Id}");
        Assert.That(getResponse.StatusCode, Is.EqualTo(HttpStatusCode.NotFound));
    }

    [Test]
    public async Task GetProperties_WithOwnerFilter_ReturnsFilteredProperties()
    {
        // Arrange
        var owner1 = await CreateTestOwner("Owner 1");
        var owner2 = await CreateTestOwner("Owner 2");

        await CreateTestProperty("Property 1", owner1.Id);
        await CreateTestProperty("Property 2", owner1.Id);
        await CreateTestProperty("Property 3", owner2.Id);

        // Act
        var response = await _client.GetAsync($"/api/properties?ownerId={owner1.Id}&page=1&pageSize=10");
        var result = await response.Content.ReadFromJsonAsync<PaginatedResponse<Property>>();

        // Assert
        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.OK));
        Assert.That(result, Is.Not.Null);
        Assert.That(result.Data, Is.Not.Null);
        Assert.That(result.Data.Count(), Is.EqualTo(2));
        Assert.That(result.Data.All(p => p.IdOwner == owner1.Id), Is.True);
        Assert.That(result.Page, Is.EqualTo(1));
        Assert.That(result.PageSize, Is.EqualTo(10));
        Assert.That(result.TotalCount, Is.EqualTo(2));
    }

    [Test]
    public async Task GetProperties_WithSearch_ReturnsMatchingProperties()
    {
        // Arrange
        var owner = await CreateTestOwner();
        await CreateTestProperty("Beach House", owner.Id, "123 Beach Rd");
        await CreateTestProperty("Mountain Cabin", owner.Id, "456 Mountain Ln");
        await CreateTestProperty("Downtown Apartment", owner.Id, "789 City St");

        // Act - Search by name
        var response1 = await _client.GetAsync("/api/properties?search=Beach&page=1&pageSize=10");
        var result1 = await response1.Content.ReadFromJsonAsync<PaginatedResponse<Property>>();

        // Assert
        Assert.That(response1.StatusCode, Is.EqualTo(HttpStatusCode.OK));
        Assert.That(result1, Is.Not.Null);
        Assert.That(result1.Data, Is.Not.Null);
        Assert.That(result1.Data.Count(), Is.EqualTo(1));
        Assert.That(result1.Data.First().Name, Is.EqualTo("Beach House"));
        Assert.That(result1.Page, Is.EqualTo(1));
        Assert.That(result1.PageSize, Is.EqualTo(10));
        Assert.That(result1.TotalCount, Is.EqualTo(1));

        // Act - Search by address
        var response2 = await _client.GetAsync("/api/properties?search=Mountain&page=1&pageSize=10");
        var result2 = await response2.Content.ReadFromJsonAsync<PaginatedResponse<Property>>();

        // Assert
        Assert.That(response2.StatusCode, Is.EqualTo(HttpStatusCode.OK));
        Assert.That(result2, Is.Not.Null);
        Assert.That(result2.Data, Is.Not.Null);
        Assert.That(result2.Data.Count(), Is.EqualTo(1));
        Assert.That(result2.Data.First().Address, Is.EqualTo("456 Mountain Ln"));
        Assert.That(result2.Page, Is.EqualTo(1));
        Assert.That(result2.PageSize, Is.EqualTo(10));
        Assert.That(result2.TotalCount, Is.EqualTo(1));
    }

    private new async Task<Property> CreateTestProperty(string name, string ownerId, string address = "123 Test St")
    {
        var property = new Property
        {
            Name = name,
            Address = address,
            Price = 150000,
            CodeInternal = $"PROP-{Guid.NewGuid()}",
            Year = 2023,
            IdOwner = ownerId
        };

        var collection = _database.GetCollection<Property>("properties");
        await collection.InsertOneAsync(property);
        return property;
    }
}
