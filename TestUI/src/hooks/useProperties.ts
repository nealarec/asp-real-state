import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
} from "@/services/propertyService";
import type { Property, PropertyFormData } from "@/schemas/Property";
import type { PaginationParams, PaginatedResponse } from "@/schemas/Pagination";

interface UsePropertiesOptions extends PaginationParams {
  enabled?: boolean;
}

export const useProperties = (options: UsePropertiesOptions = {}) => {
  const { page = 1, pageSize = 10, enabled = true, ...filters } = options;
  const queryClient = useQueryClient();

  const params: Record<string, string | number | undefined> = {
    page,
    pageSize,
    ...filters,
  };

  const propertiesQuery = useQuery<PaginatedResponse<Property>>({
    queryKey: ["properties", params],
    queryFn: () => getProperties(params as any), // Type assertion needed due to exactOptionalPropertyTypes
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled,
  } as any); // Type assertion for keepPreviousData

  const propertyQuery = (id: string) =>
    useQuery<Property, Error>({
      queryKey: ["property", id],
      queryFn: () => getPropertyById(id),
      enabled: !!id,
    });

  const createPropertyMutation = useMutation({
    mutationFn: createProperty,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
    },
  });

  const updatePropertyMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<PropertyFormData> }) =>
      updateProperty(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      queryClient.invalidateQueries({ queryKey: ["property", id] });
    },
  });

  const deletePropertyMutation = useMutation({
    mutationFn: deleteProperty,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
    },
  });

  return {
    properties: propertiesQuery.data || [],
    isLoading: propertiesQuery.isLoading,
    error: propertiesQuery.error,
    getProperty: propertyQuery,
    createProperty: createPropertyMutation.mutateAsync,
    updateProperty: updatePropertyMutation.mutateAsync,
    deleteProperty: deletePropertyMutation.mutateAsync,
    isCreating: createPropertyMutation.isPending,
    isUpdating: updatePropertyMutation.isPending,
    isDeleting: deletePropertyMutation.isPending,
  };
};
