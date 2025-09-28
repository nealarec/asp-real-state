using System.Net;
using System.Net.Http.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc.Testing;
using NUnit.Framework;
using TestAPI;
using TestAPI.Model;
using TestAPI.Services.DAO;

namespace TestAPI.Tests.IntegrationTests;

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
        Assert.That(owners, Has.Length.GreaterThan(0));
        Assert.That(owners[0].Name, Is.EqualTo(testOwner.Name));
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


}
