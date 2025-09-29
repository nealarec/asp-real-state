import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { useDebounce } from "@/hooks/useDebounce";
import { OwnerSelect } from "@/components/Molecules/OwnerSelect";
import Input from "@/components/Atoms/Form/Input";
import { Button } from "@/components/Atoms/Button";
import { Slider } from "@/components/Atoms/Form/Slider";
import { FaFilter, FaTimes } from "react-icons/fa";
import { useIsMobile } from "@/hooks/useIsMobile";

interface PropertyFiltersProps {
  onFilterChange: (filters: PropertyFilters) => void;
  initialFilters?: Partial<PropertyFilters>;
  isLoading?: boolean;
}

export interface PropertyFilters {
  search: string;
  ownerId: string;
  minPrice: number;
  maxPrice: number;
  minYear: number;
  maxYear: number;
  codeInternal: string;
}

// Default values in case metadata is not available
export const MIN_YEAR = 1900;
export const MAX_YEAR = new Date().getFullYear() + 1;
export const MIN_PRICE = 0;
export const MAX_PRICE = 10000000; // 10M

export function PropertyFilters({
  onFilterChange,
  initialFilters = {},
  isLoading = false,
}: PropertyFiltersProps) {
  // Use metadata from initialFilters or fallback to defaults
  const minPrice = initialFilters.minPrice ?? MIN_PRICE;
  const maxPrice = initialFilters.maxPrice ?? MAX_PRICE;
  const minYear = initialFilters.minYear ?? MIN_YEAR;
  const maxYear = initialFilters.maxYear ?? MAX_YEAR;

  // Show loading state
  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4 p-4 bg-gray-50 rounded-lg">
        <div className="h-6 bg-gray-200 rounded w-1/4"></div>
        <div className="space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }
  const isMobile = useIsMobile();
  const [showFilters, setShowFilters] = useState(false);

  const { control, watch, reset, setValue } = useForm<PropertyFilters>({
    defaultValues: {
      search: initialFilters.search ?? "",
      ownerId: initialFilters.ownerId ?? "",
      minPrice: minPrice,
      maxPrice: maxPrice,
      minYear: minYear,
      maxYear: maxYear,
    },
  });

  // Watch all form values
  const filters = watch();
  const debouncedFilters = useDebounce(filters, 500);

  // Notify parent component about filter changes
  useEffect(() => {
    onFilterChange(debouncedFilters);
  }, [debouncedFilters, onFilterChange]);

  const handleReset = () => {
    reset({
      search: "",
      ownerId: "",
      minPrice: minPrice,
      minYear: minYear,
      maxYear: maxYear,
    });
  };

  const hasActiveFilters = Object.entries(watch()).some(([key, value]) => key !== "search" && value !== "");

  const renderDesktopFilters = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Controller
            name="search"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                type="text"
                placeholder="Search properties..."
                className="w-full"
              />
            )}
          />
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 whitespace-nowrap"
        >
          {showFilters ? (
            <>
              <FaTimes className="h-4 w-4" />
              <span>Hide Filters</span>
            </>
          ) : (
            <>
              <FaFilter className="h-4 w-4" />
              <span>Filters</span>
            </>
          )}
          {hasActiveFilters && (
            <span className="ml-1 inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-600 text-xs">
              !
            </span>
          )}
        </Button>
      </div>
      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 animate-in fade-in">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Owner</label>
            <Controller
              name="ownerId"
              control={control}
              render={({ field }) => (
                <OwnerSelect value={field.value} onChange={field.onChange} className="w-full" />
              )}
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Price Range</label>
            <div className="px-2">
              <Controller
                name="minPrice"
                control={control}
                render={({ field }) => (
                  <Slider
                    min={MIN_PRICE}
                    max={MAX_PRICE}
                    step={1000}
                    value={[field.value, watch("maxPrice")]}
                    onValueChange={([min, max]) => {
                      if (typeof min === 'number' && typeof max === 'number') {
                        setValue("minPrice", min);
                        setValue("maxPrice", max);
                      }
                    }}
                    className="w-full"
                  />
                )}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>${watch("minPrice").toLocaleString()}</span>
                <span>${watch("maxPrice").toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Year Built</label>
            <div className="px-2">
              <Controller
                name="minYear"
                control={control}
                render={({ field }) => (
                  <Slider
                    min={MIN_YEAR}
                    max={MAX_YEAR}
                    step={1}
                    value={[field.value, watch("maxYear")]}
                    onValueChange={([min, max]) => {
                      if (typeof min === 'number' && typeof max === 'number') {
                        setValue("minYear", min);
                        setValue("maxYear", max);
                      }
                    }}
                    className="w-full"
                  />
                )}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>{watch("minYear")}</span>
                <span>{watch("maxYear")}</span>
              </div>
            </div>
          </div>

          <div className="col-span-full">
            <Button type="button" variant="secondary" onClick={handleReset} className="w-full">
              Reset Filters
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  const renderMobileFilters = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Controller
            name="search"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                type="text"
                placeholder="Search properties..."
                className="w-full"
              />
            )}
          />
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 whitespace-nowrap"
        >
          {showFilters ? (
            <>
              <FaTimes className="h-4 w-4" />
              <span>Hide</span>
            </>
          ) : (
            <>
              <FaFilter className="h-4 w-4" />
              <span>Filters</span>
            </>
          )}
          {hasActiveFilters && (
            <span className="ml-1 inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-600 text-xs">
              !
            </span>
          )}
        </Button>
      </div>
      
      {showFilters && (
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200 animate-in fade-in">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Owner</label>
            <Controller
              name="ownerId"
              control={control}
              render={({ field }) => (
                <OwnerSelect value={field.value} onChange={field.onChange} className="w-full" />
              )}
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Price Range</label>
            <div className="px-2">
              <Controller
                name="minPrice"
                control={control}
                render={({ field }) => (
                  <Slider
                    min={MIN_PRICE}
                    max={MAX_PRICE}
                    step={1000}
                    value={[field.value, watch("maxPrice")]}
                    onValueChange={([min, max]) => {
                      if (typeof min === 'number' && typeof max === 'number') {
                        setValue("minPrice", min);
                        setValue("maxPrice", max);
                      }
                    }}
                    className="w-full"
                  />
                )}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>${watch("minPrice").toLocaleString()}</span>
                <span>${watch("maxPrice").toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Year Built</label>
            <div className="px-2">
              <Controller
                name="minYear"
                control={control}
                render={({ field }) => (
                  <Slider
                    min={MIN_YEAR}
                    max={MAX_YEAR}
                    step={1}
                    value={[field.value, watch("maxYear")]}
                    onValueChange={([min, max]) => {
                      if (typeof min === 'number' && typeof max === 'number') {
                        setValue("minYear", min);
                        setValue("maxYear", max);
                      }
                    }}
                    className="w-full"
                  />
                )}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>{watch("minYear")}</span>
                <span>{watch("maxYear")}</span>
              </div>
            </div>
          </div>

          <Button type="button" variant="secondary" onClick={handleReset} className="w-full">
            Reset Filters
          </Button>
        </div>
      )}
    </div>
  );

  return isMobile ? renderMobileFilters() : renderDesktopFilters();
}
