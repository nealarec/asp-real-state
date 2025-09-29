
using TestAPI.Services.Interfaces;
using Microsoft.AspNetCore.Http;

namespace TestAPI.Tests.Mocks;
// Implementación mock de IS3Service para pruebas
public class MockS3Service : IS3Service
{
    public string PropertyImageBucketName => "property-images";
    public string OwnerImageBucketName => "owner-images";

    public Task<IS3Service.FileUploadResult> UploadFileAsync(IFormFile file, string bucketName, string? prefix = null)
    {
        return Task.FromResult(new IS3Service.FileUploadResult
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

    public Task<IS3Service.FileUploadResult> UpdateFileAsync(string oldFileName, IFormFile newFile, string bucketName, string? prefix = null)
    {
        return Task.FromResult(new IS3Service.FileUploadResult
        {
            FileKey = $"{prefix}/{newFile.FileName}",
            FileName = newFile.FileName,
            ContentType = newFile.ContentType,
            Size = newFile.Length
        });
    }
}
