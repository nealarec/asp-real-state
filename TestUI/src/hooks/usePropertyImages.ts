import { useQuery } from "@tanstack/react-query";
import type { PropertyImage } from "@/schemas/PropertyImage";

export function usePropertyImages(propertyId?: string) {
  return useQuery<PropertyImage[]>({
    queryKey: ["propertyImages", propertyId],
    queryFn: async () => {
      if (!propertyId) return [];
      const response = await fetch(`/api/properties/${propertyId}/images`);
      if (!response.ok) throw new Error("Error fetching property images");
      return response.json();
    },
    enabled: !!propertyId,
  });
}

export default usePropertyImages;
