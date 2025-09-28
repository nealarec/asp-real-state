import { z } from 'zod';

export const propertySchema = z.object({
  name: z.string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre no puede tener más de 100 caracteres'),
  address: z.string()
    .min(10, 'La dirección debe tener al menos 10 caracteres')
    .max(200, 'La dirección no puede tener más de 200 caracteres'),
  price: z.number()
    .min(0, 'El precio no puede ser negativo')
    .max(1000000000, 'El precio es demasiado alto'),
  codeInternal: z.string()
    .min(3, 'El código interno debe tener al menos 3 caracteres')
    .max(50, 'El código interno no puede tener más de 50 caracteres'),
  year: z.number()
    .min(1800, 'El año debe ser mayor a 1800')
    .max(new Date().getFullYear() + 1, 'El año no puede ser en el futuro'),
  idOwner: z.string().uuid('ID de propietario inválido'),
});

export type PropertyFormData = z.infer<typeof propertySchema>;
