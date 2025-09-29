import type { Property, PropertyFormData } from "@/schemas/Property";
import type { PropertyImage } from "@/schemas/PropertyImage";

const API_BASE_URL = import.meta.env["VITE_API_BASE_URL"] || "/api";

export const getProperties = async (): Promise<Property[]> => {
  const response = await fetch(`${API_BASE_URL}/properties`);
  if (!response.ok) {
    throw new Error("Error getting properties");
  }
  return response.json();
};

export const getPropertyById = async (id: string): Promise<Property> => {
  const response = await fetch(`${API_BASE_URL}/properties/${id}`);
  if (!response.ok) {
    throw new Error("Error getting property");
  }
  return response.json();
};

export const createProperty = async (property: Omit<Property, "id">): Promise<Property> => {
  const response = await fetch(`${API_BASE_URL}/properties`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(property),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Error creating property");
  }

  return response.json();
};

export const updateProperty = async (
  id: string,
  property: Partial<PropertyFormData>
): Promise<Property> => {
  const response = await fetch(`${API_BASE_URL}/properties/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(property),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Error updating property");
  }

  return response.json();
};

export const deleteProperty = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/properties/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Error deleting property");
  }
};

export const getPropertyImages = async (propertyId: string): Promise<PropertyImage[]> => {
  const response = await fetch(`${API_BASE_URL}/properties/${propertyId}/images`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Error loading property images");
  }

  return response.json();
};

export const uploadPropertyImage = async (
  propertyId: string,
  formData: FormData
): Promise<PropertyImage> => {
  const response = await fetch(`${API_BASE_URL}/properties/${propertyId}/images`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Error uploading image");
  }

  return response.json();
};

export const deletePropertyImage = async (propertyId: string, imageId: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/properties/${propertyId}/images/${imageId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Error al eliminar la imagen");
  }
};
