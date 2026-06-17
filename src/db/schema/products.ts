import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { id, timestamps } from "./common";
import { stores } from "./stores";

export const PRODUCT_TYPES = ["physical", "digital"] as const;

/** Physical and digital products per store. */
export const products = sqliteTable(
  "products",
  {
    id: id(),
    storeId: text("store_id")
      .notNull()
      .references(() => stores.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    shortDescription: text("short_description"),
    fullDescription: text("full_description"), // Markdown
    type: text("type", { enum: PRODUCT_TYPES }).notNull().default("physical"),
    mainImageR2Key: text("main_image_r2_key"),
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    ...timestamps(),
  },
  (t) => [index("products_store_idx").on(t.storeId)],
);

/** Gallery images per product. */
export const productImages = sqliteTable(
  "product_images",
  {
    id: id(),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    r2Key: text("r2_key").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    isMain: integer("is_main", { mode: "boolean" }).notNull().default(false),
  },
  (t) => [index("product_images_product_idx").on(t.productId)],
);

/** Variants (size, color, ...) per product. Prices in minor units. */
export const productVariants = sqliteTable(
  "product_variants",
  {
    id: id(),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    sku: text("sku"),
    price: integer("price").notNull().default(0),
    compareAtPrice: integer("compare_at_price"),
    stock: integer("stock").notNull().default(0),
    weight: integer("weight"), // grams
    digitalFileR2Key: text("digital_file_r2_key"),
    ...timestamps(),
  },
  (t) => [index("product_variants_product_idx").on(t.productId)],
);

/** Option key-value pairs per variant (e.g. color: red). */
export const productVariantOptions = sqliteTable(
  "product_variant_options",
  {
    id: id(),
    variantId: text("variant_id")
      .notNull()
      .references(() => productVariants.id, { onDelete: "cascade" }),
    optionName: text("option_name").notNull(),
    optionValue: text("option_value").notNull(),
  },
  (t) => [index("product_variant_options_variant_idx").on(t.variantId)],
);
