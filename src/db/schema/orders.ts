import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import {
  type AddressSnapshot,
  type GuestSnapshot,
  type ProductSnapshot,
  id,
  timestamps,
} from "./common";
import { carts } from "./carts";
import { customerAddresses, customers } from "./customers";
import { paymentMethods } from "./payments";
import { productVariants } from "./products";
import { stores } from "./stores";

export const DOCUMENT_TYPES = ["receipt", "invoice"] as const;
export const ORDER_STATUSES = [
  "pending_payment",
  "paid",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
] as const;

/** Orders generated from a completed cart. Snapshots preserve point-in-time data. */
export const orders = sqliteTable(
  "orders",
  {
    id: id(),
    storeId: text("store_id")
      .notNull()
      .references(() => stores.id, { onDelete: "cascade" }),
    cartId: text("cart_id").references(() => carts.id, { onDelete: "set null" }),
    customerId: text("customer_id").references(() => customers.id, {
      onDelete: "set null",
    }),
    guestSnapshot: text("guest_snapshot", {
      mode: "json",
    }).$type<GuestSnapshot>(),
    billingAddressId: text("billing_address_id").references(
      () => customerAddresses.id,
      { onDelete: "set null" },
    ),
    billingSnapshot: text("billing_snapshot", {
      mode: "json",
    }).$type<AddressSnapshot>(),
    shippingAddressId: text("shipping_address_id").references(
      () => customerAddresses.id,
      { onDelete: "set null" },
    ),
    shippingSnapshot: text("shipping_snapshot", {
      mode: "json",
    }).$type<AddressSnapshot>(),
    documentType: text("document_type", { enum: DOCUMENT_TYPES })
      .notNull()
      .default("receipt"),
    subtotal: integer("subtotal").notNull().default(0),
    discountAmount: integer("discount_amount").notNull().default(0),
    taxAmount: integer("tax_amount").notNull().default(0),
    shippingAmount: integer("shipping_amount").notNull().default(0),
    total: integer("total").notNull().default(0),
    currencyCode: text("currency_code").notNull().default("USD"),
    status: text("status", { enum: ORDER_STATUSES })
      .notNull()
      .default("pending_payment"),
    paymentMethodId: text("payment_method_id").references(
      () => paymentMethods.id,
      { onDelete: "set null" },
    ),
    paymentReference: text("payment_reference"),
    notes: text("notes"),
    ...timestamps(),
  },
  (t) => [
    index("orders_store_idx").on(t.storeId),
    index("orders_customer_idx").on(t.customerId),
    index("orders_status_idx").on(t.status),
  ],
);

/** Line items of an order with a product/variant snapshot. */
export const orderItems = sqliteTable(
  "order_items",
  {
    id: id(),
    orderId: text("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    variantId: text("variant_id").references(() => productVariants.id, {
      onDelete: "set null",
    }),
    productSnapshot: text("product_snapshot", { mode: "json" })
      .$type<ProductSnapshot>()
      .notNull(),
    quantity: integer("quantity").notNull(),
    unitPrice: integer("unit_price").notNull(),
    totalPrice: integer("total_price").notNull(),
  },
  (t) => [index("order_items_order_idx").on(t.orderId)],
);
