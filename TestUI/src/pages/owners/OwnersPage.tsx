import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import type { Owner } from "@/schemas/Owner";

export default function OwnersPage() {
  const {
    data: owners,
    isLoading,
    error,
  } = useQuery<Owner[]>({
    queryKey: ["owners"],
    queryFn: () => fetch("/api/owners").then(res => res.json()),
  });

  if (isLoading) return <div>Loading owners...</div>;
  if (error) return <div>Error loading owners</div>;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Owners</h1>
        <Link
          to="/owners/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Add Owner
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {owners?.map(owner => (
          <Link
            key={owner.id}
            to={`/owners/${owner.id}`}
            className="p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow bg-white"
          >
            <div className="flex items-center mb-2">
              <img src={owner.photo} alt={owner.name} className="w-24 h-24 rounded-full mb-2" />
              <div className="ml-4">
                <h2 className="text-lg font-semibold">{owner.name}</h2>
                <p className="text-gray-600">{owner.address}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
