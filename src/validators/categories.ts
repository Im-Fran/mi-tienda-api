import { z } from "zod";
import { slugSchema } from "./common";

export const createCategorySchema = z.object({
  name: z.string().min(1).max(120),
  slug: slugSchema.optional(),
  description: z.string().nullish(),
  parentId: z.string().min(1).nullish(),
  sortOrder: z.number().int().default(0),
});

export const updateCategorySchema = z
  .object({
    name: z.string().min(1).max(120),
    slug: slugSchema,
    description: z.string().nullish(),
    parentId: z.string().min(1).nullish(),
    sortOrder: z.number().int(),
  })
  .partial();

export const deleteCategoryQuerySchema = z.object({
  recursive: z
    .enum(["true", "false"])
    .default("false")
    .transform((v) => v === "true"),
});
