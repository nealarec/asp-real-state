import { z } from "zod";

export const ownerSchema = z.object({
  id: z.string().optional(),
  idOwner: z.string().optional(),
  name: z.string().min(1, "El nombre es requerido"),
  address: z.string().min(1, "La dirección es requerida"),
  photo: z.string().url("Debe ser una URL válida").optional(),
  birthday: z.string().or(z.date()).pipe(z.coerce.date()),
});

export type Owner = z.infer<typeof ownerSchema>;
