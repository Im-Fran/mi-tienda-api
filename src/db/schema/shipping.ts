import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { id, timestamps } from "./common";
import { stores } from "./stores";

export const SHIPPING_METHOD_TYPES = ["store_pickup", "generic_delivery"] as const;

/** Shipping options per store. */
export const shippingMethods = sqliteTable(
  "shipping_methods",
  {
    id: id(),
    storeId: text("store_id")
      .notNull()
      .references(() => stores.id, { onDelete: "cascade" }),
    type: text("type", { enum: SHIPPING_METHOD_TYPES }).notNull(),
    name: text("name").notNull(),
    cost: integer("cost").notNull().default(0),
    maxDistanceKm: integer("max_distance_km"),
    estimatedDays: integer("estimated_days"),
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    ...timestamps(),
  },
  (t) => [index("shipping_methods_store_idx").on(t.storeId)],
);
