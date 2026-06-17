import { index, integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { id, timestamps } from "./common";

export const USER_PROVIDERS = ["google", "github", "email"] as const;
export const SYSTEM_ROLE_NAMES = [
  "Administrator",
  "UserAdministrator",
  "StoreAdministrator",
] as const;

/** Store owners. Authenticate via OAuth2 or Magic Link. */
export const users = sqliteTable(
  "users",
  {
    id: id(),
    email: text("email").notNull().unique(),
    name: text("name"),
    avatarUrl: text("avatar_url"),
    provider: text("provider", { enum: USER_PROVIDERS }).notNull(),
    providerId: text("provider_id"),
    emailVerified: integer("email_verified", { mode: "boolean" })
      .notNull()
      .default(false),
    ...timestamps(),
  },
  (t) => [index("users_provider_idx").on(t.provider, t.providerId)],
);

/** Platform-level admin roles. */
export const systemRoles = sqliteTable("system_roles", {
  id: id(),
  name: text("name", { enum: SYSTEM_ROLE_NAMES }).notNull().unique(),
});

/** Granular permissions in `{entity}.{action}` format. */
export const systemPermissions = sqliteTable("system_permissions", {
  id: id(),
  name: text("name").notNull().unique(),
  description: text("description"),
});

/** role <-> permission join. */
export const rolePermissions = sqliteTable(
  "role_permissions",
  {
    roleId: text("role_id")
      .notNull()
      .references(() => systemRoles.id, { onDelete: "cascade" }),
    permissionId: text("permission_id")
      .notNull()
      .references(() => systemPermissions.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.roleId, t.permissionId] })],
);

/** user <-> system role assignment. */
export const userSystemRoles = sqliteTable(
  "user_system_roles",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    roleId: text("role_id")
      .notNull()
      .references(() => systemRoles.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.userId, t.roleId] })],
);
