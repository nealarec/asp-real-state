import { useState } from "react";
import { Link } from "react-router-dom";
import { useOwners } from "@/hooks/useOwners";
import { OwnerCard, OwnerCardSkeleton } from "@/components/Molecules/OwnerCard";
import { Button } from "@/components/Atoms/Button";
import { Pagination } from "@/components/Organisms/Pagination";

export default function OwnersPage() {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(24);

  const { data: ownersData, isLoading, error } = useOwners({ page, pageSize });

  if (isLoading) return <OwnersSkeleton />;
  if (error) return <div>Error: {error.message}</div>;

  const { data: owners = [], totalCount = 0 } = ownersData || {};
  const totalPages = Math.ceil(totalCount / pageSize);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Property Owners</h1>
        <Link to="/owners/new">
          <Button>Add New Owner</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {owners.map((owner: any) => (
          <OwnerCard key={owner.id} owner={owner} />
        ))}
      </div>

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
