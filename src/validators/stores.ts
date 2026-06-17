import { z } from "zod";
import { COUNTRY_MODES, DECIMAL_SEPARATORS } from "../db/schema";
import { slugSchema } from "./common";

export const createStoreSchema = z.object({
  name: z.string().min(1).max(120),
  slug: slugSchema.optional(),
});

export const updateStoreSchema = z
  .object({
    name: z.string().min(1).max(120),
    slug: slugSchema,
    isActive: z.boolean(),
  })
  .partial();

const bankTransferInfoSchema = z
  .object({
    bankName: z.string(),
    accountType: z.string(),
    accountNumber: z.string(),
    holderName: z.string(),
    holderDocument: z.string(),
    email: z.email(),
    instructions: z.string(),
  })
  .partial();

export const updateStoreSettingsSchema = z
  .object({
    requireCustomerIdDocument: z.boolean(),
    taxLabel: z.string().max(40),
    taxRate: z.number().min(0).max(100),
    decimalSeparator: z.enum(DECIMAL_SEPARATORS),
    decimalPlaces: z.number().int().min(0).max(6),
    currencyCode: z.string().length(3),
    currencySymbol: z.string().min(1).max(8),
    countryMode: z.enum(COUNTRY_MODES),
    bankTransferInfo: bankTransferInfoSchema,
    countries: z.array(z.string().length(2)),
  })
  .partial();
