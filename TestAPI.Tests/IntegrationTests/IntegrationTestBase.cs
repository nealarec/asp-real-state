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
using TestAPI.Services.Interfaces;
using TestAPI.Tests.Mocks;

namespace TestAPI.Tests.IntegrationTests;

public abstract class IntegrationTestBase : IDisposable
{
    protected readonly MongoDbRunner _mongoDbRunner;
    protected readonly IMongoDatabase _database;
    protected readonly IServiceProvider _serviceProvider;
    protected readonly ILoggerFactory _loggerFactory;
    protected readonly MongoDBService _mongoDBService;
    protected readonly IS3Service _mockS3Service;
    protected readonly IConfiguration _configuration;
    protected WebApplicationFactory<Program> Factory { get; private set; }
    protected HttpClient Client { get; private set; }

    protected IntegrationTestBase()
    {
        // Inicializar Mongo2Go
        _mongoDbRunner = MongoDbRunner.Start();

        // Configurar el cliente de MongoDB
        var mongoClient = new MongoClient(_mongoDbRunner.ConnectionString);
        _database = mongoClient.GetDatabase("TestDB");

        // Crear el mock de S3Service
        _mockS3Service = new MockS3Service();

        // Configurar WebApplicationFactory
        Factory = new WebApplicationFactory<Program>()
            .WithWebHostBuilder(builder =>
            {
                // Configurar servicios
                builder.ConfigureServices(services =>
                {
                    // Configurar MongoDB para pruebas
                    services.Configure<MongoDBSettings>(options =>
                    {
                        options.ConnectionString = _mongoDbRunner.ConnectionString;
                        options.DatabaseName = "TestDB";
                    });

                    // Reemplazar servicios reales con mocks
                    services.AddSingleton<IS3Service>(_mockS3Service);
                });

                // Configurar logging
                builder.ConfigureLogging(logging =>
                {
                    logging.ClearProviders();
                    logging.AddConsole();
                    logging.SetMinimumLevel(LogLevel.Debug);
                });
            });

        // Crear cliente HTTP
        Client = Factory.CreateClient();

        // Configurar servicios para pruebas unitarias
        var services = new ServiceCollection();
        _loggerFactory = LoggerFactory.Create(builder =>
        {
            builder.AddConsole();
            builder.SetMinimumLevel(LogLevel.Debug);
        });

        // Configurar MongoDBService
        var mongoDBSettings = new MongoDBSettings
        {
            ConnectionString = _mongoDbRunner.ConnectionString,
            DatabaseName = "TestDB"
        };

        // Registrar las opciones
        services.Configure<MongoDBSettings>(options =>
        {
            options.ConnectionString = mongoDBSettings.ConnectionString;
            options.DatabaseName = mongoDBSettings.DatabaseName;
        });

        // Crear el servicio MongoDBService usando el service provider
        var serviceProvider = services.BuildServiceProvider();
        var options = serviceProvider.GetRequiredService<IOptions<MongoDBSettings>>();
        _mongoDBService = new MongoDBService(options);
        services.AddSingleton(_mongoDBService);

        // Registrar el mock de S3Service
        services.AddSingleton<IS3Service>(_mockS3Service);

        // Configurar el ServiceProvider
        _serviceProvider = services.BuildServiceProvider();
    }

    protected OwnerService CreateOwnerService()
    {
        var logger = _loggerFactory.CreateLogger<OwnerService>();
        return new OwnerService(_mongoDBService, _mockS3Service, logger);
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
