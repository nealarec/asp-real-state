import { useState } from "react";
import { OwnerSelect } from "@/components/Molecules/OwnerSelect";
import Input from "@/components/Atoms/Form/Input";
import { Button } from "@/components/Atoms/Button";
import { Slider } from "@/components/Atoms/Form/Slider";
import { FaFilter, FaSearch, FaTimes } from "react-icons/fa";
import { useIsMobile } from "@/hooks/useIsMobile";
import type { FilterState, FilterActions } from "@/hooks/useFilterReducer";

export const PropertyFilters = ({
  state,
  actions,
}: {
  state: FilterState;
  actions: FilterActions;
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const isMobile = useIsMobile();

  const hasActiveFilters = Object.entries(state).some(
    ([key, value]) => key !== "search" && value !== ""
  );

  const renderDesktopFilters = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="flex-1 space-y-1">
          <div className="relative flex-1">
            <FaSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search owners by name..."
              className="pl-10 pr-10 p-3 w-full"
              containerClassName=""
              value={state.search}
              onChange={e => actions.setSearch(e.target.value)}
            />
            {state.search && (
              <FaTimes
                className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 cursor-pointer hover:text-gray-600"
                onClick={() => actions.setSearch("")}
              />
            )}
          </div>
        </div>
        <div>
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
      </div>
      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 animate-in fade-in">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Owner</label>
            <OwnerSelect value={state.ownerId} onChange={actions.setOwnerId} className="w-full" />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Price Range</label>
            <div className="px-2">
              <Slider
                min={state.metadata.priceRange.min}
                max={state.metadata.priceRange.max}
                step={1000}
                value={[state.minPrice, state.maxPrice]}
                onValueChange={([min, max]) => {
                  actions.setPriceRange(min, max);
                }}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>${state.minPrice?.toLocaleString()}</span>
                <span>${state.maxPrice?.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Year Built</label>
            <div className="px-2">
              <Slider
                min={state.metadata.yearRange.min}
                max={state.metadata.yearRange.max}
                step={1}
                value={[state.minYear, state.maxYear]}
                onValueChange={([min, max]) => {
                  if (typeof min === "number" && typeof max === "number") {
                    actions.setYearRange(min, max);
                  }
                }}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>{state.minYear}</span>
                <span>{state.maxYear}</span>
              </div>
            </div>
          </div>

          <div className="col-span-full">
            <Button
              type="button"
              variant="secondary"
              onClick={() => actions.resetFilters()}
              className="w-full"
            >
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
        <div className="flex-1 space-y-1">
          <label className="block text-sm font-medium text-gray-700">Search</label>
          <div className="relative">
            <Input
              type="text"
              placeholder="Search properties..."
              className="w-full bg-white"
              value={state.search}
              onChange={e => actions.setSearch(e.target.value)}
            />
          </div>
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
            <OwnerSelect value={state.ownerId} onChange={actions.setOwnerId} className="w-full" />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Price Range</label>
            <div className="px-2">
              <Slider
                min={state.metadata.priceRange.min}
                max={state.metadata.priceRange.max}
                step={1000}
                value={[state.minPrice, state.maxPrice]}
                onValueChange={([min, max]) => {
                  actions.setPriceRange(min, max);
                }}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>${state.minPrice.toLocaleString()}</span>
                <span>${state.maxPrice.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Year Built</label>
            <div className="px-2">
              <Slider
                min={state.metadata.yearRange.min}
                max={state.metadata.yearRange.max}
                step={1}
                value={[state.minYear, state.maxYear]}
                onValueChange={([min, max]) => {
                  if (typeof min === "number" && typeof max === "number") {
                    actions.setYearRange(min, max);
                  }
                }}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>{state.minYear}</span>
                <span>{state.maxYear}</span>
              </div>
            </div>
          </div>

          <Button
            type="button"
            variant="secondary"
            onClick={actions.resetFilters}
            className="w-full"
          >
            Reset Filters
          </Button>
        </div>
      )}
    </div>
  );

  return isMobile ? renderMobileFilters() : renderDesktopFilters();
};
