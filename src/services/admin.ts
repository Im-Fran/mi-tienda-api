import { and, eq, inArray } from "drizzle-orm";
import type { Database } from "../db";
import {
  rolePermissions,
  systemPermissions,
  systemRoles,
  userSystemRoles,
  users,
} from "../db/schema";
import { badRequest, notFound } from "../lib/errors";
import { getUserRoleNames } from "./permissions";

export async function listUsers(db: Database, page: number, perPage: number) {
  const total = await db.$count(users);
  const items = await db.query.users.findMany({
    limit: perPage,
    offset: (page - 1) * perPage,
    orderBy: (u, { desc }) => desc(u.createdAt),
  });
  return { items, total, page, perPage };
}

export async function getUserDetail(db: Database, id: string) {
  const user = await db.query.users.findFirst({ where: eq(users.id, id) });
  if (!user) throw notFound("User");
  const roles = await getUserRoleNames(db, id);
  return { ...user, roles };
}

export async function assignUserRoles(
  db: Database,
  userId: string,
  add: string[],
  remove: string[],
) {
  const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
  if (!user) throw notFound("User");

  if (add.length > 0) {
    const valid = await db
      .select({ id: systemRoles.id })
      .from(systemRoles)
      .where(inArray(systemRoles.id, add));
    const validIds = valid.map((r) => r.id);
    if (validIds.length > 0) {
      await db
        .insert(userSystemRoles)
        .values(validIds.map((roleId) => ({ userId, roleId })))
        .onConflictDoNothing();
    }
  }

  if (remove.length > 0) {
    await db
      .delete(userSystemRoles)
      .where(
        and(
          eq(userSystemRoles.userId, userId),
          inArray(userSystemRoles.roleId, remove),
        ),
      );
  }

  return getUserDetail(db, userId);
}

export function listRoles(db: Database) {
  return db.query.systemRoles.findMany({
    with: { permissions: { with: { permission: true } } },
  });
}

export function listPermissions(db: Database) {
  return db.query.systemPermissions.findMany({
    orderBy: (p, { asc }) => asc(p.name),
  });
}

export async function assignPermissionToRole(
  db: Database,
  roleId: string,
  permissionId: string,
) {
  const role = await db.query.systemRoles.findFirst({
    where: eq(systemRoles.id, roleId),
  });
  if (!role) throw notFound("Role");
  const permission = await db.query.systemPermissions.findFirst({
    where: eq(systemPermissions.id, permissionId),
  });
  if (!permission) throw badRequest("Permission not found");

  await db
    .insert(rolePermissions)
    .values({ roleId, permissionId })
    .onConflictDoNothing();
  return listRoles(db).then((roles) => roles.find((r) => r.id === roleId));
}

export async function removePermissionFromRole(
  db: Database,
  roleId: string,
  permissionId: string,
) {
  const [row] = await db
    .delete(rolePermissions)
    .where(
      and(
        eq(rolePermissions.roleId, roleId),
        eq(rolePermissions.permissionId, permissionId),
      ),
    )
    .returning({ roleId: rolePermissions.roleId });
  if (!row) throw notFound("Role permission");
}
