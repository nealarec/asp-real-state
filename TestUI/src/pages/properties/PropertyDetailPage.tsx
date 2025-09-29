import type { Property } from "@/schemas/Property";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import placeholderImage from "@/assets/house-placeholder.svg";
import { PropertyImageGallery } from "@/components/Molecules/PropertyImageGallery";
import { usePropertyImages } from "@/hooks/usePropertyImages";

export default function PropertyDetailPage() {
  const { id = "" } = useParams<{ id: string }>();

  const {
    data: property,
    isLoading,
    error,
  } = useQuery<Property | undefined>({
    queryKey: ["property", id],
    queryFn: () => fetch(`/api/properties/${id}`).then(res => res.json()),
  });

  const { data: images = [], isLoading: isLoadingImages } = usePropertyImages(id);
  if (isLoading) return <div className="p-4">Cargando propiedad...</div>;
  if (error) return <div className="p-4">Error al cargar la propiedad</div>;
  if (!property) return <div className="p-4">Propiedad no encontrada</div>;

  // Use existing images array directly since it already includes the cover image
  const allImages = images;

  return (
    <div className="p-4">
      <Link to="/propiedades" className="text-blue-600 hover:underline mb-4 inline-block">
        &larr; Volver a Propiedades
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
                  alt="No hay imágenes disponibles"
                  className="h-full w-full object-contain p-8 opacity-20"
                />
              </div>
            )}
          </div>

          <div>
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Descripción</h2>
              <p className="text-gray-700">{property.name || "No hay descripción disponible."}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Año</h3>
                <p>{property.year}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Propietario</h3>
                {property.idOwner ? (
                  <Link
                    to={`/propietarios/${property.idOwner}`}
                    className="text-blue-600 hover:underline"
                  >
                    {property.idOwner}
                  </Link>
                ) : (
                  <p>No disponible</p>
                )}
              </div>
            </div>

            <div className="flex gap-4">
              <Link
                to={`/propiedades/editar/${property.id}`}
                className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors"
              >
                Editar
              </Link>
              <button
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                onClick={() => {
                  // Lógica para eliminar
                  if (confirm("¿Estás seguro de que deseas eliminar esta propiedad?")) {
                    // Llamada a la API para eliminar
                  }
                }}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
