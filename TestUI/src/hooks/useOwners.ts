import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getOwners,
  getOwnerById,
  getOwnerProperties as fetchOwnerProperties,
  createOwner,
  updateOwner,
  deleteOwner,
} from "@/services/ownerService";
import type { Owner } from "@/schemas/Owner";
import type { Property } from "@/schemas/Property";
import type { PaginationParams, PaginatedResponse } from "@/schemas/Pagination";

export const useOwners = (params?: Partial<PaginationParams>) => {
  const queryClient = useQueryClient();

  // Owners list query
  const ownersQuery = useQuery<PaginatedResponse<Owner>>({
    queryKey: ["owners", params],
    queryFn: () => getOwners(params),
  });

  // Single owner query
  const getOwner = (id: string) => {
    const { data, isLoading, isError, error, refetch } = useQuery<Owner>({
      queryKey: ["owner", id],
      queryFn: () => getOwnerById(id),
      enabled: !!id,
    });

    return {
      data,
      isLoading,
      isError,
      error: error as Error | null,
      refetch: () => refetch(),
    };
  };

  // Owner properties query
  const getOwnerProperties = (id: string) => {
    const { data, isLoading, isError, error, refetch } = useQuery<Property[]>({
      queryKey: ["owner-properties", id],
      queryFn: () => fetchOwnerProperties(id),
      enabled: !!id,
    });

    return {
      data,
      isLoading,
      isError,
      error: error as Error | null,
      refetch: () => refetch(),
    };
  };

  // Create owner mutation
  const { mutateAsync: create, isPending: isCreating } = useMutation({
    mutationFn: createOwner,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["owners"] });
    },
  });

  // Update owner mutation
  const { mutateAsync: update, isPending: isUpdating } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Owner> }) => updateOwner(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["owners"] });
      queryClient.invalidateQueries({ queryKey: ["owner", id] });
    },
  });

  // Delete owner mutation
  const { mutateAsync: remove, isPending: isDeleting } = useMutation({
    mutationFn: deleteOwner,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["owners"] });
    },
  });

  return {
    // Raw query data
    data: ownersQuery.data,
    isLoading: ownersQuery.isLoading,
    isError: ownersQuery.isError,
    error: ownersQuery.error as Error | null,

    // Single owner queries
    getOwner,
    getOwnerProperties,

    // Mutations
    createOwner: create as (owner: Omit<Owner, "id">) => Promise<Owner>,
    updateOwner: (id: string, data: Partial<Owner>) => update({ id, data }),
    deleteOwner: remove,

    // Mutation status
    isCreating,
    isUpdating,
    isDeleting,
  };
};
