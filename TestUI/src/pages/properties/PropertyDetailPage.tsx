import { useParams, Link } from "react-router-dom";
import placeholderImage from "@/assets/house-placeholder.svg";
import { PropertyImageGallery } from "@/components/Molecules/PropertyImageGallery";
import { usePropertyImages } from "@/hooks/usePropertyImages";
import { useProperties } from "@/hooks/useProperties";

export default function PropertyDetailPage() {
  const { id = "" } = useParams<{ id: string }>();

  const { data: property, isLoading, error } = useProperties().getProperty(id);

  const { data: images = [], isLoading: isLoadingImages } = usePropertyImages(id);
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
          </div>
          <span className="text-xl font-semibold text-green-700">
            ${property.price.toLocaleString()}
          </span>
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
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Description</h2>
              <p className="text-gray-700">{property.name || "No description available."}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
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
                    {property.idOwner}
                  </Link>
                ) : (
                  <p>Not available</p>
                )}
              </div>
            </div>

            <div className="flex gap-4">
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
        </div>
      </div>
    </div>
  );
}
