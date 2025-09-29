# Real Estate Management API

A .NET 8 Web API for managing real estate properties, owners, and property images with support for both Azure Blob Storage and AWS S3 for file storage.

## Features

- **Property Management**: CRUD operations for real estate properties
- **Owner Management**: Manage property owners and their details
- **Image Handling**: Upload, retrieve, and manage property images
- **Multi-Cloud Storage**: Supports both Azure Blob Storage and AWS S3
- **RESTful API**: Clean, consistent API endpoints following REST principles
- **MongoDB Integration**: NoSQL database for flexible data storage
- **Containerized**: Ready for Docker deployment

## Prerequisites

- [.NET 8.0 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Docker](https://www.docker.com/products/docker-desktop) (for containerized services)
- [Docker Compose](https://docs.docker.com/compose/install/) (for local development)
- Azure Storage Account (for Azure Blob Storage) or AWS Account (for S3 in production)

## Configuration

### App Settings

Update `appsettings.Development.json` for local development:

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "MongoDBSettings": {
    "ConnectionString": "mongodb://root:example@localhost:27017",
    "DatabaseName": "RealEstateDB"
  },
  "Storage": {
    "UseAzureBlob": false
  },
  "S3Settings": {
    "ServiceURL": "http://localhost:9000",
    "AccessKey": "admin",
    "SecretKey": "supersecret",
    "Region": "us-west-1"
  },
  "AzureBlobSettings": {
    "ConnectionString": "YOUR_AZURE_STORAGE_CONNECTION_STRING",
    "ServiceUrl": "https://<account-name>.blob.core.windows.net",
    "PublicBaseUrl": "https://<account-name>.blob.core.windows.net"
  }
}
```

### Environment Variables

For production, set these environment variables:

- `MongoDBSettings__ConnectionString`: MongoDB connection string
- `Storage__UseAzureBlob`: `true` for Azure Blob Storage, `false` for S3
- `S3Settings__*` or `AzureBlobSettings__*`: Storage provider configuration

## Running the Application

### Local Development with Docker Compose

1. Start all services (MongoDB, MinIO, and Mongo Express):

   ```bash
   docker-compose up -d
   ```

2. Access the services:

   - **MongoDB**: `mongodb://root:example@localhost:27017`
   - **Mongo Express**: http://localhost:8081 (Web UI for MongoDB)
   - **MinIO Console**: http://localhost:9001 (Default credentials: minioadmin/minioadmin)
   - **API**: http://localhost:5000

3. Configure the application to use local MinIO (S3-compatible):

   ```json
   {
     "Storage": {
       "UseAzureBlob": false
     },
     "S3Settings": {
       "ServiceURL": "http://localhost:9000",
       "AccessKey": "minioadmin",
       "SecretKey": "minioadmin",
       "Region": "us-east-1"
     }
   }
   ```

4. Run the application:
   ```bash
   cd TestAPI
   dotnet run
   ```

### Using Docker

```bash
docker-compose up --build
```

The API will be available at `http://localhost:5000` or `https://localhost:5001`

## API Endpoints

### Properties

- `GET /api/properties` - List all properties
- `GET /api/properties/{id}` - Get property by ID
- `POST /api/properties` - Create a new property
- `PUT /api/properties/{id}` - Update a property
- `DELETE /api/properties/{id}` - Delete a property

### Property Images

- `GET /api/properties/{propertyId}/images` - List all images for a property
- `POST /api/properties/{propertyId}/images` - Upload a new image
- `GET /api/properties/{propertyId}/images/{id}` - Get image details
- `DELETE /api/properties/{propertyId}/images/{id}` - Delete an image

### Owners

- `GET /api/owners` - List all owners
- `POST /api/owners` - Create a new owner
- `GET /api/owners/{id}` - Get owner by ID
- `PUT /api/owners/{id}` - Update an owner
- `DELETE /api/owners/{id}` - Delete an owner
- `POST /api/owners/{id}/photo` - Upload owner photo

## Storage Configuration

### Azure Blob Storage

1. Create a storage account in Azure Portal
2. Get the connection string from "Access Keys"
3. Set `Storage__UseAzureBlob` to `true`
4. Configure `AzureBlobSettings` with your connection details

### AWS S3 (Production)

1. Create an S3 bucket in AWS Console
2. Create an IAM user with S3 access
3. Get access key and secret key
4. Configure your application:
   ```json
   {
     "Storage": {
       "UseAzureBlob": false
     },
     "S3Settings": {
       "ServiceURL": "https://s3.amazonaws.com",
       "AccessKey": "YOUR_AWS_ACCESS_KEY",
       "SecretKey": "YOUR_AWS_SECRET_KEY",
       "Region": "us-east-1"
     }
   }
   ```

### Local Development with MinIO

For local development, MinIO is pre-configured in the `docker-compose.yml` file. The MinIO console is available at http://localhost:9001 with these default credentials:

- Access Key: `minioadmin`
- Secret Key: `minioadmin`

To create a bucket in MinIO:

1. Open MinIO Console at http://localhost:9001
2. Log in with the credentials above
3. Click "Create Bucket"
4. Set the bucket name (e.g., `property-images`) and click "Create Bucket"

> **Note**: MinIO is an S3-compatible storage service, so you can use the same AWS SDK to interact with it as you would with real S3.

## Testing

### Running Tests

1. Make sure the required services are running:

   ```bash
   docker-compose up -d mongo_db minio
   ```

2. Run the test suite:
   ```bash
   cd TestAPI.Tests
   dotnet test
   ```

### Integration Tests

The integration tests require:

- MongoDB running (automatically started by Docker Compose)
- MinIO running (automatically started by Docker Compose)

Test configuration is handled by `appsettings.Testing.json` which overrides the default settings to use the local services.

## Deployment

### Azure App Service

1. Create an App Service in Azure Portal
2. Configure deployment from GitHub/GitLab/Bitbucket
3. Set the required application settings

### Kubernetes

1. Build and push the container image
2. Deploy using the provided Kubernetes manifests
3. Configure secrets and config maps

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
