using Amazon;
using Amazon.S3;
using Amazon.S3.Model;
using Amazon.S3.Transfer;
using Microsoft.Extensions.Options;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Processing;
using TestAPI.Model.Settings;

namespace TestAPI.Services.Storage;

public class S3Service : IStorageService
{
    public string PropertyImageBucketName { get; } = "property-images";
    public string OwnerImageBucketName { get; } = "owner-images";

    private readonly IAmazonS3 _s3Client;
    private readonly string _serviceUrl;
    private readonly ILogger<S3Service> _logger;
    private readonly string _publicBaseUrl;

    private readonly string _region;

    public S3Service(IOptions<S3Settings> s3Settings, ILogger<S3Service> logger)
    {
        var settings = s3Settings.Value;
        _serviceUrl = settings.ServiceURL;
        _publicBaseUrl = _serviceUrl.Replace("http://", "https://").TrimEnd('/');
        _logger = logger;
        _region = settings.Region;

        var config = new AmazonS3Config
        {
            ServiceURL = _serviceUrl,
            ForcePathStyle = true, // Required for MinIO
            AuthenticationRegion = RegionEndpoint.USEast1.SystemName,
            UseHttp = _serviceUrl.StartsWith("http://"),
            Timeout = TimeSpan.FromMinutes(5),
        };

        _s3Client = new AmazonS3Client(
            settings.AccessKey,
            settings.SecretKey,
            config);
    }

    public string GetPublicFileUrl(string fileName, string bucketName)
    {
        if (string.IsNullOrEmpty(fileName))
        {
            _logger.LogWarning("A URL was requested for an empty or null filename");
            return string.Empty;
        }

        // Si el fileName ya es una URL completa, devolverla directamente
        if (Uri.TryCreate(fileName, UriKind.Absolute, out var uriResult)
            && (uriResult.Scheme == Uri.UriSchemeHttp || uriResult.Scheme == Uri.UriSchemeHttps))
        {
            _logger.LogInformation("The file is already a full URL: {Url}", fileName);
            return fileName;
        }

        try
        {
            // Verificar si el archivo existe antes de generar la URL firmada
            var metadataRequest = new GetObjectMetadataRequest
            {
                BucketName = bucketName,
                Key = fileName
            };

            // If the file doesn't exist, GetObjectMetadataAsync will throw an exception
            var metadata = _s3Client.GetObjectMetadataAsync(metadataRequest).GetAwaiter().GetResult();

            // If we get here, the file exists, proceed to generate the signed URL
            var request = new GetPreSignedUrlRequest
            {
                BucketName = bucketName,
                Key = fileName,
                Expires = DateTime.UtcNow.AddHours(1), // The URL will expire in 1 hour
                Protocol = _serviceUrl.StartsWith("https") ? Protocol.HTTPS : Protocol.HTTP
            };

            // Generar la URL firmada
            var url = _s3Client.GetPreSignedURL(request);

            // Si estamos usando MinIO con una URL personalizada, necesitamos reemplazar la URL base
            if (!string.IsNullOrEmpty(_serviceUrl) && !_serviceUrl.Contains("amazonaws.com"))
            {
                var uri = new Uri(url);
                var baseUri = new Uri(_serviceUrl);
                var builder = new UriBuilder(uri)
                {
                    Scheme = baseUri.Scheme,
                    Host = baseUri.Host,
                    Port = baseUri.Port
                };
                url = builder.ToString();
            }

            return url;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating signed URL for {FileName} in bucket {BucketName}", fileName, bucketName);
            // En caso de error, devolver la URL directa como respaldo
            return $"{_publicBaseUrl}/{bucketName}/{Uri.EscapeDataString(fileName)}";
        }
    }

    public async Task<IStorageService.FileUploadResult> UploadFileAsync(IFormFile file, string bucketName, string? prefix = null)
    {
        await CreateBucketIfNotExistsAsync(bucketName);

        // Generate a unique filename
        var fileExtension = Path.GetExtension(file.FileName);
        var fileName = Path.GetFileNameWithoutExtension(file.FileName);
        var uniqueFileName = $"{Guid.NewGuid()}_{fileName}{fileExtension}";
        var key = string.IsNullOrEmpty(prefix)
            ? uniqueFileName
            : $"{prefix.TrimEnd('/')}/{uniqueFileName}";

        _logger.LogInformation("Uploading file {FileName} as {Key} to bucket {BucketName}",
            file.FileName, key, bucketName);

        // Upload the original file
        var fileTransferUtility = new TransferUtility(_s3Client);
        using var stream = file.OpenReadStream();
        await fileTransferUtility.UploadAsync(new TransferUtilityUploadRequest
        {
            InputStream = stream,
            BucketName = bucketName,
            Key = key,
            ContentType = file.ContentType,
            // We don't use CannedACL as we'll use signed URLs for access
            // This is more secure than making files public
            CannedACL = null
        });

        var result = new IStorageService.FileUploadResult
        {
            FileKey = key,
            FileName = file.FileName,
            ContentType = file.ContentType,
            Size = file.Length
        };

        // Create and upload thumbnail if it's an image
        if (file.ContentType.StartsWith("image/"))
        {
            try
            {
                // Generate thumbnail
                var thumbnailKey = $"thumbnails/{key}";
                using var image = await Image.LoadAsync(stream);
                image.Mutate(x => x
                    .Resize(new ResizeOptions
                    {
                        Size = new Size(200, 200),
                        Mode = ResizeMode.Crop
                    }));

                // Upload thumbnail
                using var thumbnailStream = new MemoryStream();
                await image.SaveAsJpegAsync(thumbnailStream);
                thumbnailStream.Position = 0;

                await fileTransferUtility.UploadAsync(new TransferUtilityUploadRequest
                {
                    InputStream = thumbnailStream,
                    BucketName = bucketName,
                    Key = thumbnailKey,
                    ContentType = "image/jpeg"
                    // No usamos CannedACL ya que usaremos URLs firmadas
                });

                result.ThumbnailKey = thumbnailKey;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating thumbnail for {FileName}", file.FileName);
                // Continue without thumbnail if there's an error
            }
        }

        _logger.LogInformation("File {FileName} uploaded successfully as {Key}", file.FileName, key);
        return result;
    }

