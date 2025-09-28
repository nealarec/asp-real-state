using Amazon.S3;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using TestAPI.Data;
using TestAPI.Services;
using TestAPI.Services.DAO;
using TestAPI.Services.Interfaces;
using TestAPI.Models;
using MongoDB.Driver;

namespace TestAPI;

public class Program
{
    public static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);
        ConfigureServices(builder);

        var app = builder.Build();
        ConfigureMiddleware(app);

        app.Run();
    }

    public static void ConfigureServices(WebApplicationBuilder builder)
    {
        // Add services to the container.
        // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
        builder.Services.AddControllers();
        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddSwaggerGen();
        builder.Services.Configure<RouteOptions>(options =>
        {
            options.LowercaseUrls = true;
            options.LowercaseQueryStrings = true; // opcional
        });

        // Configure MongoDB
        builder.Services.Configure<Data.MongoDBSettings>(
            builder.Configuration.GetSection("MongoDBSettings"));

        builder.Services.AddSingleton<Services.MongoDBService>();

        builder.Services.AddScoped<Services.DAO.OwnerService>();
        builder.Services.AddScoped<Services.DAO.PropertyService>();
        builder.Services.AddScoped<Services.DAO.PropertyTraceService>();
        builder.Services.AddScoped<Services.DAO.PropertyImageService>();

        // Configure S3
        builder.Services.Configure<Models.S3Settings>(
            builder.Configuration.GetSection("S3Settings"));
        builder.Services.AddScoped<Services.Interfaces.IS3Service, Services.S3Service>();
    }

    public static void ConfigureMiddleware(WebApplication app)
    {
        // Configure the HTTP request pipeline.
        if (app.Environment.IsDevelopment())
        {
            app.UseSwagger();
            app.UseSwaggerUI();
        }
        else
        {
            // Solo usar redirección HTTPS en producción
            app.UseHttpsRedirection();
        }

        app.MapControllers();
    }
}
