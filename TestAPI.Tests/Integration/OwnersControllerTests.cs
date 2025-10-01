using System.Net;
using System.Net.Http.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc.Testing;
using NUnit.Framework;
using TestAPI;
using TestAPI.Model;
using TestAPI.Model.Responses;
using TestAPI.Services.DAO;

namespace TestAPI.Tests.Integration;

[TestFixture]
public class OwnersControllerTests : IntegrationTestBase
{
    private OwnerService _ownerService;

    [SetUp]
    public void Setup()
    {
        _ownerService = CreateOwnerService();
    }

    [Test]
    public async Task GetOwners_WhenCalled_ReturnsPaginatedListOfOwners()
    {
        // Arrange
        var testOwner = await CreateTestOwner();

        // Act
        var response = await _client.GetAsync("/api/owners?page=1&pageSize=10");
        var result = await response.Content.ReadFromJsonAsync<PaginatedResponse<Owner>>();

        // Assert
        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.OK));
        Assert.That(result, Is.Not.Null);
        Assert.That(result.Data, Is.Not.Null);
        Assert.That(result.Page, Is.EqualTo(1));
        Assert.That(result.PageSize, Is.EqualTo(10));
        Assert.That(result.TotalPages, Is.GreaterThan(0));
        Assert.That(result.TotalCount, Is.GreaterThan(0));
    }

    [Test]
    public async Task GetOwnerById_WithValidId_ReturnsOwner()
    {
        // Arrange
        var testOwner = await CreateTestOwner();

        // Act
        var response = await _client.GetAsync($"/api/owners/{testOwner.Id}");
        var owner = await response.Content.ReadFromJsonAsync<Owner>();

        // Assert
        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.OK));
        Assert.That(owner, Is.Not.Null);
        Assert.That(owner.Id, Is.EqualTo(testOwner.Id));
        Assert.That(owner.Name, Is.EqualTo(testOwner.Name));
    }

    [Test]
    public async Task GetOwnerById_WithInvalidId_ReturnsNotFound()
    {
        // Arrange
        var invalidId = "507f1f77bcf86cd799439011"; // ID de MongoDB válido pero que no existe

        // Act
        var response = await _client.GetAsync($"/api/owners/{invalidId}");

        // Assert
        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.NotFound));
    }


    [Test]
    public async Task GetOwners_WithFilter_ReturnsFilteredOwners()
    {
        // Arrange
        var testOwner = await CreateTestOwner("Nelson Mandela");

        // Act
        var response = await _client.GetAsync($"/api/owners?search={testOwner.Name}&page=1&pageSize=10");
        var result = await response.Content.ReadFromJsonAsync<PaginatedResponse<Owner>>();

        // Assert
        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.OK));
        Assert.That(result, Is.Not.Null);
        Assert.That(result.Data, Is.Not.Null);
        Assert.That(result.Data.Count(), Is.EqualTo(1));
        Assert.That(result.Data.First().Name, Is.EqualTo(testOwner.Name));
        Assert.That(result.Page, Is.EqualTo(1));
        Assert.That(result.PageSize, Is.EqualTo(10));
    }

    [Test]
    public async Task GetOwners_WithPartialName_ReturnsFilteredOwners()
    {
        // Arrange
        var testOwner = await CreateTestOwner("Natalia Vargas");

        // Act
        var response = await _client.GetAsync($"/api/owners?search=Natalia&page=1&pageSize=10");
        var result = await response.Content.ReadFromJsonAsync<PaginatedResponse<Owner>>();

        // Assert
        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.OK));
        Assert.That(result, Is.Not.Null);
        Assert.That(result.Data, Is.Not.Null);
        Assert.That(result.Data.Count(), Is.EqualTo(1));
        Assert.That(result.Data.First().Name, Is.EqualTo(testOwner.Name));
        Assert.That(result.Page, Is.EqualTo(1));
        Assert.That(result.PageSize, Is.EqualTo(10));
    }

    [Test]
    public async Task CreateOwner_WithValidData_ReturnsCreatedOwner()
    {
        // Arrange
        var newOwner = new Owner
        {
            Name = "Nuevo Propietario",
            Address = "Calle 123",
            Photo = "profile.jpg",
            Birthday = DateTime.UtcNow.AddYears(-30),
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/owners", newOwner);
        var createdOwner = await response.Content.ReadFromJsonAsync<Owner>();

        // Assert
        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.Created));
        Assert.That(createdOwner, Is.Not.Null);
        Assert.That(createdOwner.Id, Is.Not.Null.Or.Empty);
        Assert.That(createdOwner.Name, Is.EqualTo(newOwner.Name));
        Assert.That(createdOwner.Address, Is.EqualTo(newOwner.Address));
    }

    [Test]
    public async Task UpdateOwner_WithValidData_ReturnsUpdatedOwner()
    {
        // Arrange
        var testOwner = await CreateTestOwner("Propietario Original");
        var updatedOwner = new Owner
        {
            Id = testOwner.Id,
            Name = "Propietario Actualizado",
            Address = "Nueva Dirección 456",
            Photo = "new-photo.jpg",
            Birthday = testOwner.Birthday,
        };

        // Act
        var response = await _client.PutAsJsonAsync($"/api/owners/{testOwner.Id}", updatedOwner);
        var result = await response.Content.ReadFromJsonAsync<Owner>();

        // Assert
        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.OK));
        Assert.That(result, Is.Not.Null);
        Assert.That(result.Id, Is.EqualTo(testOwner.Id));
        Assert.That(result.Name, Is.EqualTo(updatedOwner.Name));
        Assert.That(result.Address, Is.EqualTo(updatedOwner.Address));
    }

    [Test]
    public async Task UpdateOwner_WithNonExistentId_ReturnsNotFound()
    {
        // Arrange
        var nonExistentId = "507f1f77bcf86cd799439011"; // Valid MongoDB ID that doesn't exist
        var updatedOwner = new Owner
        {
            Id = nonExistentId,
            Name = "No Debería Existir",
            Address = "Dirección Inexistente"
        };

        // Act
        var response = await _client.PutAsJsonAsync($"/api/owners/{nonExistentId}", updatedOwner);

        // Assert
        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.NotFound));
    }

    [Test]
    public async Task DeleteOwner_WithValidId_ReturnsNoContent()
    {
        // Arrange
        var testOwner = await CreateTestOwner("Propietario a Eliminar");

        // Act
        var deleteResponse = await _client.DeleteAsync($"/api/owners/{testOwner.Id}");

        // Verificar que el propietario ya no existe
        var getResponse = await _client.GetAsync($"/api/owners/{testOwner.Id}");

        // Assert
        Assert.That(deleteResponse.StatusCode, Is.EqualTo(HttpStatusCode.NoContent));
        Assert.That(getResponse.StatusCode, Is.EqualTo(HttpStatusCode.NotFound));
    }

    [Test]
    public async Task DeleteOwner_WithNonExistentId_ReturnsNotFound()
    {
        // Arrange
        var nonExistentId = "507f1f77bcf86cd799439011"; // Valid MongoDB ID that doesn't exist

        // Act
        var response = await _client.DeleteAsync($"/api/owners/{nonExistentId}");

        // Assert
        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.NotFound));
    }

    [Test]
    public async Task GetOwnerProperties_WithValidOwnerId_ReturnsProperties()
    {
        // Arrange
        // Create an owner
        var owner = await CreateTestOwner("Propietario de Prueba");

        // Create properties associated with the owner
        var property1 = await CreateTestProperty("Propiedad 1", "Calle 123", owner.Id);
        var property2 = await CreateTestProperty("Propiedad 2", "Avenida 456", owner.Id);

        // Create a property that doesn't belong to the owner
        var otherOwner = await CreateTestOwner("Otro Propietario");
        await CreateTestProperty("Otra Propiedad", "Calle 789", otherOwner.Id);

        // Act
        var response = await _client.GetAsync($"/api/owners/{owner.Id}/properties");
        var properties = await response.Content.ReadFromJsonAsync<Property[]>();

        // Assert
        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.OK));
        Assert.That(properties, Is.Not.Null);
        Assert.That(properties, Has.Length.EqualTo(2));
        Assert.That(properties.Any(p => p.Id == property1.Id), Is.True);
        Assert.That(properties.Any(p => p.Id == property2.Id), Is.True);
    }

    [Test]
    public async Task GetOwnerProperties_WithNonExistentOwnerId_ReturnsNotFound()
    {
        // Arrange
        var nonExistentId = "507f1f77bcf86cd799439011"; // Valid MongoDB ID that doesn't exist

        // Act
        var response = await _client.GetAsync($"/api/owners/{nonExistentId}/properties");

        // Assert
        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.NotFound));

        // Verify the response content is not empty and contains the expected error message
        var content = await response.Content.ReadAsStringAsync();
        Assert.That(content, Is.Not.Null.Or.Empty);
        Assert.That(content, Does.Contain("Owner with ID"));
        Assert.That(content, Does.Contain("not found"));
    }
}
