// Configuración de la aplicación
export const config = {
  // URL base de la API
  api: {
    baseUrl: import.meta.env["VITE_API_BASE_URL"] || "http://localhost:5000/api",
    endpoints: {
      properties: "/properties",
      propertyImages: (propertyId: string) => `/properties/${propertyId}/images`,
      uploadImage: (propertyId: string) => `/properties/${propertyId}/images/upload`,
    },
    // Tiempo máximo de espera para las peticiones (en milisegundos)
    timeout: 30000,
  },
  // Configuración de paginación
  pagination: {
    defaultPageSize: 10,
    pageSizeOptions: [5, 10, 20, 50],
  },
  // Configuración de imágenes
  images: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ["image/jpeg", "image/png", "image/webp"],
  },
};
