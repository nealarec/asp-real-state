import type { Property } from "@/schemas/Property";
import type { PropertyImage } from "@/schemas/PropertyImage";

const API_BASE_URL = import.meta.env["VITE_API_BASE_URL"] || "/api";

export const getProperties = async (): Promise<Property[]> => {
  const response = await fetch(`${API_BASE_URL}/properties`);
  if (!response.ok) {
    throw new Error("Error al obtener las propiedades");
  }
  return response.json();
};

export const getPropertyById = async (id: string): Promise<Property> => {
  const response = await fetch(`${API_BASE_URL}/properties/${id}`);
  if (!response.ok) {
    throw new Error("Error al obtener la propiedad");
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
    throw new Error(error.message || "Error al crear la propiedad");
  }

  return response.json();
};

export const updateProperty = async (
  id: string,
  property: Partial<Property>
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
    throw new Error(error.message || "Error al actualizar la propiedad");
  }

  return response.json();
};

export const deleteProperty = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/properties/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Error al eliminar la propiedad");
  }
};

export const getPropertyImages = async (propertyId: string): Promise<PropertyImage[]> => {
  const response = await fetch(`${API_BASE_URL}/properties/${propertyId}/images`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Error al cargar las imágenes de la propiedad");
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
    throw new Error(error.message || "Error al subir las imágenes");
  }

  return response.json();
};
