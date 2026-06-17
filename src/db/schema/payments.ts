import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { id, timestamps } from "./common";
import { stores } from "./stores";

export const PAYMENT_METHOD_TYPES = [
  "in_person",
  "bank_transfer",
  "external",
] as const;

/** Payment providers configured per store. */
export const paymentMethods = sqliteTable(
  "payment_methods",
  {
    id: id(),
    storeId: text("store_id")
      .notNull()
      .references(() => stores.id, { onDelete: "cascade" }),
    type: text("type", { enum: PAYMENT_METHOD_TYPES }).notNull(),
    providerName: text("provider_name"),
    config: text("config", { mode: "json" }).$type<Record<string, unknown>>(),
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    ...timestamps(),
  },
  (t) => [index("payment_methods_store_idx").on(t.storeId)],
);
