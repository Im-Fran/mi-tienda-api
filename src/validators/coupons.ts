import { z } from "zod";
import { COUPON_APPLIES_TO, COUPON_TYPES } from "../db/schema";

export const createCouponSchema = z
  .object({
    code: z.string().min(1).max(40),
    type: z.enum(COUPON_TYPES),
    value: z.number().int().min(0),
    appliesTo: z.enum(COUPON_APPLIES_TO).default("all"),
    occasion: z.string().nullish(),
    minOrderAmount: z.number().int().min(0).nullish(),
    maxUses: z.number().int().min(1).nullish(),
    startsAt: z.coerce.date().nullish(),
    expiresAt: z.coerce.date().nullish(),
    isActive: z.boolean().default(true),
    productIds: z.array(z.string().min(1)).default([]),
    categoryIds: z.array(z.string().min(1)).default([]),
  })
  .refine((v) => v.type !== "percentage" || v.value <= 100, {
    message: "Percentage value must be <= 100",
    path: ["value"],
  });

export const updateCouponSchema = z
  .object({
    code: z.string().min(1).max(40),
    type: z.enum(COUPON_TYPES),
    value: z.number().int().min(0),
    appliesTo: z.enum(COUPON_APPLIES_TO),
    occasion: z.string().nullish(),
    minOrderAmount: z.number().int().min(0).nullish(),
    maxUses: z.number().int().min(1).nullish(),
    startsAt: z.coerce.date().nullish(),
    expiresAt: z.coerce.date().nullish(),
    isActive: z.boolean(),
    productIds: z.array(z.string().min(1)),
    categoryIds: z.array(z.string().min(1)),
  })
  .partial();

export const validateCouponSchema = z.object({
  code: z.string().min(1),
  cartId: z.string().min(1).optional(),
  subtotal: z.number().int().min(0).optional(),
});
