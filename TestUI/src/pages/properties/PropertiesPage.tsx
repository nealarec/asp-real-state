import { Link } from "react-router-dom";
import { useState, useCallback } from "react";
import { useProperties } from "@/hooks/useProperties";
import PropertyCard, { PropertyListSkeleton } from "@/components/Molecules/PropertyCard";
import { Pagination } from "@/components/Organisms/Pagination";
import {
  PropertyFilters,
  MIN_YEAR,
  MAX_YEAR,
  MIN_PRICE,
  MAX_PRICE,
} from "@/components/Molecules/PropertyFilters";
import type { PropertyFilters as PropertyFiltersType } from "@/components/Molecules/PropertyFilters";

export default function PropertiesPage() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<Partial<PropertyFiltersType>>({});
  const { metadata, isMetadataLoading } = useProperties();

  const { properties, isLoading, error } = useProperties({
    page,
    pageSize: 18,
    ...filters,
  });

  const handleFilterChange = useCallback((newFilters: PropertyFiltersType) => {
    setPage(1); // Reset to first page when filters change

    // Create a new filters object with only defined values
    const updatedFilters: Partial<PropertyFiltersType> = {};

    if (newFilters.search) updatedFilters.search = newFilters.search;
    if (newFilters.ownerId) updatedFilters.ownerId = newFilters.ownerId;
    if (newFilters.minPrice !== undefined) updatedFilters.minPrice = newFilters.minPrice;
    if (newFilters.maxPrice !== undefined) updatedFilters.maxPrice = newFilters.maxPrice;
    if (newFilters.minYear !== undefined) updatedFilters.minYear = newFilters.minYear;
    if (newFilters.maxYear !== undefined) updatedFilters.maxYear = newFilters.maxYear;
    if (newFilters.codeInternal) updatedFilters.codeInternal = newFilters.codeInternal;

    setFilters(updatedFilters);
  }, []);

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex flex-col space-y-4 mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Properties</h1>
            <Link
              to="/properties/new"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Property
            </Link>
          </div>
          <PropertyFilters
            onFilterChange={handleFilterChange}
            initialFilters={{
              minPrice: metadata?.priceRange?.min ?? MIN_PRICE,
              maxPrice: metadata?.priceRange?.max ?? MAX_PRICE,
              minYear: metadata?.yearRange?.min ?? MIN_YEAR,
              maxYear: metadata?.yearRange?.max ?? MAX_YEAR,
            }}
            isLoading={isMetadataLoading}
          />
        </div>
        <div className="p-4 text-red-500">Error loading properties: {error.message}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col space-y-4 mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Properties</h1>
          <Link
            to="/properties/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Property
          </Link>
        </div>
        <PropertyFilters
          onFilterChange={handleFilterChange}
          initialFilters={{
            minPrice: metadata?.priceRange?.min ?? MIN_PRICE,
            maxPrice: metadata?.priceRange?.max ?? MAX_PRICE,
            minYear: metadata?.yearRange?.min ?? MIN_YEAR,
            maxYear: metadata?.yearRange?.max ?? MAX_YEAR,
          }}
          isLoading={isMetadataLoading}
        />
      </div>

      {isLoading ? (
        <PropertyListSkeleton count={6} />
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 mb-6 auto-rows-fr">
          {properties?.data?.map((property: any) => (
            <Link to={`/properties/${property.id}`}>
              <PropertyCard property={property} />
            </Link>
          ))}
        </div>
      )}

      {!isLoading && (
        <Pagination
          currentPage={page}
          totalPages={properties?.totalPages}
          totalItems={properties?.totalCount}
          pageSize={properties?.pageSize}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
