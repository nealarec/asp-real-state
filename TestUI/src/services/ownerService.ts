import type { Owner } from "@/schemas/Owner";
import type { Property } from "@/schemas/Property";

const API_BASE_URL = import.meta.env["VITE_API_BASE_URL"] || "/api";

export const getOwners = async (): Promise<Owner[]> => {
  const response = await fetch(`${API_BASE_URL}/owners`);
  if (!response.ok) {
    throw new Error("Error getting owners");
  }
  return response.json();
};

export const getOwnerById = async (id: string): Promise<Owner> => {
  const response = await fetch(`${API_BASE_URL}/owners/${id}`);
  if (!response.ok) {
    throw new Error("Error getting owner");
  }
  return response.json();
};

export const getOwnerProperties = async (id: string): Promise<Property[]> => {
  const response = await fetch(`${API_BASE_URL}/owners/${id}/properties`);
  if (!response.ok) {
    throw new Error("Error getting owner properties");
  }
  return response.json();
};

export const createOwner = async (owner: Omit<Owner, "id">): Promise<Owner> => {
  const response = await fetch(`${API_BASE_URL}/owners`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(owner),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Error creating owner");
  }

  return response.json();
};

export const updateOwner = async (id: string, owner: Partial<Owner>): Promise<Owner> => {
  const response = await fetch(`${API_BASE_URL}/owners/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(owner),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Error updating owner");
  }

  return response.json();
};

export const deleteOwner = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/owners/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Error deleting owner");
  }
};
