using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using Mongo2Go;
using TestAPI;
using TestAPI.Data;
using TestAPI.Model;
using TestAPI.Services;
using TestAPI.Services.DAO;
using TestAPI.Services.IStorageService;
using TestAPI.Tests.Mocks;

namespace TestAPI.Tests.Integration;

public abstract class IntegrationTestBase : IDisposable
{
    protected readonly MongoDbRunner _mongoDbRunner;
    protected readonly IMongoDatabase _database;
    protected readonly IServiceProvider _serviceProvider;
    protected readonly ILoggerFactory _loggerFactory;
    protected readonly MongoDBService _mongoDBService;
    protected readonly IStorageService _mockStorageService;
    protected readonly IConfiguration _configuration;
    protected WebApplicationFactory<Program> Factory { get; private set; }
    protected HttpClient Client { get; private set; }

    protected IntegrationTestBase()
    {
        // Initialize Mongo2Go
        _mongoDbRunner = MongoDbRunner.Start();

        // Configure the MongoDB client
        var mongoClient = new MongoClient(_mongoDbRunner.ConnectionString);
        _database = mongoClient.GetDatabase("TestDB");

        // Create the StorageService mock
        _mockStorageService = new MockStorageService();

        // Configure WebApplicationFactory
        Factory = new WebApplicationFactory<Program>()
            .WithWebHostBuilder(builder =>
            {
                // Configure services
                builder.ConfigureServices(services =>
                {
                    // Configure MongoDB for tests
                    services.Configure<MongoDBSettings>(options =>
                    {
                        options.ConnectionString = _mongoDbRunner.ConnectionString;
                        options.DatabaseName = "TestDB";
                    });

                    // Replace real services with mocks
                    services.AddSingleton<IStorageService>(_mockStorageService);
                });

                // Configure logging
                builder.ConfigureLogging(logging =>
                {
                    logging.ClearProviders();
                    logging.AddConsole();
                    logging.SetMinimumLevel(LogLevel.Debug);
                });
            });

        // Create HTTP client
        Client = Factory.CreateClient();

        // Configure services for unit testing
        var services = new ServiceCollection();
        _loggerFactory = LoggerFactory.Create(builder =>
        {
            builder.AddConsole();
            builder.SetMinimumLevel(LogLevel.Debug);
        });

        // Configure MongoDBService
        var mongoDBSettings = new MongoDBSettings
        {
            ConnectionString = _mongoDbRunner.ConnectionString,
            DatabaseName = "TestDB"
        };

        // Register the options
        services.Configure<MongoDBSettings>(options =>
        {
            options.ConnectionString = mongoDBSettings.ConnectionString;
            options.DatabaseName = mongoDBSettings.DatabaseName;
        });

        // Create the MongoDBService using the service provider
        var serviceProvider = services.BuildServiceProvider();
        var options = serviceProvider.GetRequiredService<IOptions<MongoDBSettings>>();
        _mongoDBService = new MongoDBService(options);
        services.AddSingleton(_mongoDBService);

        // Register the StorageService mock
        services.AddSingleton<IStorageService>(_mockStorageService);

        // Configure the ServiceProvider
        _serviceProvider = services.BuildServiceProvider();
    }

    protected OwnerService CreateOwnerService()
    {
        var logger = _loggerFactory.CreateLogger<OwnerService>();
        return new OwnerService(_mongoDBService, _mockStorageService, logger);
    }

    protected PropertyService CreatePropertyService()
    {
        var logger = _loggerFactory.CreateLogger<PropertyService>();
        return new PropertyService(_mongoDBService, CreateOwnerService(), CreatePropertyImageService(), _mockStorageService, logger);
    }

    protected PropertyImageService CreatePropertyImageService()
    {
        var logger = _loggerFactory.CreateLogger<PropertyImageService>();
        return new PropertyImageService(_mongoDBService);
    }

    protected async Task<Owner> CreateTestOwner(string name = "Test Owner", string address = "123 Test St")
    {
        var owner = new Owner
        {
            Name = name,
            Address = address,
            Birthday = DateTime.UtcNow.AddYears(-30),
        };
        var collection = _database.GetCollection<Owner>("owners");
        await collection.InsertOneAsync(owner);
        return owner;
    }

    protected async Task<Property> CreateTestProperty(string name = "Test Property", string address = "456 Test Ave", string ownerId = null)
    {
        var property = new Property
        {
            Name = name,
            Address = address,
            Price = 250000,
            Year = DateTime.UtcNow.Year,
            IdOwner = ownerId
        };
        var collection = _database.GetCollection<Property>("properties");
        await collection.InsertOneAsync(property);
        return property;
    }

    protected virtual void Dispose(bool disposing)
    {
        if (disposing)
        {
            _mongoDbRunner?.Dispose();
            _loggerFactory?.Dispose();
            Client?.Dispose();
            Factory?.Dispose();
        }
    }

    public void Dispose()
    {
        Dispose(true);
        GC.SuppressFinalize(this);
    }
}
