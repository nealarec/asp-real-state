// src/hooks/useFilterReducer.ts
import type { PropertyMetadataResponse as Metadata } from "@/schemas/PropertyMetadata";
import { useReducer, useMemo } from "react";

export interface FilterState {
  search: string;
  ownerId: string;
  minPrice: number;
  maxPrice: number;
  minYear: number;
  maxYear: number;
  codeInternal: string;
  page: number;
  pageSize: number;
  metadata: Metadata;
}

type FilterAction =
  | { type: "SET_SEARCH"; payload: string }
  | { type: "SET_OWNER_ID"; payload: string }
  | { type: "SET_PRICE_RANGE"; payload: { min?: number | undefined; max?: number | undefined } }
  | { type: "SET_YEAR_RANGE"; payload: { min?: number | undefined; max?: number | undefined } }
  | { type: "SET_PAGE"; payload: number }
  | { type: "SET_METADATA"; payload: Metadata }
  | { type: "RESET_FILTERS" };

const initMetadata: Metadata = {
  priceRange: {
    min: 0,
    max: 10_000_000,
    average: 0,
  },
  yearRange: {
    min: 1970,
    max: new Date().getFullYear() + 1,
  },
  totalProperties: 0,
};

const initialState: FilterState = {
  search: "",
  ownerId: "",
  minPrice: initMetadata.priceRange.min,
  maxPrice: initMetadata.priceRange.max,
  minYear: initMetadata.yearRange.min,
  maxYear: initMetadata.yearRange.max,
  codeInternal: "",
  page: 1,
  pageSize: 18,
  metadata: initMetadata,
};

function filterReducer(state: FilterState, action: FilterAction): FilterState {
  switch (action.type) {
    case "SET_SEARCH":
      return { ...state, search: action.payload, page: 1 };
    case "SET_OWNER_ID":
      return { ...state, ownerId: action.payload, page: 1 };
    case "SET_PRICE_RANGE":
      return {
        ...state,
        minPrice: action.payload.min ?? state.metadata.priceRange.min,
        maxPrice: action.payload.max ?? state.metadata.priceRange.max,
        page: 1,
      };
    case "SET_YEAR_RANGE":
      return {
        ...state,
        minYear: action.payload.min ?? state.metadata.yearRange.min,
        maxYear: action.payload.max ?? state.metadata.yearRange.max,
        page: 1,
      };
    case "SET_PAGE":
      return { ...state, page: action.payload };
    case "SET_METADATA":
      return {
        ...state,
        metadata: action.payload,
        minPrice: action.payload.priceRange.min,
        maxPrice: action.payload.priceRange.max,
        minYear: action.payload.yearRange.min,
        maxYear: action.payload.yearRange.max,
      };
    case "RESET_FILTERS":
      return {
        ...initialState,
        metadata: state.metadata,
        minPrice: state.metadata.priceRange.min,
        maxPrice: state.metadata.priceRange.max,
        minYear: state.metadata.yearRange.min,
        maxYear: state.metadata.yearRange.max,
      };
    default:
      return state;
  }
}

export function useFilterReducer(initialFilters: Partial<FilterState> = {}) {
  const [state, dispatch] = useReducer(filterReducer, {
    ...initialState,
    ...initialFilters,
  });

  const actions = useMemo(
    () => ({
      setSearch: (search: string) => dispatch({ type: "SET_SEARCH", payload: search }),
      setOwnerId: (ownerId: string) => dispatch({ type: "SET_OWNER_ID", payload: ownerId }),
      setPriceRange: (min: number | undefined, max: number | undefined) =>
        dispatch({ type: "SET_PRICE_RANGE", payload: { min, max } }),
      setYearRange: (min: number | undefined, max: number | undefined) =>
        dispatch({ type: "SET_YEAR_RANGE", payload: { min, max } }),
      setPage: (page: number) => dispatch({ type: "SET_PAGE", payload: page }),
      setMetadata: (metadata: Metadata) => dispatch({ type: "SET_METADATA", payload: metadata }),
      resetFilters: () => dispatch({ type: "RESET_FILTERS" }),
    }),
    [dispatch]
  );

  return useMemo(() => ({ state, actions }), [state, actions]);
}

export type FilterActions = ReturnType<typeof useFilterReducer>["actions"];
