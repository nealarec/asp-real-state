import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import PropertyCard from "../../components/Molecules/PropertyCard";
import type { Property } from "@/schemas/Property";

export default function PropertiesPage() {
  const {
    data: properties,
    isLoading,
    error,
  } = useQuery<Property[]>({
    queryKey: ["properties"],
    queryFn: () => fetch("/api/properties").then(res => res.json()),
  });

  if (isLoading) return <div>Cargando propiedades...</div>;
  if (error) return <div>Error al cargar las propiedades</div>;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Propiedades</h1>
        <Link
          to="/propiedades/nueva"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Agregar Propiedad
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {properties?.map(property => (
          <Link key={property.id} to={`/propiedades/${property.id}`}>
            <PropertyCard property={property} />
          </Link>
        ))}
      </div>
    </div>
  );
}
