import { z } from "zod";

export const propertyTraceSchema = z.object({
  id: z.string().optional(),
  idPropertyTrace: z.string().optional(),
  idProperty: z.string().min(1, "El ID de la propiedad es requerido"),
  dateSale: z.string().or(z.date()).pipe(z.coerce.date()),
  name: z.string().min(1, "El nombre es requerido"),
  value: z.number().min(0, "El valor debe ser mayor o igual a 0"),
  tax: z.number().min(0, "El impuesto debe ser mayor o igual a 0"),
});

export type PropertyTrace = z.infer<typeof propertyTraceSchema>;
