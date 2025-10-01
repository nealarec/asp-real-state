# Variables
FRONTEND_DIR=TestUI
BACKEND_DIR=TestAPI
PUBLISH_DIR=publish
APP_ID=alpha013

RESOURCE_GROUP=test-rg-$(APP_ID)
LOCATION=brazilsouth

APP_NAME=test-app-$(APP_ID)
COSMOS_NAME=test-mongodb-$(APP_ID)
STORAGE_NAME=teststorage$(APP_ID)

.PHONY: check-az login provision frontend backend publish deploy config test clean seed

check-az:
	@which az >/dev/null 2>&1 || (echo "❌ Azure CLI (az) no está instalado"; exit 1)
	@echo "✅ Azure CLI encontrado"

login:
	@az account show >/dev/null 2>&1 || (echo "⚠️ No hay sesión en Azure, ejecuta: az login"; exit 1)
	@echo "✅ Sesión activa en Azure"
register: check-az login
	@echo "🔧 Registrando providers necesarios en la suscripción..."
	az provider register --namespace Microsoft.DocumentDB
	az provider register --namespace Microsoft.Web
	az provider register --namespace Microsoft.Storage
	@echo "✅ Providers registrados (puede tardar un par de minutos en completarse)"

provision: login register
	@echo "🔧 Creando Resource Group si no existe..."
	az group create --name $(RESOURCE_GROUP) --location $(LOCATION)

	@echo "🔧 Creando Cosmos DB (Mongo API) si no existe..."
	az cosmosdb show --name $(COSMOS_NAME) --resource-group $(RESOURCE_GROUP) >/dev/null 2>&1 || \
	az cosmosdb create \
	  --name $(COSMOS_NAME) \
	  --resource-group $(RESOURCE_GROUP) \
	  --kind MongoDB \
	   --enable-free-tier true \
	  --server-version 6.0 || true

	@echo "🔧 Creando Storage Account si no existe..."
	az storage account show --name $(STORAGE_NAME) --resource-group $(RESOURCE_GROUP) >/dev/null 2>&1 || \
	az storage account create \
	  --name $(STORAGE_NAME) \
	  --resource-group $(RESOURCE_GROUP) \
	  --location $(LOCATION) \
	  --sku Standard_LRS || true

	@echo "🔧 Creando App Service Plan si no existe..."
	az appservice plan show --name $(APP_NAME)-plan --resource-group $(RESOURCE_GROUP) >/dev/null 2>&1 || \
	az appservice plan create \
	  --name $(APP_NAME)-plan \
	  --resource-group $(RESOURCE_GROUP) \
	  --sku F1 --is-linux || true

	@echo "🔧 Creando Web App si no existe..."
	az webapp show --name $(APP_NAME) --resource-group $(RESOURCE_GROUP) >/dev/null 2>&1 || \
	az webapp create \
	  --resource-group $(RESOURCE_GROUP) \
	  --plan $(APP_NAME)-plan \
	  --name $(APP_NAME) \
	  --runtime "DOTNETCORE:8.0"

frontend:
	cd $(FRONTEND_DIR) && npm install && npm run build
	mkdir -p $(BACKEND_DIR)/wwwroot
	cp -r $(FRONTEND_DIR)/dist/* $(BACKEND_DIR)/wwwroot/

backend:
	dotnet restore $(BACKEND_DIR)
	dotnet build $(BACKEND_DIR) -c Release

publish: frontend backend
	dotnet publish $(BACKEND_DIR) -c Release -o $(PUBLISH_DIR)

deploy: check-az provision publish config
	cd $(PUBLISH_DIR) && zip -r ../app.zip . && cd ..
	az webapp deploy --resource-group $(RESOURCE_GROUP) --name $(APP_NAME) --src-path app.zip
	@echo "✅ Deploy completado en Azure App Service: $(APP_NAME).azurewebsites.net"

config:
	@echo "🔧 Configurando App Settings..."
	$(eval MONGO_URI := $(shell az cosmosdb keys list --name $(COSMOS_NAME) --resource-group $(RESOURCE_GROUP) --type connection-strings --query "connectionStrings[0].connectionString" -o tsv))
	$(eval CONN_STRING := $(shell az storage account show-connection-string --name $(STORAGE_NAME) --resource-group $(RESOURCE_GROUP) --query "connectionString" -o tsv))

	az webapp config appsettings set \
	  --name $(APP_NAME) \
	  --resource-group $(RESOURCE_GROUP) \
	  --settings \
	  MongoDBSettings__ConnectionString="$(MONGO_URI)" \
	  MongoDBSettings__DatabaseName="RealEstateDB" \
	  Storage__UseAzureBlob=true \
	  AzureBlobSettings__ConnectionString="$(CONN_STRING)" \
	  AzureBlobSettings__ServiceUrl="https://$(STORAGE_NAME).blob.core.windows.net" \
	  AzureBlobSettings__PublicBaseUrl="https://$(STORAGE_NAME).blob.core.windows.net"

	@echo "✅ App settings actualizados en Azure"

test:
	@echo "🔍 Probando CosmosDB..."
	az cosmosdb keys list --name $(COSMOS_NAME) --resource-group $(RESOURCE_GROUP) --type connection-strings | jq -r '.connectionStrings[0].connectionString' | head -c 60 && echo "..."
	@echo "🔍 Probando Storage..."
	az storage container list --account-name $(STORAGE_NAME) --auth-mode login >/dev/null 2>&1 \
	  && echo "✅ Acceso correcto a contenedores de $(STORAGE_NAME)" \
	  || (echo "❌ Error al acceder a contenedores de Storage"; exit 1)

clean:
	rm -rf $(PUBLISH_DIR) app.zip $(BACKEND_DIR)/wwwroot/*

destroy: check-az login
	@echo "⚠️ Esto eliminará TODOS los recursos del resource group $(RESOURCE_GROUP)"
	@read -p "¿Seguro que quieres continuar? (yes/no): " confirm; \
	if [ "$$confirm" = "yes" ]; then \
	  az group delete --name $(RESOURCE_GROUP) --yes; \
	  echo "🗑️ Resource Group $(RESOURCE_GROUP) marcado para eliminación"; \
	else \
	  echo "❌ Operación cancelada"; \
	fi

seed:
	cd TestUI && npm install && npm run seed -- --owners=1500              
