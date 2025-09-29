import { useEffect, useState } from "react";
import type { Property } from "@/schemas/Property";
import housePlaceholder from "@/assets/house-placeholder.svg";

export default function PropertyCard({ property }: { property: Property }) {
  const [showPlaceholder, setShowPlaceholder] = useState(!property.coverImageUrl);

  useEffect(() => {
    setShowPlaceholder(!property.coverImageUrl);
  }, [property.coverImageUrl]);

  return (
    <div className="p-4 border rounded-lg shadow-sm flex flex-col sm:flex-row gap-4 bg-white hover:shadow-md transition-shadow">
      {showPlaceholder ? (
        <div className="w-full sm:w-48 h-32 bg-gray-100 rounded flex items-center justify-center">
          <img
            src={housePlaceholder}
            alt="Placeholder de propiedad"
            className="w-12 h-12 text-gray-400"
          />
        </div>
      ) : (
        <img
          src={property.coverImageUrl}
          alt={property.name}
          className="w-full sm:w-48 h-32 object-cover rounded"
          onError={() => setShowPlaceholder(true)}
        />
      )}

      <div className="flex flex-col justify-between flex-1">
        <div>
          <h2 className="text-lg font-bold text-gray-800">{property.name}</h2>
          <p className="text-gray-600 text-sm mt-1">{property.address}</p>
        </div>
        <div className="mt-2">
          <span className="text-green-700 font-semibold">${property.price?.toLocaleString()}</span>
          {property.year && (
            <span className="text-gray-500 text-sm ml-2">Año: {property.year}</span>
          )}
        </div>
      </div>
    </div>
  );
}
