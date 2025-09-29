import { useEffect, useState } from "react";
import type { Property } from "@/schemas/Property";
import housePlaceholder from "@/assets/house-placeholder.svg";
import { Skeleton } from "@/components/Atoms/Skeleton";

export default function PropertyCard({ property }: { property: Property }) {
  const [showPlaceholder, setShowPlaceholder] = useState(!property.coverImageUrl);

  useEffect(() => {
    setShowPlaceholder(!property.coverImageUrl);
  }, [property.coverImageUrl]);

  return (
    <div className="border rounded-lg overflow-hidden shadow-sm flex flex-col sm:flex-row h-32 bg-white hover:shadow-md transition-shadow">
      <div className="w-full sm:w-1/4 h-full bg-gray-100 flex-shrink-0 overflow-hidden">
        <img
          src={showPlaceholder ? housePlaceholder : property.coverImageUrl}
          alt="Property placeholder"
          className="w-full h-full object-cover"
          onError={() => setShowPlaceholder(true)}
        />
      </div>
      <div className="p-4 flex flex-col justify-between flex-1">
        <div>
          <h2 className="text-lg font-bold text-gray-800">{property.name}</h2>
          <p className="text-gray-600 text-sm mt-1">{property.address}</p>
        </div>
        <div className="mt-2">
          <span className="text-green-700 font-semibold">${property.price?.toLocaleString()}</span>
          {property.year && (
            <span className="text-gray-500 text-sm ml-2">Year: {property.year}</span>
          )}
        </div>
      </div>
    </div>
  );
}

export function PropertyCardSkeleton() {
  return (
    <div className="border rounded-lg flex flex-col sm:flex-row h-32 overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white">
      <Skeleton className="w-full sm:w-1/4 h-full flex-shrink-0" />
      <div className="p-4 flex flex-col justify-between flex-1">
        <div>
          <Skeleton className="h-6 w-4/5 mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        <div className="mt-2">
          <Skeleton className="h-5 w-1/3 inline-block" />
          <Skeleton className="h-4 w-16 ml-2 inline-block" />
        </div>
      </div>
    </div>
  );
}

export function PropertyListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <PropertyCardSkeleton key={index} />
      ))}
    </div>
  );
}
