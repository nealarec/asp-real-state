import { useParams, Link } from "react-router-dom";
import PropertyCard from "../../components/Molecules/PropertyCard";
import { useOwners } from "@/hooks/useOwners";

export default function OwnerDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { getOwner, getOwnerProperties } = useOwners();
  const { data: owner, isLoading: isLoadingOwner } = getOwner(id || "");
  const { data: properties, isLoading: isLoadingProperties } = getOwnerProperties(id || "");

  if (isLoadingOwner) return <div>Loading owner information...</div>;
  if (!owner) return <div>Owner not found</div>;

  return (
    <div className="p-4">
      <Link to="/owners" className="text-blue-600 hover:underline mb-4 inline-block">
        &larr; Back to Owners
      </Link>

      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h1 className="text-2xl font-bold mb-2">{owner.name}</h1>
        <p className="text-gray-600">{owner.address}</p>

        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4">Properties</h2>

          {isLoadingProperties ? (
            <p>Loading properties...</p>
          ) : properties && properties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {properties.map(property => (
                <Link key={property.id} to={`/properties/${property.id}`}>
                  <PropertyCard property={property} />
                </Link>
              ))}
            </div>
          ) : (
            <p>This owner has no registered properties.</p>
          )}
        </div>
      </div>
    </div>
  );
}
