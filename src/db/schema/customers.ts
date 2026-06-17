import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { id, timestamps } from "./common";

export const CUSTOMER_PROVIDERS = [
  "google",
  "github",
  "email",
  "guest",
] as const;

/** Global customer base shared across all stores. */
export const customers = sqliteTable("customers", {
  id: id(),
  email: text("email").notNull().unique(),
  name: text("name"),
  avatarUrl: text("avatar_url"),
  provider: text("provider", { enum: CUSTOMER_PROVIDERS }).notNull(),
  providerId: text("provider_id"),
  emailVerified: integer("email_verified", { mode: "boolean" })
    .notNull()
    .default(false),
  phone: text("phone"),
  idDocument: text("id_document"),
  ...timestamps(),
});

/** Shipping/billing addresses per customer. */
export const customerAddresses = sqliteTable(
  "customer_addresses",
  {
    id: id(),
    customerId: text("customer_id")
      .notNull()
      .references(() => customers.id, { onDelete: "cascade" }),
    label: text("label"),
    addressLine1: text("address_line1").notNull(),
    addressLine2: text("address_line2"),
    city: text("city").notNull(),
    state: text("state"),
    countryCode: text("country_code").notNull(),
    postalCode: text("postal_code"),
    isDefault: integer("is_default", { mode: "boolean" })
      .notNull()
      .default(false),
  },
  (t) => [index("customer_addresses_customer_idx").on(t.customerId)],
);
