# Backend Test Documentation

This document provides an overview of the backend testing strategy, test structure, and guidelines for writing and running tests in the Real Estate Management System.

## Test Architecture

The test suite is built using the following technologies:

- **xUnit**: The testing framework
- **Mongo2Go**: In-memory MongoDB for testing database operations
- **WebApplicationFactory**: For integration testing of API endpoints
- **Moq**: For mocking dependencies (if needed)

## Test Structure

```text
TestAPI.Tests/
├── Integration/               # Integration tests
│   ├── IntegrationTestBase.cs # Base class for all integration tests
│   ├── OwnersControllerTests.cs
│   └── PropertiesControllerTests.cs
└── Mocks/                    # Test doubles
    └── MockStorageService.cs      # Mock implementation of IStorageService
```

## Test Categories

### 1. Integration Tests

Tests that verify the integration between different components of the application, including API endpoints and database operations.

#### Key Features

- Uses an in-memory MongoDB instance (Mongo2Go)
- Tests API endpoints end-to-end
- Verifies database operations
- Tests request/response contracts

#### Example Test Class

```csharp
[TestFixture]
public class OwnersControllerTests : IntegrationTestBase
{
    [Test]
    public async Task GetOwners_WhenCalled_ReturnsPaginatedListOfOwners()
    {
        // Test implementation
    }
}
```

### 2. Unit Tests

Unit tests for individual components (controllers, services, etc.) with mocked dependencies.

## Test Base Class

The `IntegrationTestBase` class provides common functionality for all integration tests:

- Sets up an in-memory MongoDB instance
- Configures the test web host
- Provides helper methods for creating test data
- Handles test cleanup

### Key Methods

| Method                    | Description                                                     |
| ------------------------- | --------------------------------------------------------------- |
| `CreateOwnerService()`    | Creates an instance of `OwnerService` with test dependencies    |
| `CreatePropertyService()` | Creates an instance of `PropertyService` with test dependencies |
| `CreateTestOwner()`       | Creates a test owner in the database                            |
| `CreateTestProperty()`    | Creates a test property in the database                         |

## Running Tests

### Prerequisites

- .NET 8.0 SDK
- MongoDB (for local development, but tests use in-memory MongoDB)

### Running All Tests

```bash
dotnet test
```

### Running Specific Test Project

```bash
cd TestAPI.Tests
dotnet test
```

### Running Specific Test Class

```bash
dotnet test --filter "FullyQualifiedName=TestAPI.Tests.Integration.OwnersControllerTests"
```

### Running a Single Test

```bash
dotnet test --filter "FullyQualifiedName=TestAPI.Tests.Integration.OwnersControllerTests.GetOwners_WhenCalled_ReturnsPaginatedListOfOwners"
```

## Test Data Management

### Creating Test Data

Use the helper methods in `IntegrationTestBase` to create test data:

```csharp
// Create a test owner
var owner = await CreateTestOwner("John Doe", "123 Main St");

// Create a test property for the owner
var property = await CreateTestProperty("Beach House", "456 Ocean Blvd", owner.Id);
```

### Test Data Cleanup

- The in-memory MongoDB instance is automatically cleaned up after each test run
- Each test should be independent and not rely on data from other tests

## Best Practices

1. **Test Naming**: Follow the pattern `MethodName_StateUnderTest_ExpectedBehavior`
2. **Arrange-Act-Assert**: Structure tests with clear sections
3. **Test Isolation**: Each test should be independent
4. **Descriptive Assertions**: Use meaningful assertion messages
5. **Mock External Dependencies**: Use mocks for external services like S3

## Example Test

```csharp
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
```

## Debugging Tests

1. **Visual Studio Code**: Use the built-in test explorer and debugging tools
2. **Visual Studio**: Use Test Explorer with the "Debug Test" option
3. **Command Line**: Use `dotnet test --logger "console;verbosity=detailed"` for detailed output

## Common Issues

1. **Port Conflicts**: Ensure no other services are using the test ports (5001, 5002, 27017)
2. **Test Data Conflicts**: Ensure tests clean up after themselves
3. **Race Conditions**: Use proper async/await patterns in tests

## Continuous Integration

Tests are automatically run in the CI/CD pipeline. The pipeline will fail if any tests fail.

## Code Coverage

To generate a code coverage report:

```bash
# Install coverlet.collector if not already installed
dotnet add package coverlet.collector

# Run tests with coverage
dotnet test --collect:"XPlat Code Coverage"
```

## Additional Resources

- [xUnit Documentation](https://xunit.net/)
- [ASP.NET Core Integration Testing](https://docs.microsoft.com/en-us/aspnet/core/test/integration-tests)
- [Mongo2Go](https://github.com/Mongo2Go/Mongo2Go)
