import type { Property } from "@/schemas/Property";

export default function PropertyCard({ property }: { property: Property }) {
  return (
    <div className="p-4 border rounded-lg shadow-sm flex flex-col sm:flex-row gap-4 bg-white">
      <img
        src={"https://picsum.photos/500/500"}
        alt={property.name}
        className="w-full sm:w-48 h-32 object-cover rounded"
      />
      <div className="flex flex-col justify-between">
        <h2 className="text-lg font-bold text-gray-800">{property.name}</h2>
        <div className="flex items-center gap-2">
          <p className="text-gray-600">{property.address}</p>
          <span className="text-green-700 font-semibold">${property.price}</span>
        </div>
      </div>
    </div>
  );
}
