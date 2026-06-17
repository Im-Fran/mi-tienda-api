import { z } from "zod";
import { DOCUMENT_TYPES } from "../db/schema";

export const createCartSchema = z
  .object({ customerId: z.string().min(1).optional() })
  .default({});

export const addCartItemSchema = z.object({
  variantId: z.string().min(1),
  quantity: z.number().int().min(1).default(1),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().min(1),
});

export const applyCouponSchema = z.object({ code: z.string().min(1) });

const guestAddressSchema = z.object({
  label: z.string().max(60).optional(),
  addressLine1: z.string().min(1).max(200),
  addressLine2: z.string().max(200).optional(),
  city: z.string().min(1).max(120),
  state: z.string().max(120).optional(),
  countryCode: z.string().length(2),
  postalCode: z.string().max(20).optional(),
});

export const checkoutSchema = z.object({
  guest: z
    .object({
      name: z.string().min(1).max(120),
      email: z.email(),
      phone: z.string().max(40).optional(),
      idDocument: z.string().max(40).optional(),
    })
    .optional(),
  documentType: z.enum(DOCUMENT_TYPES).default("receipt"),
  paymentMethodId: z.string().min(1),
  shippingMethodId: z.string().min(1).optional(),
  billingAddressId: z.string().min(1).optional(),
  shippingAddressId: z.string().min(1).optional(),
  billingAddress: guestAddressSchema.optional(),
  shippingAddress: guestAddressSchema.optional(),
  notes: z.string().max(1000).optional(),
});
export type CheckoutInput = z.infer<typeof checkoutSchema>;
