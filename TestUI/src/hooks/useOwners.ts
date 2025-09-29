import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getOwners,
  getOwnerById,
  getOwnerProperties,
  createOwner,
  updateOwner,
  deleteOwner,
} from "@/services/ownerService";
import type { Owner } from "@/schemas/Owner";
import type { Property } from "@/schemas/Property";

export const useOwners = () => {
  const queryClient = useQueryClient();

  const ownersQuery = useQuery<Owner[]>({
    queryKey: ["owners"],
    queryFn: getOwners,
  });

  const ownerQuery = (id: string) =>
    useQuery<Owner>({
      queryKey: ["owner", id],
      queryFn: () => getOwnerById(id),
      enabled: !!id,
    });

  const ownerPropertiesQuery = (id: string) =>
    useQuery<Property[]>({
      queryKey: ["owner-properties", id],
      queryFn: () => getOwnerProperties(id),
      enabled: !!id,
    });

  const createOwnerMutation = useMutation({
    mutationFn: createOwner,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["owners"] });
    },
  });

  const updateOwnerMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Owner> }) => updateOwner(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["owners"] });
      queryClient.invalidateQueries({ queryKey: ["owner", id] });
    },
  });

  const deleteOwnerMutation = useMutation({
    mutationFn: deleteOwner,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["owners"] });
    },
  });

  return {
    owners: ownersQuery.data || [],
    isLoading: ownersQuery.isLoading,
    error: ownersQuery.error,
    getOwner: ownerQuery,
    getOwnerProperties: ownerPropertiesQuery,
    createOwner: createOwnerMutation.mutateAsync,
    updateOwner: updateOwnerMutation.mutateAsync,
    deleteOwner: deleteOwnerMutation.mutateAsync,
    isCreating: createOwnerMutation.isPending,
    isUpdating: updateOwnerMutation.isPending,
    isDeleting: deleteOwnerMutation.isPending,
  };
};
