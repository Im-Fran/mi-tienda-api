import {
  index,
  integer,
  real,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { type BankTransferInfo, id, timestamps } from "./common";
import { users } from "./users";

export const DECIMAL_SEPARATORS = [".", ","] as const;
export const COUNTRY_MODES = ["inclusive", "exclusive"] as const;

/** A user can own up to 3 stores (enforced in the service layer). */
export const stores = sqliteTable(
  "stores",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    logoR2Key: text("logo_r2_key"),
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    ...timestamps(),
  },
  (t) => [index("stores_user_idx").on(t.userId)],
);

/** One-to-one settings per store. */
export const storeSettings = sqliteTable("store_settings", {
  storeId: text("store_id")
    .primaryKey()
    .references(() => stores.id, { onDelete: "cascade" }),
  requireCustomerIdDocument: integer("require_customer_id_document", {
    mode: "boolean",
  })
    .notNull()
    .default(false),
  taxLabel: text("tax_label").notNull().default("Tax"),
  taxRate: real("tax_rate").notNull().default(0),
  decimalSeparator: text("decimal_separator", { enum: DECIMAL_SEPARATORS })
    .notNull()
    .default("."),
  decimalPlaces: integer("decimal_places").notNull().default(2),
  currencyCode: text("currency_code").notNull().default("USD"),
  currencySymbol: text("currency_symbol").notNull().default("$"),
  countryMode: text("country_mode", { enum: COUNTRY_MODES })
    .notNull()
    .default("inclusive"),
  bankTransferInfo: text("bank_transfer_info", {
    mode: "json",
  }).$type<BankTransferInfo>(),
  ...timestamps(),
});

/** Countries configured per store (inclusive or exclusive list). */
export const storeCountries = sqliteTable(
  "store_countries",
  {
    id: id(),
    storeId: text("store_id")
      .notNull()
      .references(() => stores.id, { onDelete: "cascade" }),
    countryCode: text("country_code").notNull(),
  },
  (t) => [uniqueIndex("store_countries_unique").on(t.storeId, t.countryCode)],
);
