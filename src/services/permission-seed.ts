/**
 * Canonical permission catalogue and default role definitions.
 * Used by the DB seed script.
 */

export const PERMISSIONS: { name: string; description: string }[] = [
  // System - users
  { name: "system.users.list",               description: "List platform users" },
  { name: "system.users.view",               description: "View a platform user" },
  { name: "system.users.update",             description: "Update a platform user" },
  { name: "system.users.delete",             description: "Delete a platform user" },
  { name: "system.users.manage-roles",       description: "Assign or remove roles from users" },
  { name: "system.users.manage-permissions", description: "Assign direct permissions to users" },
  // System - roles
  { name: "system.roles.view",               description: "View roles and their permissions" },
  { name: "system.roles.create",             description: "Create new roles" },
  { name: "system.roles.update",             description: "Update existing roles" },
  { name: "system.roles.delete",             description: "Delete roles" },
  { name: "system.roles.manage-permissions", description: "Grant or revoke permissions from roles" },
  // System - permissions
  { name: "system.permissions.view",         description: "View the permission catalogue" },
  // Stores (wildcard patterns in catalogue for documentation)
  { name: "store.create",                    description: "Create a new store" },
  { name: "store.*.view",                    description: "View any store" },
  { name: "store.*.update",                  description: "Update any store" },
  { name: "store.*.delete",                  description: "Delete any store" },
  { name: "store.*.products.*",              description: "Manage products of any store" },
  { name: "store.*.categories.*",            description: "Manage categories of any store" },
  { name: "store.*.coupons.*",               description: "Manage coupons of any store" },
  { name: "store.*.orders.view",             description: "View orders of any store" },
  { name: "store.*.orders.update",           description: "Update orders of any store" },
  { name: "store.*.customers.view",          description: "View customers of any store" },
  { name: "store.*.stats.view",              description: "View stats of any store" },
  { name: "dashboard.view",                  description: "View the dashboard" },
];

// Role definitions: role name → array of permission patterns to grant (strings, not IDs)
export const ROLE_DEFINITIONS: Record<string, string[]> = {
  "Super Admin": ["*"],
  "User Admin": [
    "system.users.list",
    "system.users.view",
    "system.users.update",
    "system.users.delete",
    "system.users.manage-roles",
    "system.users.manage-permissions",
    "system.roles.view",
    "system.permissions.view",
  ],
  "Store Admin": [
    "store.*.view",
    "store.*.update",
    "store.*.products.*",
    "store.*.categories.*",
    "store.*.coupons.*",
    "store.*.orders.view",
    "store.*.orders.update",
    "store.*.customers.view",
    "store.*.stats.view",
    "dashboard.view",
  ],
};
