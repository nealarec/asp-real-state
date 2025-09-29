import type { Owner } from "@/schemas/Owner";
import type { PaginatedResponse, PaginationParams } from "@/schemas/Pagination";
import type { Property } from "@/schemas/Property";
import { buildUrl } from "@/lib/utils";

export const getOwners = async (params?: PaginationParams): Promise<PaginatedResponse<Owner>> => {
  const url = buildUrl("/owners", params);

  const response = await fetch(url.toString());
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Error getting owners");
  }

  const data: PaginatedResponse<Owner> = await response.json();

  return data;
};

export const getOwnerById = async (id: string): Promise<Owner> => {
  const response = await fetch(buildUrl(`/owners/${id}`));
  if (!response.ok) {
    throw new Error("Error getting owner");
  }
  return response.json();
};

export const getOwnerProperties = async (id: string): Promise<Property[]> => {
  const response = await fetch(buildUrl(`/owners/${id}/properties`));
  if (!response.ok) {
    throw new Error("Error getting owner properties");
  }
  return response.json();
};

export const createOwner = async (owner: Omit<Owner, "id">): Promise<Owner> => {
  const response = await fetch(buildUrl(`/owners`), {
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
  const response = await fetch(buildUrl(`/owners/${id}`), {
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
  const response = await fetch(buildUrl(`/owners/${id}`), {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Error deleting owner");
  }
};
