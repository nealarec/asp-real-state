import { faker } from "@faker-js/faker/locale/en";
import axios, { AxiosRequestConfig } from "axios";
import { Readable } from "stream";
import FormData from "form-data";
import { from, mergeMap, of, bufferCount, catchError, lastValueFrom } from "rxjs";
import { argv } from "process";

// Helper to convert a URL to a stream
async function urlToStream(url: string): Promise<Readable> {
  const response = await axios({
    url,
    method: "GET",
    responseType: "stream",
  });
  return response.data as Readable;
}

// Helper to convert a stream to a buffer
function streamToBuffer(stream: Readable): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on("data", chunk => chunks.push(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks)));
  });
}

// Configuration
const API_BASE_URL = "http://localhost:5248/api";
const MIN_PROPERTIES_PER_OWNER = 1;
const MAX_PROPERTIES_PER_OWNER = 5;
const MIN_IMAGES_PER_PROPERTY = 2;
const MAX_IMAGES_PER_PROPERTY = 5;

// Generate a random image URL using a known working ID from picsum.photos
function getRandomImageUrl(width = 800, height = 600): string {
  const randomId = faker.number.int({ min: 0, max: 10000 });
  return `https://picsum.photos/${width}/${height}?random=${randomId}`;
}

// Get a fallback image URL in case the primary service fails
function getFallbackImageUrl(width = 800, height = 600): string {
  // Using placeholder.com as a fallback
  return `https://via.placeholder.com/${width}x${height}.jpg?text=Property+Image`;
}

// Upload a file to the server from a stream with retry and fallback
async function uploadImageFromUrl(
  url: string,
  uploadUrl: string,
  fieldName = "file",
  retries = 2
): Promise<void> {
  let lastError: Error | null = null;

  // Try the primary URL first
  for (let attempt = 0; attempt <= retries; attempt++) {
    let currentUrl = url;

    // If this is a retry and we have a fallback URL, use it
    if (attempt > 0) {
      console.log(`Retry ${attempt} for ${url}`);
      currentUrl = getFallbackImageUrl();
    }

    try {
      // Get the image stream with a timeout
      const imageStream = await Promise.race([
        urlToStream(currentUrl),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Image download timed out")), 10000)
        ),
      ]);

      // Convert stream to buffer to get content length
      const imageBuffer = await streamToBuffer(imageStream);

      // Validate image buffer
      if (!imageBuffer || imageBuffer.length === 0) {
        throw new Error("Empty image buffer received");
      }

      // Create a new stream from the buffer
      const imageStreamCopy = Readable.from(imageBuffer);

      const formData = new FormData();
      formData.append(fieldName, imageStreamCopy, {
        filename: `image-${Date.now()}.jpg`,
        contentType: "image/jpeg",
        knownLength: imageBuffer.length,
      });

      const config: AxiosRequestConfig = {
        headers: {
          ...formData.getHeaders(),
          "Content-Length": formData.getLengthSync(),
        },
        maxBodyLength: Infinity,
        timeout: 30000, // 30 second timeout for upload
      };

      await axios.post(uploadUrl, formData, config);
      return; // Success!
    } catch (error) {
      lastError = error as Error;
      console.warn(`Attempt ${attempt + 1} failed: ${error.message}`);

      // If we're out of retries, throw the last error
      if (attempt >= retries) {
        if (lastError) {
          console.error(
            `Failed to upload image after ${retries + 1} attempts: ${lastError.message}`
          );
          throw lastError;
        }
      }

      // Wait a bit before retrying
      await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
    }
  }

  throw lastError || new Error("Unknown error during image upload");
}

interface Owner {
  name: string;
  address: string;
  photo?: string;
}

interface Property {
  name: string;
  address: string;
  price: number;
  codeInternal: string;
  year: number;
  idOwner: string;
  coverImageUrl?: string;
}

// Create a new owner
async function createOwner(ownerData: Partial<Owner> = {}): Promise<string> {
  const owner: Omit<Owner, "photo"> = {
    name: ownerData.name || `${faker.person.fullName()}`,
    address: ownerData.address || `${faker.location.streetAddress()}, ${faker.location.city()}`,
  };

  try {
    // First create the owner
    const response = await axios.post(`${API_BASE_URL}/owners`, owner);
    const ownerId = response.data.id;

    // Then upload the photo
    try {
      const photoUrl = getRandomImageUrl(600, 600);
      await uploadImageFromUrl(photoUrl, `${API_BASE_URL}/owners/${ownerId}/photo`, "file");
    } catch (photoError) {
      console.warn("Warning: Could not upload owner photo:", photoError);
    }

    return ownerId;
  } catch (error) {
    console.error("Error creating owner:", error);
    throw error;
  }
}

// Create a new property for an owner
async function createProperty(
  ownerId: string,
  propertyData: Partial<Property> = {}
): Promise<string> {
  const currentYear = new Date().getFullYear();
  const property: Property = {
    name:
      propertyData.name ||
      `${faker.commerce.productAdjective()} ${faker.helpers.arrayElement(["House", "Apartment", "Villa", "Condo", "Townhouse"])}`,
    address: propertyData.address || `${faker.location.streetAddress()}, ${faker.location.city()}`,
    price: propertyData.price || faker.number.int({ min: 50000, max: 2000000 }),
    codeInternal: propertyData.codeInternal || `PROP-${faker.string.alphanumeric(8).toUpperCase()}`,
    year: propertyData.year || faker.number.int({ min: 1950, max: currentYear }),
    idOwner: ownerId,
  };

  try {
    const response = await axios.post(`${API_BASE_URL}/properties`, property);
    return response.data.id;
  } catch (error) {
    console.error("Error creating property:", error);
    throw error;
  }
}

