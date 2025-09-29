import { z } from "zod";

export const propertyTraceSchema = z.object({
  id: z.string(),
  idPropertyTrace: z.string().optional(),
  idProperty: z.string().min(1, "Property ID is required"),
  dateSale: z.string().or(z.date()).pipe(z.coerce.date()),
  name: z.string().min(1, "Name is required"),
  value: z.number().min(0, "Value must be greater than or equal to 0"),
  tax: z.number().min(0, "Tax must be greater than or equal to 0"),
});

export type PropertyTrace = z.infer<typeof propertyTraceSchema>;
