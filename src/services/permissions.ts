import { and, eq } from "drizzle-orm";
import type { Database } from "../db";
import {
  rolePermissions,
  systemPermissions,
  systemRoles,
  userSystemRoles,
} from "../db/schema";

/** All system role names assigned to a user. */
export async function getUserRoleNames(
  db: Database,
  userId: string,
): Promise<string[]> {
  const rows = await db
    .select({ name: systemRoles.name })
    .from(userSystemRoles)
    .innerJoin(systemRoles, eq(systemRoles.id, userSystemRoles.roleId))
    .where(eq(userSystemRoles.userId, userId));
  return rows.map((r) => r.name);
}

export async function isAdministrator(
  db: Database,
  userId: string,
): Promise<boolean> {
  return (await getUserRoleNames(db, userId)).includes("Administrator");
}

export async function userHasAnyRole(
  db: Database,
  userId: string,
  roleNames: readonly string[],
): Promise<boolean> {
  const roles = await getUserRoleNames(db, userId);
  return roles.some((r) => roleNames.includes(r));
}

/** True if the user has the given `{entity}.{action}` permission. Administrators bypass. */
export async function userHasPermission(
  db: Database,
  userId: string,
  permission: string,
): Promise<boolean> {
  if (await isAdministrator(db, userId)) return true;
  const rows = await db
    .select({ id: systemPermissions.id })
    .from(userSystemRoles)
    .innerJoin(
      rolePermissions,
      eq(rolePermissions.roleId, userSystemRoles.roleId),
    )
    .innerJoin(
      systemPermissions,
      eq(systemPermissions.id, rolePermissions.permissionId),
    )
    .where(
      and(
        eq(userSystemRoles.userId, userId),
        eq(systemPermissions.name, permission),
      ),
    )
    .limit(1);
  return rows.length > 0;
}
