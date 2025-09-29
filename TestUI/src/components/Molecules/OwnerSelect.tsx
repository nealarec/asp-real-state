// src/components/Molecules/AsyncSelect/OwnerSelect.tsx
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useOwners } from "@/hooks/useOwners";
import type { Owner } from "@/schemas/Owner";
import Input from "@/components/Atoms/Form/Input";
import { LoadingSpinner } from "@/components/Atoms/LoadingSpinner";
import { useIsMobile } from "@/hooks/useIsMobile";
import { FaTimes } from "react-icons/fa";
import { AnimatePresence } from "framer-motion";

interface OwnerSelectProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  className?: string;
}

const MIN_SEARCH_LENGTH = 3;

export function OwnerSelect({
  value,
  onChange,
  error,
  disabled,
  className = "",
}: OwnerSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOwner, setSelectedOwner] = useState<Owner | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();
  const { getOwner } = useOwners();

  // Fetch the selected owner details
  const { data: selectedOwnerData, isLoading: isLoadingSelectedOwner } = getOwner(value);

  const {
    data: ownersData,
    isLoading: isLoadingOwners,
    isError,
  } = useOwners({
    page: 1,
    pageSize: 10,
    search: searchQuery.length >= MIN_SEARCH_LENGTH ? searchQuery : "",
  });

  // Combine the selected owner with the search results, removing duplicates
  const owners = useMemo(() => {
    const ownersList = ownersData?.data || [];
    if (!value || !selectedOwnerData || ownersList.some(owner => owner.id === value)) {
      return ownersList;
    }
    return [selectedOwnerData, ...ownersList];
  }, [ownersData, selectedOwnerData, value]);

  const isLoading = isLoadingOwners || isLoadingSelectedOwner;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (value && owners.length > 0) {
      const owner = owners.find(o => o.id === value);
      if (owner) setSelectedOwner(owner);
    } else {
      setSelectedOwner(null);
    }
  }, [value, owners]);

  const handleSelect = useCallback(
    (owner: Owner) => {
      onChange(owner.id);
      setSelectedOwner(owner);
      setIsOpen(false);
      setSearchQuery("");
    },
    [onChange]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Disable body scroll when modal is open on mobile
  useEffect(() => {
    if (!isMobile) return;

    document.body.style.overflow = isOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobile, isOpen]);

  const toggleDropdown = useCallback(() => {
    if (disabled) return;

    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);

    if (newIsOpen && inputRef.current) {
      // Small timeout to ensure the modal is rendered before focusing
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [disabled, isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        toggleDropdown();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, toggleDropdown]);

  const renderDesktopDropdown = () => (
    <div className="absolute z-10 w-full mt-0.5 bg-white border border-gray-300 rounded shadow-lg">
      <div className="p-1.5 border-b">
        <Input
          ref={inputRef}
          type="text"
          placeholder={`Search (min ${MIN_SEARCH_LENGTH} chars)...`}
          value={searchQuery}
          onChange={handleInputChange}
          className="w-full text-sm px-2 py-1"
          autoFocus
        />
      </div>
      {renderContent()}
    </div>
  );

  const renderMobileModal = () => (
    <div className="fixed top-0 bottom-0 left-0 right-0 flex flex-col bg-white rounded-t-xl shadow-2xl">
      {/* Header */}
      <div className="p-2 border-b flex justify-between items-center gap-2">
        <Input
          ref={inputRef}
          type="search"
          inputMode="search"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
          placeholder="Search owners..."
          value={searchQuery}
          onChange={handleInputChange}
          containerClassName="mb-0 flex-1"
          className="w-full text-base px-3 py-2 border rounded-lg"
          autoFocus
        />
        <button 
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleDropdown();
          }}
          className="p-1 -mr-1"
        >
          <FaTimes className="w-6 h-6 text-gray-500" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">{renderContent()}</div>
    </div>
  );

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center p-4">
          <LoadingSpinner size="small" />
        </div>
      );
    }

    if (isError) {
      return <div className="p-3 text-sm text-red-500 text-center">Error loading owners</div>;
    }

    if (owners.length === 0) {
      return (
        <div className="p-3 text-sm text-gray-500 text-center">
          {searchQuery.length < MIN_SEARCH_LENGTH
            ? `Type ${MIN_SEARCH_LENGTH}+ characters to search`
            : "No matches found"}
        </div>
      );
    }

    return (
      <ul>
        {owners.map(owner => (
          <li
            key={owner.id}
            className={`px-4 py-3 hover:bg-gray-50 active:bg-gray-100 cursor-pointer ${
              value === owner.id ? "bg-blue-50" : ""
            }`}
            onClick={() => {
              handleSelect(owner);
              if (isMobile) toggleDropdown();
            }}
          >
            <div className="font-medium">{owner.name}</div>
            {owner.address && <div className="text-sm text-gray-500 truncate">{owner.address}</div>}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className={`relative w-full ${className}`} ref={dropdownRef}>
      <div
        onClick={toggleDropdown}
        className={`flex items-center justify-between w-full px-3 py-2 text-sm border rounded-lg ${
          error ? "border-red-500" : "border-gray-300"
        } ${disabled ? "bg-gray-100" : "bg-white cursor-pointer hover:border-gray-400"}`}
      >
        {selectedOwner ? (
          <div className="min-w-0">
            <div className="truncate">{selectedOwner.name}</div>
            {selectedOwner.address && (
              <div className="text-xs text-gray-500 truncate">{selectedOwner.address}</div>
            )}
          </div>
        ) : (
          <span className="text-gray-400">Select owner</span>
        )}
        <svg
          className="w-5 h-5 ml-2 text-gray-400 flex-shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}

      <AnimatePresence>
        {isOpen && <div>{isMobile ? renderMobileModal() : renderDesktopDropdown()}</div>}
      </AnimatePresence>
    </div>
  );
}
