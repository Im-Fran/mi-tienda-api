import {
  index,
  integer,
  primaryKey,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { categories } from "./categories";
import { id, timestamps } from "./common";
import { products } from "./products";
import { stores } from "./stores";

export const COUPON_TYPES = ["percentage", "fixed"] as const;
export const COUPON_APPLIES_TO = ["all", "products", "categories"] as const;

/** Discount rules per store. `code` is unique per store. */
export const coupons = sqliteTable(
  "coupons",
  {
    id: id(),
    storeId: text("store_id")
      .notNull()
      .references(() => stores.id, { onDelete: "cascade" }),
    code: text("code").notNull(),
    type: text("type", { enum: COUPON_TYPES }).notNull(),
    value: integer("value").notNull(),
    appliesTo: text("applies_to", { enum: COUPON_APPLIES_TO })
      .notNull()
      .default("all"),
    occasion: text("occasion"),
    minOrderAmount: integer("min_order_amount"),
    maxUses: integer("max_uses"),
    usedCount: integer("used_count").notNull().default(0),
    startsAt: integer("starts_at", { mode: "timestamp" }),
    expiresAt: integer("expires_at", { mode: "timestamp" }),
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    ...timestamps(),
  },
  (t) => [uniqueIndex("coupons_store_code_unique").on(t.storeId, t.code)],
);

/** coupon <-> product association. */
export const couponProducts = sqliteTable(
  "coupon_products",
  {
    couponId: text("coupon_id")
      .notNull()
      .references(() => coupons.id, { onDelete: "cascade" }),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.couponId, t.productId] })],
);

/** coupon <-> category association. */
export const couponCategories = sqliteTable(
  "coupon_categories",
  {
    couponId: text("coupon_id")
      .notNull()
      .references(() => coupons.id, { onDelete: "cascade" }),
    categoryId: text("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.couponId, t.categoryId] })],
);
