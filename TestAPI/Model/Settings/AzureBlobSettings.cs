
namespace TestAPI.Model.Settings;

public class AzureBlobSettings
{
    public string ConnectionString { get; set; } = string.Empty;
    public string ServiceUrl { get; set; } = string.Empty;
    public string PublicBaseUrl { get; set; } = string.Empty;

    public static AzureBlobSettings FromConfiguration(IConfiguration configuration)
    {
        return new AzureBlobSettings
        {
            ConnectionString = configuration["AzureBlobSettings:ConnectionString"] ?? string.Empty,
            ServiceUrl = configuration["AzureBlobSettings:ServiceUrl"] ?? string.Empty,
            PublicBaseUrl = configuration["AzureBlobSettings:PublicBaseUrl"] ?? string.Empty
        };
    }
}
