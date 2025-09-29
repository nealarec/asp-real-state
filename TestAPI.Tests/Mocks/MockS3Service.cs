
using TestAPI.Services.Storage;
using Microsoft.AspNetCore.Http;

namespace TestAPI.Tests.Mocks;
// Mock implementation of IStorageService for testing
public class MockStorageService : IStorageService
{
    public string PropertyImageBucketName => "property-images";
    public string OwnerImageBucketName => "owner-images";

    public Task<StorageService.FileUploadResult> UploadFileAsync(IFormFile file, string bucketName, string? prefix = null)
    {
        return Task.FromResult(new StorageService.FileUploadResult
        {
            FileKey = $"{prefix}/{file.FileName}",
            FileName = file.FileName,
            ContentType = file.ContentType,
            Size = file.Length
        });
    }

    public Task<Stream> GetFileAsync(string fileName, string bucketName)
    {
        var memoryStream = new MemoryStream();
        var writer = new StreamWriter(memoryStream);
        writer.Write("Test file content");
        writer.Flush();
        memoryStream.Position = 0;
        return Task.FromResult<Stream>(memoryStream);
    }

    public Task<bool> DeleteFileAsync(string fileName, string bucketName)
    {
        return Task.FromResult(true);
    }

    public Task<List<string>> ListFilesAsync(string bucketName, string? prefix = null)
    {
        return Task.FromResult(new List<string> { "file1.jpg", "file2.jpg" });
    }

    public string GetFileUrl(string fileName, string bucketName)
    {
        if (string.IsNullOrEmpty(fileName))
            return string.Empty;

        return $"https://mock-s3-url.com/{bucketName}/{fileName}";
    }

    public string GetPublicFileUrl(string fileName, string bucketName)
    {
        return $"https://public-mock-s3-url.com/{bucketName}/{fileName}";
    }

    public Task<IStorageService.FileUploadResult> UpdateFileAsync(string oldFileName, IFormFile newFile, string bucketName, string? prefix = null)
    {
        return Task.FromResult(new IStorageService.FileUploadResult
        {
            FileKey = $"{prefix}/{newFile.FileName}",
            FileName = newFile.FileName,
            ContentType = newFile.ContentType,
            Size = newFile.Length
        });
    }
}
