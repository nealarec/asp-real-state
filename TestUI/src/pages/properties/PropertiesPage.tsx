import { Link } from "react-router-dom";
import { useCallback, useEffect } from "react";
import { useProperties } from "@/hooks/useProperties";
import { useFilterReducer } from "@/hooks/useFilterReducer";
import PropertyCard, { PropertyListSkeleton } from "@/components/Molecules/PropertyCard";
import { Pagination } from "@/components/Organisms/Pagination";
import { PropertyFilters } from "@/components/Molecules/PropertyFilters";
import type { Property } from "@/schemas/Property";
import { useDebounce } from "@/hooks/useDebounce";

interface PropertiesPageProps {
  pageSize?: number;
}

export default function PropertiesPage({ pageSize = 18 }: PropertiesPageProps) {
  // Initialize filter reducer with default values
  const { state: filterState, actions } = useFilterReducer({
    pageSize,
  });

  const debouncedFilterState = useDebounce(filterState, 500);

  // Fetch properties using filters
  const {
    properties,
    isLoading: isPropertiesLoading,
    metadata: apiMetadata,
  } = useProperties(debouncedFilterState);

  // Update metadata when it's loaded from the API
  useEffect(() => {
    if (apiMetadata) {
      actions.setMetadata(apiMetadata);
    }
  }, [apiMetadata, actions]);

  const isLoading = isPropertiesLoading;

  // Handle page change
  const handlePageChange = useCallback(
    (newPage: number) => {
      actions.setPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [actions]
  );

  // Reset all filters
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
        <PropertyFilters state={filterState} actions={actions} />
      </div>

      {isLoading && !properties?.data?.length ? (
        <PropertyListSkeleton count={filterState.pageSize} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
          {properties?.data?.map((property: Property) => (
            <Link key={property.id} to={`/properties/${property.id}`} className="block h-full">
              <PropertyCard property={property} />
            </Link>
          ))}
        </div>
      )}

      <Pagination
        currentPage={filterState.page}
        totalItems={properties?.totalCount || 0}
        totalPages={properties?.totalPages || 0}
        pageSize={filterState.pageSize}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
