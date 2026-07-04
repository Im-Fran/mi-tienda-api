import { and, eq, gt, isNull, or } from "drizzle-orm";
import type { Database } from "../db";
import { rolePermissions, roles, userPermissions, userRoles } from "../db/schema";
import { matchesPattern } from "../lib/permissions";

/** All active (non-expired) permission patterns for a user (from roles + direct). */
export async function getUserPatterns(db: Database, userId: string): Promise<string[]> {
  const now = new Date();

  const [directRows, roleRows] = await Promise.all([
    // Direct user permissions
    db.select({ permission: userPermissions.permission })
      .from(userPermissions)
      .where(and(
        eq(userPermissions.userId, userId),
        or(isNull(userPermissions.expiresAt), gt(userPermissions.expiresAt, now)),
      )),
    // Role permissions (via non-expired user_roles, and non-expired role_permissions)
    db.select({ permission: rolePermissions.permission })
      .from(userRoles)
      .innerJoin(rolePermissions, eq(rolePermissions.roleId, userRoles.roleId))
      .where(and(
        eq(userRoles.userId, userId),
        or(isNull(userRoles.expiresAt), gt(userRoles.expiresAt, now)),
        or(isNull(rolePermissions.expiresAt), gt(rolePermissions.expiresAt, now)),
      )),
  ]);

  return [
    ...directRows.map((r) => r.permission),
    ...roleRows.map((r) => r.permission),
  ];
}

/** True if the user has any active pattern matching the requested permission. */
export async function userHasPermission(db: Database, userId: string, permission: string): Promise<boolean> {
  const patterns = await getUserPatterns(db, userId);
  return patterns.some((p) => matchesPattern(p, permission));
}

/** All active role names for a user. */
export async function getUserRoleNames(db: Database, userId: string): Promise<string[]> {
  const now = new Date();
  const rows = await db
    .select({ name: roles.name })
    .from(userRoles)
    .innerJoin(roles, eq(roles.id, userRoles.roleId))
    .where(and(
      eq(userRoles.userId, userId),
      or(isNull(userRoles.expiresAt), gt(userRoles.expiresAt, now)),
    ));
  return rows.map((r) => r.name);
}
