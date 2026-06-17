/**
 * Canonical system permissions and the default role -> permission grants.
 * Used by the DB seed and referenced by admin route guards.
 */

export const PERMISSIONS: { name: string; description: string }[] = [
  { name: "user.view", description: "View platform users" },
  { name: "user.update", description: "Update platform users" },
  { name: "user.delete", description: "Delete platform users" },
  { name: "user.manage_roles", description: "Assign or remove user roles" },
  { name: "store.view", description: "View any store" },
  { name: "store.update", description: "Update any store" },
  { name: "store.delete", description: "Delete any store" },
  { name: "product.manage", description: "Manage products of any store" },
  { name: "category.manage", description: "Manage categories of any store" },
  { name: "coupon.manage", description: "Manage coupons of any store" },
  { name: "order.view", description: "View orders of any store" },
  { name: "order.update", description: "Update orders of any store" },
  { name: "payment.manage", description: "Manage payment methods" },
  { name: "shipping.manage", description: "Manage shipping methods" },
  { name: "customer.view", description: "View store customers" },
  { name: "role.view", description: "View roles and their permissions" },
  { name: "role.manage_permissions", description: "Grant or revoke role permissions" },
  { name: "permission.view", description: "View available permissions" },
  { name: "stats.view", description: "View store statistics" },
];

export const ROLE_DEFINITIONS: Record<string, string[] | "*"> = {
  // Administrator implicitly bypasses every check, but we grant all anyway.
  Administrator: "*",
  UserAdministrator: [
    "user.view",
    "user.update",
    "user.delete",
    "user.manage_roles",
    "role.view",
    "permission.view",
  ],
  StoreAdministrator: [
    "store.view",
    "store.update",
    "store.delete",
    "product.manage",
    "category.manage",
    "coupon.manage",
    "order.view",
    "order.update",
    "payment.manage",
    "shipping.manage",
    "customer.view",
    "stats.view",
  ],
};
