import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { id, timestamps } from "./common";
import { coupons } from "./coupons";
import { customers } from "./customers";
import { productVariants } from "./products";
import { stores } from "./stores";

export const CART_STATUSES = ["active", "abandoned", "completed"] as const;

/** Shopping carts (active, abandoned, completed). */
export const carts = sqliteTable(
  "carts",
  {
    id: id(),
    storeId: text("store_id")
      .notNull()
      .references(() => stores.id, { onDelete: "cascade" }),
    customerId: text("customer_id").references(() => customers.id, {
      onDelete: "set null",
    }),
    guestToken: text("guest_token"),
    status: text("status", { enum: CART_STATUSES }).notNull().default("active"),
    couponId: text("coupon_id").references(() => coupons.id, {
      onDelete: "set null",
    }),
    ...timestamps(),
  },
  (t) => [
    index("carts_store_idx").on(t.storeId),
    index("carts_customer_idx").on(t.customerId),
    index("carts_guest_token_idx").on(t.guestToken),
  ],
);

/** Line items inside a cart. `unitPrice` snapshots the variant price. */
export const cartItems = sqliteTable(
  "cart_items",
  {
    id: id(),
    cartId: text("cart_id")
      .notNull()
      .references(() => carts.id, { onDelete: "cascade" }),
    variantId: text("variant_id")
      .notNull()
      .references(() => productVariants.id, { onDelete: "cascade" }),
    quantity: integer("quantity").notNull().default(1),
    unitPrice: integer("unit_price").notNull(),
  },
  (t) => [index("cart_items_cart_idx").on(t.cartId)],
);
