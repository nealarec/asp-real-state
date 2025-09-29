import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { PropertyImage } from "@/schemas/PropertyImage";
import { toast } from "react-hot-toast";

interface UsePropertyImagesReturn {
  data: PropertyImage[];
  isLoading: boolean;
  error: Error | null;
  uploadImage: (files: FileList) => Promise<void>;
  deleteImage: (imageId: string) => Promise<void>;
}

export function usePropertyImages(propertyId?: string): UsePropertyImagesReturn {
  const queryClient = useQueryClient();
  const apiBaseUrl = import.meta.env["VITE_API_BASE_URL"] || "/api";

  const { data = [], isLoading, error } = useQuery<PropertyImage[]>({
    queryKey: ["propertyImages", propertyId],
    queryFn: async () => {
      if (!propertyId) return [];
      const response = await fetch(`${apiBaseUrl}/properties/${propertyId}/images`);
      if (!response.ok) throw new Error("Error fetching property images");
      return response.json();
    },
    enabled: !!propertyId,
  });

  const uploadImageMutation = useMutation({
    mutationFn: async (files: FileList) => {
      if (!propertyId) throw new Error("Property ID is required");
      
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append("file", file);
      });

      const response = await fetch(`${apiBaseUrl}/properties/${propertyId}/images`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error uploading images");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["propertyImages", propertyId] });
      toast.success("Images uploaded successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const deleteImageMutation = useMutation({
    mutationFn: async (imageId: string) => {
      if (!propertyId) throw new Error("Property ID is required");
      
      const response = await fetch(
        `${apiBaseUrl}/properties/${propertyId}/images/${imageId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error deleting image");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["propertyImages", propertyId] });
      toast.success("Image deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return {
    data,
    isLoading,
    error: error as Error | null,
    uploadImage: uploadImageMutation.mutateAsync,
    deleteImage: deleteImageMutation.mutateAsync,
  };
}

export default usePropertyImages;
