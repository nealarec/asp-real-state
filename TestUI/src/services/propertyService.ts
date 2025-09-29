import type { Property, PropertyFormData } from "@/schemas/Property";
import type { PropertyImage } from "@/schemas/PropertyImage";
import type { PaginationParams, PaginatedResponse } from "@/schemas/Pagination";
import { buildUrl } from "@/lib/utils";

export const getProperties = async (
  params?: PaginationParams
): Promise<PaginatedResponse<Property>> => {
  const url = buildUrl("/properties", params);
  const response = await fetch(url);

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Error getting properties");
  }

  const data = (await response.json()) as PaginatedResponse<Property>;
  return data;
};

export const getPropertyById = async (id: string): Promise<Property> => {
  const url = buildUrl(`/properties/${id}`);
  const response = await fetch(url);

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Error getting property");
  }

  return response.json();
};

export const createProperty = async (property: Omit<Property, "id">): Promise<Property> => {
  const url = buildUrl("/properties");
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(property),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Error creating property");
  }

  return response.json();
};

export const updateProperty = async (
  id: string,
  property: Partial<PropertyFormData>
): Promise<Property> => {
  const url = buildUrl(`/properties/${id}`);
  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(property),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Error updating property");
  }

  return response.json();
};

export const deleteProperty = async (id: string): Promise<void> => {
  const url = buildUrl(`/properties/${id}`);
  const response = await fetch(url, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Error deleting property");
  }
};

export const getPropertyImages = async (propertyId: string): Promise<PropertyImage[]> => {
  const url = buildUrl(`/properties/${propertyId}/images`);
  const response = await fetch(url);

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Error loading property images");
  }

  return response.json();
};

export const uploadPropertyImage = async (
  propertyId: string,
  formData: FormData
): Promise<PropertyImage> => {
  const url = buildUrl(`/properties/${propertyId}/images`);
  const response = await fetch(url, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Error uploading image");
  }

  return response.json();
};

export const deletePropertyImage = async (propertyId: string, imageId: string): Promise<void> => {
  const url = buildUrl(`/properties/${propertyId}/images/${imageId}`);
  const response = await fetch(url, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Error deleting image");
  }
};
