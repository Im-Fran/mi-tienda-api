import { z } from "zod";
import { SHIPPING_METHOD_TYPES } from "../db/schema";

export const createShippingMethodSchema = z.object({
  type: z.enum(SHIPPING_METHOD_TYPES),
  name: z.string().min(1).max(120),
  cost: z.number().int().min(0).default(0),
  maxDistanceKm: z.number().int().min(0).nullish(),
  estimatedDays: z.number().int().min(0).nullish(),
  isActive: z.boolean().default(true),
});

export const updateShippingMethodSchema = createShippingMethodSchema.partial();
