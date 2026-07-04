import { index, integer, sqliteTable, text, unique } from "drizzle-orm/sqlite-core";
import { createdAt, id, timestamps } from "./common";

export const USER_PROVIDERS = ["google", "github", "email"] as const;

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

/** Dynamic platform-level roles (not enum-bound). */
export const roles = sqliteTable("roles", {
  id: id(),
  name: text("name").notNull().unique(),
  description: text("description"),
  createdAt: createdAt(),
});

/** Informational permission catalogue — not FK-targeted by grants. */
export const permissions = sqliteTable("permissions", {
  id: id(),
  name: text("name").notNull().unique(), // e.g. "store.*.view", "store.create"
  description: text("description"),
});

/** Permission patterns granted to a role (stored as text, not FK to permissions). */
export const rolePermissions = sqliteTable(
  "role_permissions",
  {
    id: id(),
    roleId: text("role_id")
      .notNull()
      .references(() => roles.id, { onDelete: "cascade" }),
    permission: text("permission").notNull(), // e.g. "*", "store.*.view"
    priority: integer("priority").notNull().default(0),
    expiresAt: integer("expires_at", { mode: "timestamp" }),
    grantedAt: integer("granted_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [
    unique().on(t.roleId, t.permission),
    index("role_permissions_role_idx").on(t.roleId),
  ],
);

/** Role assignments to users. */
export const userRoles = sqliteTable(
  "user_roles",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    roleId: text("role_id")
      .notNull()
      .references(() => roles.id, { onDelete: "cascade" }),
    expiresAt: integer("expires_at", { mode: "timestamp" }),
    grantedAt: integer("granted_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [
    unique().on(t.userId, t.roleId),
    index("user_roles_user_idx").on(t.userId),
  ],
);

/** Direct permission grants to users (bypass role). */
export const userPermissions = sqliteTable(
  "user_permissions",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    permission: text("permission").notNull(), // e.g. "store.abc123.view"
    priority: integer("priority").notNull().default(0),
    expiresAt: integer("expires_at", { mode: "timestamp" }),
    grantedAt: integer("granted_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [
    unique().on(t.userId, t.permission),
    index("user_permissions_user_idx").on(t.userId),
  ],
);
