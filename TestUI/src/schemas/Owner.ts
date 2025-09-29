import { z } from "zod";

export const ownerSchema = z.object({
  id: z.string(),
  idOwner: z.string(),
  name: z.string().min(1, "Name is required"),
  address: z.string().min(1, "Address is required"),
  photo: z.string().url("Must be a valid URL").optional(),
  birthday: z.string().or(z.date()).pipe(z.coerce.date()),
});

export type Owner = z.infer<typeof ownerSchema>;
