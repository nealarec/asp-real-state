import { Link } from "react-router-dom";
import { useOwners } from "@/hooks/useOwners";
import { OwnerCard, OwnerCardSkeleton } from "@/components/Molecules/OwnerCard";

export default function OwnersPage() {
  const { owners, isLoading, error } = useOwners();

  if (isLoading) return <OwnersSkeleton />;
  if (error) return <div className="p-4 text-red-500">Error loading owners: {error.message}</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Property Owners</h1>
        <Link
          to="/owners/new"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
        >
          Add New Owner
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {owners.map(owner => (
          <OwnerCard key={owner.id} owner={owner} />
        ))}
      </div>
    </div>
  );
}

function OwnersSkeleton() {
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <OwnerCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
