import type { PropertyTrace } from "@/schemas/PropertyTrace";

const API_BASE_URL = import.meta.env["VITE_API_BASE_URL"] || "/api";

export const getPropertyTraces = async (propertyId: string): Promise<PropertyTrace[]> => {
  const response = await fetch(`${API_BASE_URL}/properties/${propertyId}/traces`);
  if (!response.ok) {
    throw new Error("Error getting property traces");
  }
  return response.json();
};

export const getPropertyTraceById = async (id: string): Promise<PropertyTrace> => {
  const response = await fetch(`${API_BASE_URL}/property-traces/${id}`);
  if (!response.ok) {
    throw new Error("Error getting property trace");
  }
  return response.json();
};

export const createPropertyTrace = async (
  propertyId: string,
  trace: Omit<PropertyTrace, "id">
): Promise<PropertyTrace> => {
  const response = await fetch(`${API_BASE_URL}/properties/${propertyId}/traces`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(trace),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Error creating property trace");
  }

  return response.json();
};

export const updatePropertyTrace = async (
  id: string,
  trace: Partial<PropertyTrace>
): Promise<PropertyTrace> => {
  const response = await fetch(`${API_BASE_URL}/property-traces/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(trace),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Error updating property trace");
  }

  return response.json();
};

export const deletePropertyTrace = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/property-traces/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Error deleting property trace");
  }
};
