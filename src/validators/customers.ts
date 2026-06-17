import { z } from "zod";

export const updateCustomerSchema = z
  .object({
    name: z.string().min(1).max(120),
    phone: z.string().max(40),
    idDocument: z.string().max(40),
    avatarUrl: z.url(),
  })
  .partial();

export const addressInputSchema = z.object({
  label: z.string().max(60).nullish(),
  addressLine1: z.string().min(1).max(200),
  addressLine2: z.string().max(200).nullish(),
  city: z.string().min(1).max(120),
  state: z.string().max(120).nullish(),
  countryCode: z.string().length(2),
  postalCode: z.string().max(20).nullish(),
  isDefault: z.boolean().default(false),
});

export const updateAddressSchema = addressInputSchema.partial();
