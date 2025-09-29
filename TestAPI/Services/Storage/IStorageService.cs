using Amazon.S3.Model;
using Microsoft.AspNetCore.Http;

namespace TestAPI.Services.Storage;

public interface IStorageService
{
    string PropertyImageBucketName { get; }
    string OwnerImageBucketName { get; }

    Task<FileUploadResult> UploadFileAsync(IFormFile file, string bucketName, string? prefix = null);
    Task<Stream> GetFileAsync(string fileName, string bucketName);
    Task<bool> DeleteFileAsync(string fileName, string bucketName);
    Task<List<string>> ListFilesAsync(string bucketName, string? prefix = null);
    string GetFileUrl(string fileName, string bucketName);
    string GetPublicFileUrl(string fileName, string bucketName);
    Task<FileUploadResult> UpdateFileAsync(string oldFileName, IFormFile newFile, string bucketName, string? prefix = null);

    public class FileUploadResult
    {
        public string FileKey { get; set; } = string.Empty;
        public string FileName { get; set; } = string.Empty;
        public string ThumbnailKey { get; set; } = string.Empty;
        public string ContentType { get; set; } = string.Empty;
        public long Size { get; set; }
    }
}
