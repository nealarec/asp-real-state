import { Link } from "react-router-dom";
import { useProperties } from "@/hooks/useProperties";
import { Skeleton } from "@/components/Atoms/Skeleton";
import PropertyCard, { PropertyListSkeleton } from "@/components/Molecules/PropertyCard";

export default function PropertiesPage() {
  const { properties, isLoading, error } = useProperties();

  if (isLoading) return <PropertiesSkeleton />;
  if (error)
    return <div className="p-4 text-red-500">Error loading properties: {error.message}</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Properties</h1>
        <Link
          to="/properties/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Add Property
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {properties?.map(property => (
          <Link key={property.id} to={`/properties/${property.id}`} className="block">
            <PropertyCard property={property} />
          </Link>
        ))}
      </div>
    </div>
  );
}

function PropertiesSkeleton() {
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>
      <PropertyListSkeleton />
    </div>
  );
}
