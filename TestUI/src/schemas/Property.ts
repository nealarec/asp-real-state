import { z } from "zod";

export const propertySchema = z.object({
  _id: z.string().optional(),
  idProperty: z.string().optional(),
  name: z.string().min(1, "El nombre es requerido"),
  address: z.string().min(1, "La dirección es requerida"),
  price: z.number().min(0, "El precio debe ser mayor o igual a 0"),
  codeInternal: z.string().min(1, "El código interno es requerido"),
  year: z
    .number()
    .int()
    .min(1800, "El año debe ser válido")
    .max(new Date().getFullYear() + 1, "El año no puede ser en el futuro"),
  idOwner: z.string().min(1, "El ID del propietario es requerido"),
});

export type Property = z.infer<typeof propertySchema>;
