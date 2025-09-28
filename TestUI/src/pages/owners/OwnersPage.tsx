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

  if (isLoading) return <div>Cargando propietarios...</div>;
  if (error) return <div>Error al cargar los propietarios</div>;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Propietarios</h1>
        <Link
          to="/propietarios/nuevo"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Agregar Propietario
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {owners?.map(owner => (
          <Link
            key={owner.id}
            to={`/propietarios/${owner.id}`}
            className="p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow bg-white"
          >
            <h2 className="text-lg font-semibold">{owner.name}</h2>
            <p className="text-gray-600">{owner.address}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
