using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Azure.Storage.Sas;
using Microsoft.Extensions.Options;
using TestAPI.Model.Settings;

namespace TestAPI.Services.Storage;

public class AzureService : IStorageService
{
    private readonly BlobServiceClient _blobServiceClient;
    private readonly AzureBlobSettings _settings;
    private readonly ILogger<AzureService> _logger;

    public string PropertyImageBucketName { get; } = "property-images";
    public string OwnerImageBucketName { get; } = "owner-images";

    public AzureService(IOptions<AzureBlobSettings> settings, ILogger<AzureService> logger)
    {
        _settings = settings.Value;
        _logger = logger;
        _blobServiceClient = new BlobServiceClient(_settings.ConnectionString);
    }

    private BlobContainerClient GetContainerClient(string containerName)
    {
        return _blobServiceClient.GetBlobContainerClient(containerName);
    }

    private async Task CreateContainerIfNotExistsAsync(string containerName)
    {
        var containerClient = GetContainerClient(containerName);
        await containerClient.CreateIfNotExistsAsync(PublicAccessType.None);
    }

    public async Task<IStorageService.FileUploadResult> UploadFileAsync(IFormFile file, string containerName, string? prefix = null)
    {
        _logger.LogInformation("Uploading file {FileName} to container {ContainerName}", file.FileName, containerName);

        await CreateContainerIfNotExistsAsync(containerName);
        var containerClient = GetContainerClient(containerName);

        var fileName = string.IsNullOrEmpty(prefix)
            ? $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}"
            : $"{prefix.TrimEnd('/')}/{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";

        try
        {
            var blobClient = containerClient.GetBlobClient(fileName);

            using (var stream = file.OpenReadStream())
            {
                await blobClient.UploadAsync(stream, new BlobHttpHeaders { ContentType = file.ContentType });
            }

            return new IStorageService.FileUploadResult
            {
                FileKey = fileName,
                FileName = file.FileName,
                ContentType = file.ContentType,
                Size = file.Length
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading file to Azure Blob Storage");
            throw;
        }
    }

    public async Task<Stream> GetFileAsync(string fileName, string containerName)
    {
        try
        {
            var containerClient = GetContainerClient(containerName);
            var blobClient = containerClient.GetBlobClient(fileName);

            var response = await blobClient.DownloadAsync();
            return response.Value.Content;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving file {FileName} from container {ContainerName}", fileName, containerName);
            throw;
        }
    }

    public async Task<bool> DeleteFileAsync(string fileName, string containerName)
    {
        try
        {
            var containerClient = GetContainerClient(containerName);
            var blobClient = containerClient.GetBlobClient(fileName);

            return await blobClient.DeleteIfExistsAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting file {FileName} from container {ContainerName}", fileName, containerName);
            return false;
        }
    }

    public async Task<List<string>> ListFilesAsync(string containerName, string? prefix = null)
    {
        var result = new List<string>();
        var containerClient = GetContainerClient(containerName);

        await foreach (var blobItem in containerClient.GetBlobsAsync(prefix: prefix))
        {
            result.Add(blobItem.Name);
        }

        return result;
    }

    public string GetFileUrl(string fileName, string containerName)
    {
        if (string.IsNullOrEmpty(fileName)) return string.Empty;

        var containerClient = GetContainerClient(containerName);
        var blobClient = containerClient.GetBlobClient(fileName);

        return blobClient.Uri.ToString();
    }

    public string GetPublicFileUrl(string fileName, string containerName)
    {
        if (string.IsNullOrEmpty(fileName)) return string.Empty;
        var containerClient = GetContainerClient(containerName);
        var blobClient = containerClient.GetBlobClient(fileName);

        return blobClient.GenerateSasUri(BlobSasPermissions.Read, DateTime.UtcNow.AddHours(1)).ToString();
    }

    public async Task<IStorageService.FileUploadResult> UpdateFileAsync(string oldFileName, IFormFile newFile, string containerName, string? prefix = null)
    {
        // Delete the old file if it exists
        if (!string.IsNullOrEmpty(oldFileName))
        {
            await DeleteFileAsync(oldFileName, containerName);
        }

        // Upload the new file
        return await UploadFileAsync(newFile, containerName, prefix);
    }
}
