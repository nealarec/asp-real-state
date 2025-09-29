import { useParams, Link } from "react-router-dom";
import placeholderImage from "@/assets/house-placeholder.svg";
import { PropertyImageGallery } from "@/components/Molecules/PropertyImageGallery";
import { usePropertyImages } from "@/hooks/usePropertyImages";
import { useProperties } from "@/hooks/useProperties";
import { useOwners } from "@/hooks/useOwners";
import type { Owner } from "@/schemas/Owner";

export default function PropertyDetailPage() {
  const { id = "" } = useParams<{ id: string }>();

  const { data: property, isLoading, error } = useProperties().getProperty(id);
  const { data: images = [], isLoading: isLoadingImages } = usePropertyImages(id);
  const { data: owner, isLoading: isLoadingOwner } = useOwners().getOwner(property?.idOwner || "");

  if (isLoading) return <div className="p-4">Loading property...</div>;
  if (error) return <div className="p-4">Error loading property</div>;
  if (!property) return <div className="p-4">Property not found</div>;

  // Use existing images array directly since it already includes the cover image
  const allImages = images;

  return (
    <div className="p-4">
      <Link to="/properties" className="text-blue-600 hover:underline mb-4 inline-block">
        &larr; Back to Properties
      </Link>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold">{property.name}</h1>
            <p className="text-gray-600">{property.address}</p>

            {isLoadingOwner && (
              <div className="mt-2 text-sm text-gray-500">Loading owner info...</div>
            )}
          </div>

          <div className="flex gap-4 justify-end">
            <Link
              to={`/properties/edit/${property.id}`}
              className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors"
            >
              Edit
            </Link>
            <button
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
              onClick={() => {
                // Lógica para eliminar
                if (confirm("Are you sure you want to delete this property?")) {
                  // Llamada a la API para eliminar
                }
              }}
            >
              Delete
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Image Gallery */}
          <div className="mb-8">
            {isLoadingImages ? (
              <div className="aspect-video bg-gray-100 rounded-lg animate-pulse"></div>
            ) : allImages.length > 0 ? (
              <PropertyImageGallery images={allImages} />
            ) : (
              <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                <img
                  src={placeholderImage}
                  alt="No images available"
                  className="h-full w-full object-contain p-8 opacity-20"
                />
              </div>
            )}
          </div>

          <div>
            <span className="text-xl font-semibold text-green-700">
              ${property.price.toLocaleString()}
            </span>
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Description</h2>
              <p className="text-gray-700 md:min-h-[100px]">
                {property.name || "No description available."}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="w-full sm:w-1/3">
                <h3 className="text-sm font-medium text-gray-500">Year</h3>
                <p>{property.year}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Owner</h3>
                {property.idOwner ? (
                  <Link
                    to={`/owners/${property.idOwner}`}
                    className="text-blue-600 hover:underline"
                  >
                    {owner && (
                      <div className="mt-2 flex  items-center gap-2">
                        {owner.photo && (
                          <img
                            src={owner.photo}
                            alt="Owner"
                            className="mt-2 h-16 w-16 rounded-full object-cover"
                          />
                        )}
                        <p className="text-sm text-gray-600">
                          <span className="font-semibold">{owner.name}</span>
                          <span className="block">{owner.address}</span>
                        </p>
                      </div>
                    )}
                  </Link>
                ) : (
                  <p>Not available</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
