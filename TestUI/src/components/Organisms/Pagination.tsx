import { FiChevronLeft, FiChevronRight, FiMoreHorizontal } from "react-icons/fi";
import { Button } from "../Atoms/Button/Button";

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
  className = "",
  isArrow = false,
}: {
  page: number;
  active: boolean;
  disabled?: boolean;
  onClick: (page: number) => void;
  children: React.ReactNode;
  className?: string;
  isArrow?: boolean;
}) => (
  <li className={`${active ? "active" : ""} ${disabled ? "disabled" : ""}`}>
    <Button
      type="button"
      variant={active ? "primary" : "outline"}
      size="sm"
      className={`min-w-[32px] sm:min-w-[38px] ${isArrow ? "px-2" : "px-3"} ${className}`}
      onClick={() => !disabled && onClick(page)}
      disabled={disabled}
      aria-current={active ? "page" : undefined}
      aria-disabled={disabled}
    >
      {children}
    </Button>
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
      <div className="fixed bottom-0 left-0 right-0 sm:relative bg-white pb-4 pt-2 sm:pb-2 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="hidden sm:block text-sm text-gray-600 whitespace-nowrap">
          Showing{" "}
          <span className="font-medium">
            {Math.min((currentPage - 1) * pageSize + 1, totalItems)}
          </span>{" "}
          to <span className="font-medium">{Math.min(currentPage * pageSize, totalItems)}</span> of{" "}
          <span className="font-medium">{totalItems}</span> results
        </div>

        <nav aria-label="Page navigation" className="w-auto pb-3 sm:pb-0">
          <ul className="flex items-center gap-0.5 sm:gap-1">
            <div className="h-full flex items-center">
              <PaginationItem
                page={currentPage - 1}
                active={false}
                disabled={currentPage === 1}
                onClick={handlePageChange}
                className="px-2 h-full"
                isArrow={true}
              >
                <span className="sr-only">Previous</span>
                <FiChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </PaginationItem>
            </div>

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
              className="px-2 h-full"
              isArrow={true}
            >
              <span className="sr-only">Next</span>
              <FiChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </PaginationItem>
          </ul>
        </nav>
      </div>
    </div>
  );
}
