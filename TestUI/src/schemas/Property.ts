import { z } from "zod";
import type { PropertyImage } from "./PropertyImage";

export const propertyFormSchema = z.object({
  id: z.string().readonly().optional(),
  name: z.string().min(1, "Property name is required"),
  address: z.string().min(1, "Address is required"),
  price: z.number().min(0, "Price must be greater than or equal to 0"),
  codeInternal: z.string().min(1, "Internal code is required"),
  year: z
    .number()
    .int()
    .min(1800, "Year must be valid")
    .max(new Date().getFullYear() + 1, "Year cannot be in the future"),
  idOwner: z.string().min(1, "Owner ID is required"),
  coverImageUrl: z.string().optional(),
});

export const propertySchema = propertyFormSchema.extend({
  id: z.string(),
  images: z.array(z.any()).optional(), // Using z.any() to avoid circular dependency with PropertyImage
});

export type Property = z.infer<typeof propertySchema> & {
  images?: PropertyImage[];
};

export type PropertyFormData = z.infer<typeof propertyFormSchema>;
