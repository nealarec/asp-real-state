import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import qs from "qs";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const API_BASE_URL = import.meta.env["VITE_API_BASE_URL"] || "/api";

export const buildUrl = (path: string, params?: Record<string, any>): string => {
  // Remove leading slash from path if present
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;

  // Build base URL
  let baseUrl = API_BASE_URL || "/api";

  // Remove trailing slash from baseUrl if present
  baseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;

  // Build query string with qs
  const queryString = params
    ? qs.stringify(params, {
        skipNulls: true,
        arrayFormat: "brackets",
        encode: true,
      })
    : "";

  // Combine URL parts
  return `${baseUrl}/${cleanPath}${queryString ? `?${queryString}` : ""}`;
};
