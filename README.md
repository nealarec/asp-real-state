# Restate: Real Estate Management System

A full-stack application for managing real estate properties, owners, and property traces. Built with .NET 8 for the backend and React with TypeScript for the frontend.

## Demo Video

[![Restate Demo](https://img.youtube.com/vi/0gw_jd2cobA/0.jpg)](https://www.youtube.com/watch?v=0gw_jd2cobA)

Click the image above to watch the demo video on YouTube.

## Tech Stack

### Backend

- .NET 8.0
- ASP.NET Core Web API
- IoC Container
- Service Pattern
- Data Object Pattern (DAO)

### Frontend

- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- React Hook Form for form handling
- React Query for data fetching

### Infrastructure (Local)

- Docker (Docker Compose)
- MongoDB
- MinIO (S3-compatible storage)

### Infrastructure (Azure)

We have production ready script for Azure deployment. 😃 set the makefile variables and run `make deploy`.

- Azure App Service
- Azure Cosmos DB (MongoDB API)
- Azure Storage Account

## Features

- **Property Management**: Create, read, update, and delete property listings
- **Owner Management**: Manage property owners and their details
- **Property Traces**: Track property ownership history
- **Image Upload**: Store property and owner images in S3-compatible storage
- **RESTful API**: Built with .NET 8 Web API
- **Modern UI**: Responsive React frontend with Tailwind CSS
- **Containerized**: Easy setup with Docker Compose

## Getting Started

### Prerequisites

- [.NET 8.0 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js](https://nodejs.org/) (v18 or later)
- [Docker](https://www.docker.com/get-started/)
- [Docker Compose](https://docs.docker.com/compose/install/)

### 1. Clone the repository

```bash
git clone git@github.com:nealarec/asp-real-state.git restate
cd restate
```

### 2. Start the infrastructure

```bash
docker-compose -f compose.yml up -d
```

This will start:

- MongoDB on port http://localhost:27017
- MongoDB Express (admin UI) on port http://localhost:8081
  - Username: `admin`
  - Password: `supersecret`
- MinIO (S3-compatible storage) on ports http://localhost:9000 (API) and http://localhost:9001 (Console)
  - Access Key: `admin`
  - Secret Key: `supersecret`

### 3. Configure and run the backend

1. Navigate to the TestAPI directory and restore dependencies:

   ```bash
   cd TestAPI
   dotnet restore
   ```

2. Update the appsettings.json with your configuration (if needed)

3. Run the backend:

   ```bash
   dotnet run
   ```

   The API will be available at `https://localhost:5248`

### 4. Configure and run the frontend

1. Navigate to the TestUI directory:

   ```bash
   cd TestUI
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

   The frontend will be available at `http://localhost:3000`

### 5. Seed the database (optional)

To populate the database with sample data, you can use the seed script:

```bash
# From the project root directory
make seed

# Or manually run the seed script
cd TestUI
npm install
npm run seed -- --owners=1500
```

## API Documentation

Once the backend is running, you can access the Swagger documentation at:

```bash
https://localhost:5001/swagger
```

## Azure Deployment

This project includes a Makefile with commands to simplify deployment to Azure App Service. The deployment process sets up the following resources:

- **Azure App Service**: Hosts the .NET 8 Web API Linux
- **Azure Cosmos DB (MongoDB API)**: Database service
- **Azure Storage Account**: For file storage
- **Resource Group**: To manage all resources together

### Prerequisites for Azure Deployment

1. [Azure CLI](https://docs.microsoft.com/cli/azure/install-azure-cli) installed
2. Logged in to Azure (`az login`)
3. .NET 8.0 SDK installed
4. Node.js (v18 or later)

### Deployment Steps

1. **Clone the repository** (if not already done):

   ```bash
   git clone <repository-url>
   cd dotnet-state
   ```

2. **Deploy to Azure**:

   ```bash
   # Install frontend dependencies and build
   # Publish the backend
   # Create and configure all Azure resources
   # Deploy the application
   make deploy
   ```

   This will:

   - Create necessary Azure resources if they don't exist
   - Build the frontend and backend
   - Configure application settings
   - Deploy to Azure App Service

### Other Useful Commands

- **Provision only Azure resources**:

  ```bash
  make provision
  ```

- **Update application settings**:

  ```bash
  make config
  ```

- **Test Azure resources**:

  ```bash
  make test
  ```

- **Clean up all resources** (use with caution):

  ```bash
  make destroy
  ```

### Environment Variables in Azure

The following settings are automatically configured during deployment:

- `MongoDBSettings__ConnectionString`: Connection string for Cosmos DB
- `MongoDBSettings__DatabaseName`: Database name (default: RealEstateDB)
- `S3Settings__ServiceURL`: Storage account endpoint
- `S3Settings__AccessKey`: Storage account name
- `S3Settings__SecretKey`: Storage account access key
- `S3Settings__Region`: Azure region (default: brazilsouth)
- `Storage__UseAzureBlob`: Use Azure Blob Storage (default: true)
- `AzureBlobSettings__ConnectionString`: Azure Blob Storage connection string
- `AzureBlobSettings__ServiceUrl`: Azure Blob Storage service URL
- `AzureBlobSettings__PublicBaseUrl`: Azure Blob Storage public base URL

## Testing

### Backend Tests

1. Navigate to the TestAPI.Tests directory and restore dependencies:

   ```bash
   cd TestAPI.Tests
   dotnet restore
   ```

2. Run all tests:

   ```bash
   dotnet test
   ```

3. Run specific test class:

   ```bash
   dotnet test --filter "FullyQualifiedName=TestAPI.Tests.Integration.OwnersControllerTests"
   ```

4. Run a single test:

   ```bash
   dotnet test --filter "FullyQualifiedName=TestAPI.Tests.Integration.OwnersControllerTests.GetOwners_WhenCalled_ReturnsPaginatedListOfOwners"
   ```

### Frontend Tests

1. Navigate to the TestUI directory and install dependencies:

   ```bash
   cd TestUI
   npm install
   ```

2. Run all tests:

   ```bash
   npm test
   ```

3. Run tests in watch mode:

   ```bash
   npm test -- --watch
   ```

4. Run tests with coverage:

   ```bash
   npm test -- --coverage
   ```

## Environment Variables

### Backend (TestAPI/appsettings.json)

```json
{
  "MongoDBSettings": {
    "ConnectionString": "mongodb://root:example@localhost:27017",
    "DatabaseName": "RealEstateDB"
  },
  "Storage": {
    "UseAzureBlob": true
  },
  "S3Settings": {
    "ServiceURL": "http://localhost:9000",
    "AccessKey": "admin",
    "SecretKey": "supersecret",
    "UseHttp": true,
    "ForcePathStyle": true
  },
  "AzureBlobSettings": {
    "ConnectionString": "DefaultEndpointsProtocol=https;AccountName=teststoragealpha013;AccountKey=your-storage-account-key;EndpointSuffix=core.windows.net",
    "ServiceUrl": "https://teststoragealpha013.blob.core.windows.net",
    "PublicBaseUrl": "https://teststoragealpha013.blob.core.windows.net"
  }
}
```

## Project Structure

```text
dotnet-state/
├── TestAPI/               # Backend API (.NET 8)
│   ├── Controllers/       # API controllers
│   ├── Models/            # Data models
│   ├── Services/          # Business logic
│   ├── appsettings.json   # Configuration
│   └── Program.cs         # Application entry point
│
├── TestUI/                # Frontend (React + TypeScript)
│   ├── public/            # Static files
│   ├── src/               # Source code
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   └── App.tsx        # Main app component
│   └── vite.config.ts     # Vite configuration
│
├── TestAPI.Tests/         # Backend tests
├── compose.yml            # Docker Compose configuration
└── README.md             # This file
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [.NET](https://dotnet.microsoft.com/)
- [React](https://reactjs.org/)
- [MongoDB](https://www.mongodb.com/)
- [MinIO](https://min.io/)
- [Tailwind CSS](https://tailwindcss.com/)
