import { and, eq, gt, isNull, or } from "drizzle-orm";
import type { Database } from "../db";
import {
  permissions,
  rolePermissions,
  roles,
  userPermissions,
  userRoles,
  users,
} from "../db/schema";
import { badRequest, notFound } from "../lib/errors";

// --- Users ---

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

  const [userRoleRows, userPermRows] = await Promise.all([
    db.select({ id: userRoles.id, roleId: userRoles.roleId, expiresAt: userRoles.expiresAt, grantedAt: userRoles.grantedAt })
      .from(userRoles)
      .where(eq(userRoles.userId, id)),
    db.select({ id: userPermissions.id, permission: userPermissions.permission, priority: userPermissions.priority, expiresAt: userPermissions.expiresAt, grantedAt: userPermissions.grantedAt })
      .from(userPermissions)
      .where(eq(userPermissions.userId, id)),
  ]);

  return { ...user, roles: userRoleRows, permissions: userPermRows };
}

// --- User role assignments ---

export async function listUserRoles(db: Database, userId: string) {
  const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
  if (!user) throw notFound("User");
  return db.select({ id: userRoles.id, roleId: userRoles.roleId, expiresAt: userRoles.expiresAt, grantedAt: userRoles.grantedAt })
    .from(userRoles)
    .where(eq(userRoles.userId, userId));
}

export async function assignRoleToUser(
  db: Database,
  userId: string,
  roleId: string,
  expiresAt?: Date,
) {
  const [user, role] = await Promise.all([
    db.query.users.findFirst({ where: eq(users.id, userId) }),
    db.query.roles.findFirst({ where: eq(roles.id, roleId) }),
  ]);
  if (!user) throw notFound("User");
  if (!role) throw notFound("Role");

  const [row] = await db.insert(userRoles).values({ userId, roleId, expiresAt }).returning();
  if (!row) throw badRequest("Role already assigned to this user");
  return row;
}

export async function removeRoleFromUser(
  db: Database,
  userId: string,
  userRoleId: string,
) {
  const [row] = await db
    .delete(userRoles)
    .where(and(eq(userRoles.id, userRoleId), eq(userRoles.userId, userId)))
    .returning({ id: userRoles.id });
  if (!row) throw notFound("User role assignment");
}

// --- User permission assignments ---

export async function listUserPermissions(db: Database, userId: string) {
  const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
  if (!user) throw notFound("User");
  return db.select()
    .from(userPermissions)
    .where(eq(userPermissions.userId, userId));
}

export async function assignPermissionToUser(
  db: Database,
  userId: string,
  permission: string,
  expiresAt?: Date,
  priority = 0,
) {
  const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
  if (!user) throw notFound("User");

  const [row] = await db.insert(userPermissions)
    .values({ userId, permission, priority, expiresAt })
    .returning();
  if (!row) throw badRequest(`Permission '${permission}' already assigned to this user`);
  return row;
}

export async function removeUserPermission(
  db: Database,
  userId: string,
  userPermissionId: string,
) {
  const [row] = await db
    .delete(userPermissions)
    .where(and(eq(userPermissions.id, userPermissionId), eq(userPermissions.userId, userId)))
    .returning({ id: userPermissions.id });
  if (!row) throw notFound("User permission assignment");
}

// --- Roles CRUD ---

export function listRoles(db: Database) {
  return db.query.roles.findMany({ orderBy: (r, { asc }) => asc(r.name) });
}

export async function createRole(db: Database, name: string, description?: string) {
  const [row] = await db.insert(roles).values({ name, description }).returning();
  return row;
}

export async function updateRole(
  db: Database,
  roleId: string,
  data: { name?: string; description?: string },
) {
  const [row] = await db
    .update(roles)
    .set(data)
    .where(eq(roles.id, roleId))
    .returning();
  if (!row) throw notFound("Role");
  return row;
}

export async function deleteRole(db: Database, roleId: string) {
  const [row] = await db
    .delete(roles)
    .where(eq(roles.id, roleId))
    .returning({ id: roles.id });
  if (!row) throw notFound("Role");
}

// --- Role permission assignments ---

export async function listRolePermissions(db: Database, roleId: string) {
  const role = await db.query.roles.findFirst({ where: eq(roles.id, roleId) });
  if (!role) throw notFound("Role");
  return db.select().from(rolePermissions).where(eq(rolePermissions.roleId, roleId));
}

export async function assignPermissionToRole(
  db: Database,
  roleId: string,
  permission: string,
  expiresAt?: Date,
  priority = 0,
) {
  const role = await db.query.roles.findFirst({ where: eq(roles.id, roleId) });
  if (!role) throw notFound("Role");

  const [row] = await db.insert(rolePermissions)
    .values({ roleId, permission, priority, expiresAt })
    .returning();
  if (!row) throw badRequest(`Permission '${permission}' already assigned to this role`);
  return row;
}

export async function removeRolePermission(
  db: Database,
  roleId: string,
  rolePermissionId: string,
) {
  const [row] = await db
    .delete(rolePermissions)
    .where(and(eq(rolePermissions.id, rolePermissionId), eq(rolePermissions.roleId, roleId)))
    .returning({ id: rolePermissions.id });
  if (!row) throw notFound("Role permission assignment");
}

// --- Permission catalogue ---

export function listPermissions(db: Database) {
  return db.query.permissions.findMany({ orderBy: (p, { asc }) => asc(p.name) });
}
