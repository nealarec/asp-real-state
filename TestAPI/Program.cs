using Amazon.S3;
using TestAPI.Data;
using TestAPI.Services;
using TestAPI.Services.DAO;
using TestAPI.Services.Interfaces;
using TestAPI.Models;

var builder = WebApplication.CreateBuilder(args);

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
builder.Services.Configure<MongoDBSettings>(
    builder.Configuration.GetSection("MongoDBSettings"));

builder.Services.AddSingleton<MongoDBService>();

builder.Services.AddScoped<OwnerService>();
builder.Services.AddScoped<PropertyService>();
builder.Services.AddScoped<PropertyTraceService>();
builder.Services.AddScoped<PropertyImageService>();

// Configure S3
builder.Services.Configure<S3Settings>(
    builder.Configuration.GetSection("S3Settings"));
builder.Services.AddScoped<IS3Service, S3Service>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.MapControllers();
app.Run();

