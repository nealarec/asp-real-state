using Amazon;
using Amazon.S3;
using Amazon.S3.Model;
using Amazon.S3.Transfer;
using Microsoft.Extensions.Options;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Processing;
using SixLabors.ImageSharp.Formats.Jpeg;
using TestAPI.Services.Interfaces;
using TestAPI.Model;

namespace TestAPI.Services;

public class S3Service : IS3Service
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
            ForcePathStyle = true, // Necesario para MinIO
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
            _logger.LogWarning("Se solicitó una URL para un nombre de archivo vacío o nulo");
            return string.Empty;
        }

        // Si el fileName ya es una URL completa, devolverla directamente
        if (Uri.TryCreate(fileName, UriKind.Absolute, out var uriResult)
            && (uriResult.Scheme == Uri.UriSchemeHttp || uriResult.Scheme == Uri.UriSchemeHttps))
        {
            _logger.LogInformation("El archivo ya es una URL completa: {Url}", fileName);
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

            // Si el archivo no existe, GetObjectMetadataAsync lanzará una excepción
            var metadata = _s3Client.GetObjectMetadataAsync(metadataRequest).GetAwaiter().GetResult();

            // Si llegamos aquí, el archivo existe, proceder a generar la URL firmada
            var request = new GetPreSignedUrlRequest
            {
                BucketName = bucketName,
                Key = fileName,
                Expires = DateTime.UtcNow.AddHours(1), // La URL expirará en 1 hora
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

            _logger.LogInformation("URL firmada generada correctamente para {FileName} en el bucket {BucketName}", fileName, bucketName);
            return url;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al generar URL firmada para {FileName} en el bucket {BucketName}", fileName, bucketName);
            // En caso de error, devolver la URL directa como respaldo
            return $"{_publicBaseUrl}/{bucketName}/{Uri.EscapeDataString(fileName)}";
        }
    }

    public async Task<IS3Service.FileUploadResult> UploadFileAsync(IFormFile file, string bucketName, string? prefix = null)
    {
        await CreateBucketIfNotExistsAsync(bucketName);

        // Generar un nombre de archivo único
        var fileExtension = Path.GetExtension(file.FileName);
        var fileName = Path.GetFileNameWithoutExtension(file.FileName);
        var uniqueFileName = $"{Guid.NewGuid()}_{fileName}{fileExtension}";

        // Construir la ruta completa con prefijo si existe
        var key = string.IsNullOrEmpty(prefix)
            ? uniqueFileName
            : $"{prefix.TrimEnd('/')}/{uniqueFileName}";

        _logger.LogInformation("Subiendo archivo {FileName} como {Key} al bucket {BucketName}",
            file.FileName, key, bucketName);

        // Subir el archivo original
        var fileTransferUtility = new TransferUtility(_s3Client);
        using var stream = file.OpenReadStream();
        await fileTransferUtility.UploadAsync(new TransferUtilityUploadRequest
        {
            InputStream = stream,
            BucketName = bucketName,
            Key = key,
            ContentType = file.ContentType,
            // No usamos CannedACL ya que usaremos URLs firmadas para el acceso
            // Esto es más seguro que hacer los archivos públicos
            CannedACL = null
        });

        var result = new IS3Service.FileUploadResult
        {
            FileKey = key,
            FileName = file.FileName,
            ContentType = file.ContentType,
            Size = file.Length
        };

        // Crear y subir miniatura si es una imagen
        if (file.ContentType.StartsWith("image/"))
        {
            try
            {
                // Generar miniatura
                var thumbnailKey = $"thumbnails/{key}";
                using var image = await Image.LoadAsync(stream);
                image.Mutate(x => x
                    .Resize(new ResizeOptions
                    {
                        Size = new Size(200, 200),
                        Mode = ResizeMode.Crop
                    }));

                // Subir miniatura
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
                _logger.LogError(ex, "Error al generar miniatura para {FileName}", file.FileName);
                // Continuar sin miniatura si hay un error
            }
        }

        _logger.LogInformation("Archivo {FileName} subido exitosamente como {Key}", file.FileName, key);
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
    public async Task<IS3Service.FileUploadResult> UpdateFileAsync(string oldFileName, IFormFile newFile, string bucketName, string? prefix = null)
    {
        _logger.LogInformation("Iniciando actualización de archivo. Antiguo: {OldFileName}", oldFileName);

        // Primero subimos el nuevo archivo
        var uploadResult = await UploadFileAsync(newFile, bucketName, prefix);

        try
        {
            // Si la subida fue exitosa, eliminamos el archivo anterior
            if (!string.IsNullOrEmpty(oldFileName))
            {
                _logger.LogInformation("Eliminando archivo antiguo: {OldFileName}", oldFileName);
                await DeleteFileAsync(oldFileName, bucketName);

                // También eliminamos la miniatura si existe
                var oldThumbnailKey = $"thumbnails/{oldFileName}";
                try
                {
                    await DeleteFileAsync(oldThumbnailKey, bucketName);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "No se pudo eliminar la miniatura antigua: {ThumbnailKey}", oldThumbnailKey);
                }
            }

            return uploadResult;
        }
        catch (Exception ex)
        {
            // Si hay un error al eliminar el archivo antiguo, intentamos limpiar el nuevo archivo subido
            _logger.LogError(ex, "Error al eliminar el archivo antiguo {OldFileName}. Se procederá a limpiar el nuevo archivo.", oldFileName);
            try
            {
                await DeleteFileAsync(uploadResult.FileKey, bucketName);
            }
            catch (Exception cleanEx)
            {
                _logger.LogError(cleanEx, "Error al limpiar el nuevo archivo {NewFileKey} después de un fallo", uploadResult.FileKey);
                // No relanzamos la excepción para no perder el error original
            }

            throw new Exception("Error al actualizar el archivo: " + ex.Message, ex);
        }
    }

    private async Task CreateBucketIfNotExistsAsync(string bucketName)
    {
        try
        {
            _logger.LogInformation("Verificando si el bucket {BucketName} existe", bucketName);

            // Primero intentamos listar los objetos del bucket para ver si existe
            try
            {
                await _s3Client.ListObjectsV2Async(new ListObjectsV2Request
                {
                    BucketName = bucketName,
                    MaxKeys = 1
                });

                _logger.LogInformation("El bucket {BucketName} ya existe", bucketName);
                return;
            }
            catch (AmazonS3Exception ex) when (ex.ErrorCode == "NoSuchBucket")
            {
                _logger.LogInformation("El bucket {BucketName} no existe, creándolo...", bucketName);
                // El bucket no existe, continuamos con la creación
            }

            // Si llegamos aquí, el bucket no existe, así que lo creamos
            var putBucketRequest = new PutBucketRequest
            {
                BucketName = bucketName,
                UseClientRegion = true,
                BucketRegionName = _region
            };

            await _s3Client.PutBucketAsync(putBucketRequest);
            _logger.LogInformation("Bucket {BucketName} creado exitosamente", bucketName);
        }
        catch (AmazonS3Exception ex)
        {
            _logger.LogError(ex, "Error de S3 al verificar/crear el bucket {BucketName}", bucketName);
            throw new Exception($"Error de S3 al verificar/crear el bucket: {ex.Message}", ex);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error inesperado al verificar/crear el bucket {BucketName}", bucketName);
            throw new Exception($"Error inesperado al verificar/crear el bucket: {ex.Message}", ex);
        }
    }
}
