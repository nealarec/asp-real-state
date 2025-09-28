using System.Net;
using System.Net.Http.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc.Testing;
using NUnit.Framework;
using TestAPI;
using TestAPI.Model;
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
    public async Task GetOwners_WhenCalled_ReturnsListOfOwners()
    {
        // Arrange
        var testOwner = await CreateTestOwner();

        // Act
        var response = await Client.GetAsync("/api/owners");
        var owners = await response.Content.ReadFromJsonAsync<Owner[]>();

        // Assert
        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.OK));
        Assert.That(owners, Is.Not.Null);
        Assert.That(owners, Has.Length.GreaterThan(2));
    }

    [Test]
    public async Task GetOwnerById_WithValidId_ReturnsOwner()
    {
        // Arrange
        var testOwner = await CreateTestOwner();

        // Act
        var response = await Client.GetAsync($"/api/owners/{testOwner.Id}");
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
        var response = await Client.GetAsync($"/api/owners/{invalidId}");

        // Assert
        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.NotFound));
    }


    [Test]
    public async Task GetOwners_WithFilter_ReturnsFilteredOwners()
    {
        // Arrange
        var testOwner = await CreateTestOwner("Nelson Mandela");

        // Act
        var response = await Client.GetAsync($"/api/owners?search={testOwner.Name}");
        var owners = await response.Content.ReadFromJsonAsync<Owner[]>();

        // Assert
        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.OK));
        Assert.That(owners, Is.Not.Null);
        Assert.That(owners, Has.Length.EqualTo(1));
        Assert.That(owners[0].Name, Is.EqualTo(testOwner.Name));
    }

    [Test]
    public async Task GetOwners_WithPartialName_ReturnsFilteredOwners()
    {
        // Arrange
        var testOwner = await CreateTestOwner("Natalia Vargas");

        // Act
        var response = await Client.GetAsync($"/api/owners?search=Natalia");
        var owners = await response.Content.ReadFromJsonAsync<Owner[]>();

        // Assert
        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.OK));
        Assert.That(owners, Is.Not.Null);
        Assert.That(owners, Has.Length.EqualTo(1));
        Assert.That(owners[0].Name, Is.EqualTo(testOwner.Name));
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
        var response = await Client.PostAsJsonAsync("/api/owners", newOwner);
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
        var response = await Client.PutAsJsonAsync($"/api/owners/{testOwner.Id}", updatedOwner);
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
        var nonExistentId = "507f1f77bcf86cd799439011"; // ID de MongoDB válido pero que no existe
        var updatedOwner = new Owner
        {
            Id = nonExistentId,
            Name = "No Debería Existir",
            Address = "Dirección Inexistente"
        };

        // Act
        var response = await Client.PutAsJsonAsync($"/api/owners/{nonExistentId}", updatedOwner);

        // Assert
        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.NotFound));
    }

    [Test]
    public async Task DeleteOwner_WithValidId_ReturnsNoContent()
    {
        // Arrange
        var testOwner = await CreateTestOwner("Propietario a Eliminar");

        // Act
        var deleteResponse = await Client.DeleteAsync($"/api/owners/{testOwner.Id}");

        // Verificar que el propietario ya no existe
        var getResponse = await Client.GetAsync($"/api/owners/{testOwner.Id}");

        // Assert
        Assert.That(deleteResponse.StatusCode, Is.EqualTo(HttpStatusCode.NoContent));
        Assert.That(getResponse.StatusCode, Is.EqualTo(HttpStatusCode.NotFound));
    }

    [Test]
    public async Task DeleteOwner_WithNonExistentId_ReturnsNotFound()
    {
        // Arrange
        var nonExistentId = "507f1f77bcf86cd799439011"; // ID de MongoDB válido pero que no existe

        // Act
        var response = await Client.DeleteAsync($"/api/owners/{nonExistentId}");

        // Assert
        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.NotFound));
    }
}
