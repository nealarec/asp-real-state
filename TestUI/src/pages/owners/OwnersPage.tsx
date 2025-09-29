import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useOwners } from "@/hooks/useOwners";
import { OwnerCard } from "@/components/Molecules/OwnerCard";
import { Button } from "@/components/Atoms/Button";
import { Pagination } from "@/components/Organisms/Pagination";
import { OwnerFilters } from "@/components/Molecules/OwnerFilters";

export default function OwnersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const [pageSize] = useState(24);
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  // Update URL when search term changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    if (debouncedSearchTerm) {
      params.set("search", debouncedSearchTerm);
      setPage(1); // Reset to first page on new search
    } else {
      params.delete("search");
    }
    setSearchParams(params, { replace: true });
  }, [debouncedSearchTerm, searchParams, setSearchParams]);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const {
    data: ownersData,
    isLoading,
    error,
  } = useOwners({
    page,
    pageSize,
    ...(debouncedSearchTerm ? { search: debouncedSearchTerm } : {}),
  });

  if (error) return <div>Error: {error.message}</div>;

  const { data: owners = [], totalCount = 0 } = ownersData || {};
  const totalPages = Math.ceil(totalCount / pageSize);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col space-y-4 mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Property Owners</h1>
          <Link to="/owners/new">
            <Button>Add New Owner</Button>
          </Link>
        </div>

        <OwnerFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onSearch={() => setDebouncedSearchTerm(searchTerm)}
          onClear={() => {
            setSearchTerm("");
            setDebouncedSearchTerm("");
          }}
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {[...Array(6)].map((_, i) => (
            <OwnerCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {owners.map((owner: any) => (
            <OwnerCard key={owner.id} owner={owner} />
          ))}
        </div>
      )}

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        totalItems={totalCount}
        pageSize={pageSize}
        onPageChange={handlePageChange}
      />
    </div>
  );
}

function OwnerCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="h-48 bg-gray-200 animate-pulse"></div>
      <div className="p-4">
        <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse mb-2"></div>
        <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse"></div>
      </div>
    </div>
  );
}