// Add images to a property
async function addPropertyImages(propertyId: string, count: number): Promise<void> {
  for (let i = 0; i < count; i++) {
    try {
      const imageUrl = getRandomImageUrl();
      await uploadImageFromUrl(imageUrl, `${API_BASE_URL}/properties/${propertyId}/images`, "file");
    } catch (error) {
      console.error(`Error adding image ${i + 1} to property ${propertyId}:`, error);
    }
  }
}

// Process a single owner with their properties and images
async function processOwner(ownerIndex: number) {
  const ownerNum = ownerIndex + 1;
  console.log(`[Owner ${ownerNum}] Starting processing...`);

  try {
    const ownerId = await createOwner();
    console.log(`[Owner ${ownerNum}] Created with ID: ${ownerId}`);

    // Create 1-5 properties for the owner
    const numProperties = faker.number.int({
      min: MIN_PROPERTIES_PER_OWNER,
      max: MAX_PROPERTIES_PER_OWNER,
    });

    // Process properties in parallel with a concurrency limit
    const propertyPromises: Promise<string>[] = [];
    for (let j = 0; j < numProperties; j++) {
      const propertyNum = j + 1;
      propertyPromises.push(
        createProperty(ownerId)
          .then(propertyId => {
            console.log(
              `[Owner ${ownerNum}] Created property ${propertyNum}/${numProperties}: ${propertyId}`
            );
            return propertyId;
          })
          .then(async propertyId => {
            // Add 2-5 images to the property
            const numImages = faker.number.int({
              min: MIN_IMAGES_PER_PROPERTY,
              max: MAX_IMAGES_PER_PROPERTY,
            });

            console.log(`[Owner ${ownerNum}] Adding ${numImages} images to property ${propertyId}`);
            await addPropertyImages(propertyId, numImages);
            return propertyId;
          })
      );
    }

    await Promise.all(propertyPromises);
    console.log(`[Owner ${ownerNum}] Completed processing`);
    return { success: true, ownerId };
  } catch (error) {
    console.error(`[Owner ${ownerNum}] Error:`, error);
    return { success: false, error, ownerIndex };
  }
}

// Main seeding function using RxJS for concurrency control
async function seedDatabase(numOwners: number) {
  console.log("Starting database seeding...");

  try {
    // Create an array of owner indices
    const ownerIndices = Array.from({ length: numOwners }, (_, i) => i);

    // Process owners with a concurrency of 3
    const CONCURRENCY_LIMIT = 3;

    const results = await lastValueFrom(
      from(ownerIndices).pipe(
        // Process owners with concurrency control
        mergeMap(
          ownerIndex =>
            from(processOwner(ownerIndex)).pipe(
              catchError(error => {
                console.error(`Error processing owner ${ownerIndex + 1}:`, error);
                return of({ success: false, error, ownerIndex });
              })
            ),
          CONCURRENCY_LIMIT // Process 3 owners at a time
        ),
        // Collect all results
        bufferCount(numOwners)
      )
    );

    // Check for any failures
    const failedOwners = results.filter(result => !result.success);
    if (failedOwners.length > 0) {
      console.error(`\nFailed to process ${failedOwners.length} owners. Check logs for details.`);
      process.exit(1);
    }

    console.log("\nDatabase seeding completed successfully!");
  } catch (error) {
    console.error("Error during database seeding:", error);
    process.exit(1);
  }
}

// Track in-progress operations
let isShuttingDown = false;
const activeOperations: Set<Promise<unknown>> = new Set();

// Handle process termination signals
function setupSignalHandlers() {
  const handleShutdown = async (signal: string) => {
    if (isShuttingDown) return;
    isShuttingDown = true;

    console.log(`\nReceived ${signal}, cleaning up...`);

    // Wait for active operations to complete with a timeout
    try {
      await Promise.race([
        Promise.allSettled(activeOperations),
        new Promise(resolve => setTimeout(resolve, 10000)), // 10s timeout for cleanup
      ]);
      console.log("Cleanup complete. Exiting...");
      process.exit(0);
    } catch (error) {
      console.error("Error during cleanup:", error);
      process.exit(1);
    }
  };

  process.on("SIGINT", () => handleShutdown("SIGINT"));
  process.on("SIGTERM", () => handleShutdown("SIGTERM"));
}

// Helper to track async operations
function trackOperation<T>(promise: Promise<T>): Promise<T> {
  if (isShuttingDown) {
    return Promise.reject(new Error("Shutdown in progress"));
  }

  const trackedPromise = promise.finally(() => {
    activeOperations.delete(trackedPromise);
  });

  activeOperations.add(trackedPromise);
  return trackedPromise;
}

// Run the seed function
async function main() {
  console.log("Starting database seeding...");
  const ownerArg = argv.find(arg => arg.startsWith("--owners="));
  if (!ownerArg || isNaN(parseInt(ownerArg.split("=")[1]))) {
    console.error("No number of owners specified. Please use --owners=<number>");
    process.exit(1);
  }
  const numOwners = parseInt(ownerArg.split("=")[1]);

  setupSignalHandlers();
  try {
    await trackOperation(seedDatabase(numOwners));
  } catch (error) {
    if (!isShuttingDown) {
      console.error("Error in main:", error);
      process.exit(1);
    }
  }
}

main();
