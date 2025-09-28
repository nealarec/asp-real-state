import { z } from "zod";

export const propertyImageSchema = z.object({
  id: z.string().optional(),
  idPropertyImage: z.string().optional(),
  idProperty: z.string().min(1, "El ID de la propiedad es requerido"),
  file: z.string().min(1, "El archivo es requerido"),
  enabled: z.boolean().default(true),
});

export type PropertyImage = z.infer<typeof propertyImageSchema>;
