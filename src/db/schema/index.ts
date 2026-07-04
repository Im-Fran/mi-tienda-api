import { relations } from "drizzle-orm";
import { magicLinks } from "./auth";
import { cartItems, carts } from "./carts";
import { categories, productCategories } from "./categories";
import { couponCategories, couponProducts, coupons } from "./coupons";
import { customerAddresses, customers } from "./customers";
import { orderItems, orders } from "./orders";
import { paymentMethods } from "./payments";
import {
  productImages,
  productVariantOptions,
  productVariants,
  products,
} from "./products";
import { shippingMethods } from "./shipping";
import { storeCountries, storeSettings, stores } from "./stores";
import {
  permissions,
  rolePermissions,
  roles,
  userPermissions,
  userRoles,
  users,
} from "./users";

// ---- Re-export every table + enum const ----
export * from "./common";
export * from "./users";
export * from "./auth";
export * from "./stores";
export * from "./customers";
export * from "./products";
export * from "./categories";
export * from "./coupons";
export * from "./carts";
export * from "./orders";
export * from "./payments";
export * from "./shipping";

// ---- Relations (Drizzle query API) ----

export const usersRelations = relations(users, ({ many }) => ({
  stores: many(stores),
  roles: many(userRoles),
  permissions: many(userPermissions),
}));

export const rolesRelations = relations(roles, ({ many }) => ({
  permissions: many(rolePermissions),
  users: many(userRoles),
}));

// ponytail: permissions table is a catalogue only — no FK children, no relations needed
export const permissionsRelations = relations(permissions, () => ({}));

export const rolePermissionsRelations = relations(
  rolePermissions,
  ({ one }) => ({
    role: one(roles, {
      fields: [rolePermissions.roleId],
      references: [roles.id],
    }),
  }),
);

export const userRolesRelations = relations(userRoles, ({ one }) => ({
  user: one(users, {
    fields: [userRoles.userId],
    references: [users.id],
  }),
  role: one(roles, {
    fields: [userRoles.roleId],
    references: [roles.id],
  }),
}));

export const userPermissionsRelations = relations(userPermissions, ({ one }) => ({
  user: one(users, {
    fields: [userPermissions.userId],
    references: [users.id],
  }),
}));

export const storesRelations = relations(stores, ({ one, many }) => ({
  owner: one(users, { fields: [stores.userId], references: [users.id] }),
  settings: one(storeSettings, {
    fields: [stores.id],
    references: [storeSettings.storeId],
  }),
  countries: many(storeCountries),
  products: many(products),
  categories: many(categories),
  coupons: many(coupons),
  paymentMethods: many(paymentMethods),
  shippingMethods: many(shippingMethods),
  carts: many(carts),
  orders: many(orders),
}));

export const storeSettingsRelations = relations(storeSettings, ({ one }) => ({
  store: one(stores, {
    fields: [storeSettings.storeId],
    references: [stores.id],
  }),
}));

export const storeCountriesRelations = relations(storeCountries, ({ one }) => ({
  store: one(stores, {
    fields: [storeCountries.storeId],
    references: [stores.id],
  }),
}));

export const customersRelations = relations(customers, ({ many }) => ({
  addresses: many(customerAddresses),
  carts: many(carts),
  orders: many(orders),
}));

export const customerAddressesRelations = relations(
  customerAddresses,
  ({ one }) => ({
    customer: one(customers, {
      fields: [customerAddresses.customerId],
      references: [customers.id],
    }),
  }),
);

export const productsRelations = relations(products, ({ one, many }) => ({
  store: one(stores, { fields: [products.storeId], references: [stores.id] }),
  images: many(productImages),
  variants: many(productVariants),
  categories: many(productCategories),
}));

export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, {
    fields: [productImages.productId],
    references: [products.id],
  }),
}));

export const productVariantsRelations = relations(
  productVariants,
  ({ one, many }) => ({
    product: one(products, {
      fields: [productVariants.productId],
      references: [products.id],
    }),
    options: many(productVariantOptions),
  }),
);

export const productVariantOptionsRelations = relations(
  productVariantOptions,
  ({ one }) => ({
    variant: one(productVariants, {
      fields: [productVariantOptions.variantId],
      references: [productVariants.id],
    }),
  }),
);

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  store: one(stores, { fields: [categories.storeId], references: [stores.id] }),
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
    relationName: "category_parent",
  }),
  children: many(categories, { relationName: "category_parent" }),
  products: many(productCategories),
}));

export const productCategoriesRelations = relations(
  productCategories,
  ({ one }) => ({
    product: one(products, {
      fields: [productCategories.productId],
      references: [products.id],
    }),
    category: one(categories, {
      fields: [productCategories.categoryId],
      references: [categories.id],
    }),
  }),
);

export const couponsRelations = relations(coupons, ({ one, many }) => ({
  store: one(stores, { fields: [coupons.storeId], references: [stores.id] }),
  products: many(couponProducts),
  categories: many(couponCategories),
}));

export const couponProductsRelations = relations(couponProducts, ({ one }) => ({
  coupon: one(coupons, {
    fields: [couponProducts.couponId],
    references: [coupons.id],
  }),
  product: one(products, {
    fields: [couponProducts.productId],
    references: [products.id],
  }),
}));

export const couponCategoriesRelations = relations(
  couponCategories,
  ({ one }) => ({
    coupon: one(coupons, {
      fields: [couponCategories.couponId],
      references: [coupons.id],
    }),
    category: one(categories, {
      fields: [couponCategories.categoryId],
      references: [categories.id],
    }),
  }),
);

export const cartsRelations = relations(carts, ({ one, many }) => ({
  store: one(stores, { fields: [carts.storeId], references: [stores.id] }),
  customer: one(customers, {
    fields: [carts.customerId],
    references: [customers.id],
  }),
  coupon: one(coupons, { fields: [carts.couponId], references: [coupons.id] }),
  items: many(cartItems),
}));

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  cart: one(carts, { fields: [cartItems.cartId], references: [carts.id] }),
  variant: one(productVariants, {
    fields: [cartItems.variantId],
    references: [productVariants.id],
  }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  store: one(stores, { fields: [orders.storeId], references: [stores.id] }),
  customer: one(customers, {
    fields: [orders.customerId],
    references: [customers.id],
  }),
  paymentMethod: one(paymentMethods, {
    fields: [orders.paymentMethodId],
    references: [paymentMethods.id],
  }),
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  variant: one(productVariants, {
    fields: [orderItems.variantId],
    references: [productVariants.id],
  }),
}));

export const paymentMethodsRelations = relations(paymentMethods, ({ one }) => ({
  store: one(stores, {
    fields: [paymentMethods.storeId],
    references: [stores.id],
  }),
}));

export const shippingMethodsRelations = relations(
  shippingMethods,
  ({ one }) => ({
    store: one(stores, {
      fields: [shippingMethods.storeId],
      references: [stores.id],
    }),
  }),
);
