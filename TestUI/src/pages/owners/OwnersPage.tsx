import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useOwners } from "@/hooks/useOwners";
import { Button } from "@/components/Atoms/Button";
import { Pagination } from "@/components/Organisms/Pagination";
import { OwnerFilters } from "@/components/Molecules/OwnerFilters";
import { OwnerCard } from "@/components/Molecules/OwnerCard";
import { OwnerFormModal } from "@/components/Molecules/OwnerFormModal";
import type { Owner } from "@/schemas/Owner";
import toast from "react-hot-toast";

export default function OwnersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const [pageSize] = useState(24);
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { data, isLoading, createOwner } = useOwners({
    page,
    pageSize,
    search: searchTerm,
  });

  const owners = data?.data || [];
  const totalCount = data?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleCreateOwner = async (ownerData: Owner, cbSuccess: () => void) => {
    try {
      await createOwner(ownerData, {
        onSuccess: () => {
          cbSuccess();
        },
        onError: () => {
          toast.error("Failed to create owner. Please try again.");
        },
      });
    } catch (error) {
      console.error("Error creating owner:", error);
      toast.error("Failed to create owner. Please try again.");
      return Promise.reject(error);
    }
  };
  return (
    <div className="container mx-auto p-4">
      <OwnerFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateOwner}
      />
      <div className="flex flex-col space-y-4 mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Property Owners</h1>
          <Button onClick={() => setIsCreateModalOpen(true)}>Add New Owner</Button>
        </div>

        <OwnerFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onSearch={() => {
            // Update the URL when searching
            const params = new URLSearchParams(searchParams);
            if (searchTerm) {
              params.set("search", searchTerm);
            } else {
              params.delete("search");
            }
            setSearchParams(params);
          }}
          onClear={() => {
            setSearchTerm("");
            const params = new URLSearchParams(searchParams);
            params.delete("search");
            setSearchParams(params);
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
