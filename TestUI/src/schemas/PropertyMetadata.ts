import { z } from "zod";

export const priceRangeSchema = z.object({
  min: z.number(),
  max: z.number(),
  average: z.number(),
});

export const yearRangeSchema = z.object({
  min: z.number(),
  max: z.number(),
});

export const propertyMetadataResponseSchema = z.object({
  priceRange: priceRangeSchema,
  yearRange: yearRangeSchema,
  totalProperties: z.number(),
});

export type PriceRange = z.infer<typeof priceRangeSchema>;
export type YearRange = z.infer<typeof yearRangeSchema>;
export type PropertyMetadataResponse = z.infer<typeof propertyMetadataResponseSchema>;
