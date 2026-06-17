import { z } from "zod";
import { PAYMENT_METHOD_TYPES } from "../db/schema";

export const createPaymentMethodSchema = z.object({
  type: z.enum(PAYMENT_METHOD_TYPES),
  providerName: z.string().max(120).nullish(),
  config: z.record(z.string(), z.unknown()).nullish(),
  isActive: z.boolean().default(true),
});

export const updatePaymentMethodSchema = createPaymentMethodSchema.partial();
