import { z } from "zod";
import { ORDER_STATUSES } from "../db/schema";

export const updateOrderStatusSchema = z.object({
  status: z.enum(ORDER_STATUSES),
  paymentReference: z.string().max(200).nullish(),
  notes: z.string().max(1000).nullish(),
});

export const orderFiltersSchema = z.object({
  status: z.enum(ORDER_STATUSES).optional(),
  customerId: z.string().min(1).optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(100).default(20),
});
