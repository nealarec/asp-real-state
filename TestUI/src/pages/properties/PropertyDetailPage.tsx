import type { Property } from "@/schemas/Property";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import placeholderImage from "@/assets/house-placeholder.svg";

export default function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>();

  const {
    data: property,
    isLoading,
    error,
  } = useQuery<Property>({
    queryKey: ["property", id],
    queryFn: () => fetch(`/api/properties/${id}`).then(res => res.json()),
  });

  const [showPlaceholder, setShowPlaceholder] = useState(!property?.coverImageUrl);

  if (isLoading) return <div>Cargando propiedad...</div>;
  if (error) return <div>Error al cargar la propiedad</div>;
  if (!property) return <div>Propiedad no encontrada</div>;

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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <img
              src={showPlaceholder ? placeholderImage : property.coverImageUrl}
              alt={property.name}
              className="w-full h-auto rounded-lg bg-gray-200"
              onError={() => setShowPlaceholder(true)}
            />
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