    public async Task<Stream> GetFileAsync(string fileName, string bucketName)
    {
        var response = await _s3Client.GetObjectAsync(bucketName, fileName);
        return response.ResponseStream;
    }

    public async Task<bool> DeleteFileAsync(string fileName, string bucketName)
    {
        try
        {
            await _s3Client.DeleteObjectAsync(bucketName, fileName);
            return true;
        }
        catch
        {
            return false;
        }
    }

    public async Task<List<string>> ListFilesAsync(string bucketName, string? prefix = null)
    {
        var request = new ListObjectsV2Request
        {
            BucketName = bucketName,
            Prefix = prefix
        };

        var response = await _s3Client.ListObjectsV2Async(request);
        return response.S3Objects.Select(x => x.Key).ToList();
    }

    public string GetFileUrl(string fileName, string bucketName)
    {
        return $"{_serviceUrl}/{bucketName}/{fileName}";
    }
    public async Task<IStorageService.FileUploadResult> UpdateFileAsync(string oldFileName, IFormFile newFile, string bucketName, string? prefix = null)
    {
        _logger.LogInformation("Starting file update. Old file: {OldFileName}", oldFileName);

        // Primero subimos el nuevo archivo
        var uploadResult = await UploadFileAsync(newFile, bucketName, prefix);

        try
        {
            // Si la subida fue exitosa, eliminamos el archivo anterior
            if (!string.IsNullOrEmpty(oldFileName))
            {
                _logger.LogInformation("Deleting old file: {OldFileName}", oldFileName);
                await DeleteFileAsync(oldFileName, bucketName);

                // Also delete the thumbnail if it exists
                var oldThumbnailKey = $"thumbnails/{oldFileName}";
                try
                {
                    await DeleteFileAsync(oldThumbnailKey, bucketName);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Could not delete old thumbnail: {ThumbnailKey}", oldThumbnailKey);
                }
            }

            return uploadResult;
        }
        catch (Exception ex)
        {
            // If there's an error deleting the old file, try to clean up the newly uploaded file
            _logger.LogError(ex, "Error deleting old file {OldFileName}. Will attempt to clean up the new file.", oldFileName);
            try
            {
                await DeleteFileAsync(uploadResult.FileKey, bucketName);
            }
            catch (Exception cleanEx)
            {
                _logger.LogError(cleanEx, "Error cleaning up new file {NewFileKey} after failure", uploadResult.FileKey);
                // Don't rethrow the exception to preserve the original error
            }

            throw new Exception("Error al actualizar el archivo: " + ex.Message, ex);
        }
    }

    private async Task CreateBucketIfNotExistsAsync(string bucketName)
    {
        try
        {
            _logger.LogInformation("Checking if bucket {BucketName} exists", bucketName);

            // Primero intentamos listar los objetos del bucket para ver si existe
            try
            {
                await _s3Client.ListObjectsV2Async(new ListObjectsV2Request
                {
                    BucketName = bucketName,
                    MaxKeys = 1
                });

                _logger.LogInformation("Bucket {BucketName} already exists", bucketName);
                return;
            }
            catch (AmazonS3Exception ex) when (ex.ErrorCode == "NoSuchBucket")
            {
                _logger.LogInformation("Bucket {BucketName} does not exist, creating it...", bucketName);
                // The bucket doesn't exist, continue with creation
            }

            // If we get here, the bucket doesn't exist, so we'll create it
            var putBucketRequest = new PutBucketRequest
            {
                BucketName = bucketName,
                UseClientRegion = true,
                BucketRegionName = _region
            };

            await _s3Client.PutBucketAsync(putBucketRequest);
            _logger.LogInformation("Bucket {BucketName} created successfully", bucketName);
        }
        catch (AmazonS3Exception ex)
        {
            _logger.LogError(ex, "S3 error while verifying/creating bucket {BucketName}", bucketName);
            throw new Exception($"S3 error while verifying/creating bucket: {ex.Message}", ex);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error while verifying/creating bucket {BucketName}", bucketName);
            throw new Exception($"Unexpected error while verifying/creating bucket: {ex.Message}", ex);
        }
    }
}
