import { z } from "zod";
import { PRODUCT_TYPES } from "../db/schema";

export const variantOptionSchema = z.object({
  optionName: z.string().min(1).max(60),
  optionValue: z.string().min(1).max(120),
});

export const variantInputSchema = z.object({
  name: z.string().min(1).max(120),
  sku: z.string().max(80).nullish(),
  price: z.number().int().min(0),
  compareAtPrice: z.number().int().min(0).nullish(),
  stock: z.number().int().min(0).default(0),
  weight: z.number().int().min(0).nullish(),
  digitalFileR2Key: z.string().nullish(),
  options: z.array(variantOptionSchema).default([]),
});

export const createProductSchema = z.object({
  name: z.string().min(1).max(200),
  shortDescription: z.string().max(300).nullish(),
  fullDescription: z.string().nullish(),
  type: z.enum(PRODUCT_TYPES).default("physical"),
  isActive: z.boolean().default(true),
  categoryIds: z.array(z.string().min(1)).default([]),
  variants: z.array(variantInputSchema).default([]),
});

export const updateProductSchema = z
  .object({
    name: z.string().min(1).max(200),
    shortDescription: z.string().max(300).nullish(),
    fullDescription: z.string().nullish(),
    type: z.enum(PRODUCT_TYPES),
    isActive: z.boolean(),
    categoryIds: z.array(z.string().min(1)),
  })
  .partial();

export const productFiltersSchema = z.object({
  category: z.string().optional(),
  type: z.enum(PRODUCT_TYPES).optional(),
  active: z
    .enum(["true", "false"])
    .transform((v) => v === "true")
    .optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(100).default(20),
});

export const createVariantSchema = variantInputSchema;
export const updateVariantSchema = variantInputSchema.partial();
