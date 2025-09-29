import { z } from "zod";

export const propertyImageSchema = z.object({
  id: z.string(),
  idPropertyImage: z.string().optional(),
  idProperty: z.string().min(1, "Property ID is required"),
  fileUrl: z.string().min(1, "File is required"),
  enabled: z.boolean().default(true),
});

export type PropertyImage = z.infer<typeof propertyImageSchema>;
