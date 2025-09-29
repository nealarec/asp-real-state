import { FiChevronLeft, FiChevronRight, FiMoreHorizontal } from "react-icons/fi";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  className?: string;
  maxVisiblePages?: number;
}

const PaginationItem = ({
  page,
  active,
  disabled = false,
  onClick,
  children,
}: {
  page: number;
  active: boolean;
  disabled?: boolean;
  onClick: (page: number) => void;
  children: React.ReactNode;
}) => (
  <li className={`page-item ${active ? "active" : ""} ${disabled ? "disabled" : ""}`}>
    <button
      className={`px-3 py-1.5 mx-0.5 min-w-[38px] text-center rounded-md border transition-colors ${
        active
          ? "bg-blue-600 border-blue-600 text-white"
          : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
      } ${disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100"}`}
      onClick={() => !disabled && onClick(page)}
      disabled={disabled}
      aria-current={active ? "page" : undefined}
      aria-disabled={disabled}
    >
      {children}
    </button>
  </li>
);

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  maxVisiblePages = 5,
  className = "",
}: PaginationProps) {
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    onPageChange(page);
    // Smooth scroll to top of the page
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    if (totalPages <= 1) return [];

    const pages: number[] = [];
    const half = Math.floor(maxVisiblePages / 2);
    let startPage = Math.max(1, currentPage - half);
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();
  const firstPageNum = pageNumbers[0] || 1;
  const lastPageNum = pageNumbers[pageNumbers.length - 1] || totalPages;

  const showFirstEllipsis = firstPageNum > 2;
  const showLastEllipsis = lastPageNum < totalPages - 1;
  const showFirstPage = firstPageNum !== 1;
  const showLastPage = lastPageNum !== totalPages;

  if (totalPages <= 1) return null;

  return (
    <div className={`${className} w-full`}>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-sm text-gray-600 whitespace-nowrap">
          Showing{" "}
          <span className="font-medium">
            {Math.min((currentPage - 1) * pageSize + 1, totalItems)}
          </span>{" "}
          to <span className="font-medium">{Math.min(currentPage * pageSize, totalItems)}</span> of{" "}
          <span className="font-medium">{totalItems}</span> results
        </div>

        <nav aria-label="Page navigation" className="w-full sm:w-auto">
          <ul className="flex items-center justify-center sm:justify-end gap-1">
            <PaginationItem
              page={currentPage - 1}
              active={false}
              disabled={currentPage === 1}
              onClick={handlePageChange}
            >
              <span className="sr-only">Previous</span>
              <FiChevronLeft className="h-4 w-4" />
            </PaginationItem>

            {showFirstPage && (
              <PaginationItem page={1} active={false} onClick={handlePageChange}>
                1
              </PaginationItem>
            )}

            {showFirstEllipsis && (
              <li className="px-2 py-1 text-gray-400" aria-hidden="true">
                <FiMoreHorizontal className="h-4 w-4" />
              </li>
            )}

            {pageNumbers.map(pageNum => (
              <PaginationItem
                key={pageNum}
                page={pageNum}
                active={pageNum === currentPage}
                onClick={handlePageChange}
              >
                {pageNum}
              </PaginationItem>
            ))}

            {showLastEllipsis && (
              <li className="px-2 py-1 text-gray-400" aria-hidden="true">
                <FiMoreHorizontal className="h-4 w-4" />
              </li>
            )}

            {showLastPage && (
              <PaginationItem page={totalPages} active={false} onClick={handlePageChange}>
                {totalPages}
              </PaginationItem>
            )}

            <PaginationItem
              page={currentPage + 1}
              active={false}
              disabled={currentPage >= totalPages}
              onClick={handlePageChange}
            >
              <span className="sr-only">Next</span>
              <FiChevronRight className="h-4 w-4" />
            </PaginationItem>
          </ul>
        </nav>
      </div>
    </div>
  );
}
