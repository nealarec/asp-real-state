import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getPropertyTraces,
  getPropertyTraceById,
  createPropertyTrace,
  updatePropertyTrace,
  deletePropertyTrace,
} from "@/services/propertyTraceService";
import type { PropertyTrace } from "@/schemas/PropertyTrace";

export const usePropertyTraces = (propertyId?: string) => {
  const queryClient = useQueryClient();

  const propertyTracesQuery = useQuery<PropertyTrace[]>({
    queryKey: ["property-traces", propertyId],
    queryFn: () => getPropertyTraces(propertyId!),
    enabled: !!propertyId,
  });

  const propertyTraceQuery = (id: string) =>
    useQuery<PropertyTrace>({
      queryKey: ["property-trace", id],
      queryFn: () => getPropertyTraceById(id),
      enabled: !!id,
    });

  const createPropertyTraceMutation = useMutation({
    mutationFn: (data: Omit<PropertyTrace, "id">) => createPropertyTrace(propertyId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["property-traces", propertyId] });
    },
  });

  const updatePropertyTraceMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<PropertyTrace> }) =>
      updatePropertyTrace(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["property-traces", propertyId] });
      queryClient.invalidateQueries({ queryKey: ["property-trace", id] });
    },
  });

  const deletePropertyTraceMutation = useMutation({
    mutationFn: deletePropertyTrace,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["property-traces", propertyId] });
    },
  });

  return {
    propertyTraces: propertyTracesQuery.data || [],
    isLoading: propertyTracesQuery.isLoading,
    error: propertyTracesQuery.error,
    getPropertyTrace: propertyTraceQuery,
    createPropertyTrace: createPropertyTraceMutation.mutateAsync,
    updatePropertyTrace: updatePropertyTraceMutation.mutateAsync,
    deletePropertyTrace: deletePropertyTraceMutation.mutateAsync,
    isCreating: createPropertyTraceMutation.isPending,
    isUpdating: updatePropertyTraceMutation.isPending,
    isDeleting: deletePropertyTraceMutation.isPending,
  };
};
