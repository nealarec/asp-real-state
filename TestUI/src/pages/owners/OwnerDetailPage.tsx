import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import PropertyCard from "../../components/Molecules/PropertyCard";
import type { Owner } from "@/schemas/Owner";
import type { Property } from "@/schemas/Property";

export default function OwnerDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: owner, isLoading: isLoadingOwner } = useQuery<Owner>({
    queryKey: ["owner", id],
    queryFn: () => fetch(`/api/owners/${id}`).then(res => res.json()),
  });

  const { data: properties, isLoading: isLoadingProperties } = useQuery<Property[]>({
    queryKey: ["owner-properties", id],
    queryFn: () => fetch(`/api/owners/${id}/properties`).then(res => res.json()),
  });

  if (isLoadingOwner) return <div>Cargando información del propietario...</div>;
  if (!owner) return <div>Propietario no encontrado</div>;

  return (
    <div className="p-4">
      <Link to="/propietarios" className="text-blue-600 hover:underline mb-4 inline-block">
        &larr; Volver a Propietarios
      </Link>

      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h1 className="text-2xl font-bold mb-2">{owner.name}</h1>
        <p className="text-gray-600">{owner.address}</p>

        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4">Propiedades</h2>

          {isLoadingProperties ? (
            <p>Cargando propiedades...</p>
          ) : properties && properties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {properties.map(property => (
                <Link key={property.id} to={`/propiedades/${property.id}`}>
                  <PropertyCard property={property} />
                </Link>
              ))}
            </div>
          ) : (
            <p>Este propietario no tiene propiedades registradas.</p>
          )}
        </div>
      </div>
    </div>
  );
}
