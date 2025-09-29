import Input from "@/components/Atoms/Form/Input";
import { Button } from "@/components/Atoms/Button";
import { FaSearch, FaTimes } from "react-icons/fa";

interface OwnerFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onSearch: () => void;
  onClear: () => void;
  className?: string;
}

export function OwnerFilters({
  searchTerm,
  onSearchChange,
  onSearch,
  onClear,
  className = "",
}: OwnerFiltersProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      onSearch();
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <FaSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Search owners by name..."
            className="pl-10 pr-10 p-3 w-full"
            containerClassName="mb-0"
            value={searchTerm}
            onChange={e => onSearchChange(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          {searchTerm && (
            <FaTimes
              className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
              onClick={onClear}
            />
          )}
        </div>
      </div>
    </div>
  );
}
