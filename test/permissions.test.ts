import { describe, expect, it } from "vitest";
import {
  rolePermissions,
  roles,
  userPermissions,
  userRoles,
} from "../src/db/schema";
import { matchesPattern } from "../src/lib/permissions";
import { api, authUser, db } from "./helpers";

// ---- Helpers ----

async function grantRoleWithPattern(userId: string, roleName: string, pattern: string) {
  const [role] = await db().insert(roles).values({ name: roleName }).returning();
  await db().insert(rolePermissions).values({ roleId: role.id, permission: pattern });
  await db().insert(userRoles).values({ userId, roleId: role.id });
  return role;
}

async function grantDirectPermission(userId: string, pattern: string) {
  await db().insert(userPermissions).values({ userId, permission: pattern });
}

// ---- Unit tests: matchesPattern ----

describe("matchesPattern", () => {
  it('"*" matches everything', () => {
    expect(matchesPattern("*", "store.abc.view")).toBe(true);
    expect(matchesPattern("*", "anything")).toBe(true);
  });

  it('"store.*.view" matches "store.abc.view"', () => {
    expect(matchesPattern("store.*.view", "store.abc.view")).toBe(true);
  });

  it('"store.*.view" does NOT match "store.abc.delete"', () => {
    expect(matchesPattern("store.*.view", "store.abc.delete")).toBe(false);
  });

  it('"store.*.view" does NOT match "store.abc.view.extra" (different depth)', () => {
    expect(matchesPattern("store.*.view", "store.abc.view.extra")).toBe(false);
  });

  it('"store.abc.view" matches "store.abc.view" exactly', () => {
    expect(matchesPattern("store.abc.view", "store.abc.view")).toBe(true);
  });

  it('"store.*.products.*" matches "store.abc.products.create"', () => {
    expect(matchesPattern("store.*.products.*", "store.abc.products.create")).toBe(true);
  });

  it('"system.users.*" matches "system.users.list"', () => {
    expect(matchesPattern("system.users.*", "system.users.list")).toBe(true);
  });

  it('"system.users.*" does NOT match "system.users.roles.view" (depth)', () => {
    expect(matchesPattern("system.users.*", "system.users.roles.view")).toBe(false);
  });
});

// ---- Integration tests: permissionMiddleware via HTTP ----

describe("permission middleware", () => {
  it("returns 403 for user with no roles or permissions", async () => {
    const { token } = await authUser();
    const res = await api("/api/admin/users", { token });
    expect(res.status).toBe(403);
  });

  it('returns 200 for user with role pattern "*" (superadmin)', async () => {
    const { user, token } = await authUser();
    await grantRoleWithPattern(user.id, `superadmin-${crypto.randomUUID()}`, "*");
    const res = await api("/api/admin/users", { token });
    expect(res.status).toBe(200);
  });

  it('returns 200 for user with exact permission "system.users.list"', async () => {
    const { user, token } = await authUser();
    await grantRoleWithPattern(user.id, `role-exact-${crypto.randomUUID()}`, "system.users.list");
    const res = await api("/api/admin/users", { token });
    expect(res.status).toBe(200);
  });

  it('returns 200 for user with wildcard pattern "system.users.*"', async () => {
    const { user, token } = await authUser();
    await grantRoleWithPattern(user.id, `role-wild-${crypto.randomUUID()}`, "system.users.*");
    const res = await api("/api/admin/users", { token });
    expect(res.status).toBe(200);
  });

  it('returns 403 for user with "system.roles.*" but requesting system.users.list', async () => {
    const { user, token } = await authUser();
    await grantRoleWithPattern(user.id, `role-wrong-${crypto.randomUUID()}`, "system.roles.*");
    const res = await api("/api/admin/users", { token });
    expect(res.status).toBe(403);
  });

  it('returns 200 for user with direct permission "system.users.list" (no role)', async () => {
    const { user, token } = await authUser();
    await grantDirectPermission(user.id, "system.users.list");
    const res = await api("/api/admin/users", { token });
    expect(res.status).toBe(200);
  });

  it("returns 403 when user_roles.expires_at is in the past", async () => {
    const { user, token } = await authUser();
    const [role] = await db()
      .insert(roles)
      .values({ name: `role-exp-ur-${crypto.randomUUID()}` })
      .returning();
    await db().insert(rolePermissions).values({ roleId: role.id, permission: "system.users.list" });
    await db().insert(userRoles).values({
      userId: user.id,
      roleId: role.id,
      expiresAt: new Date(Date.now() - 1000),
    });
    const res = await api("/api/admin/users", { token });
    expect(res.status).toBe(403);
  });

  it("returns 403 when role_permissions.expires_at is in the past (user_role not expired)", async () => {
    const { user, token } = await authUser();
    const [role] = await db()
      .insert(roles)
      .values({ name: `role-exp-rp-${crypto.randomUUID()}` })
      .returning();
    await db().insert(rolePermissions).values({
      roleId: role.id,
      permission: "system.users.list",
      expiresAt: new Date(Date.now() - 1000),
    });
    await db().insert(userRoles).values({ userId: user.id, roleId: role.id });
    const res = await api("/api/admin/users", { token });
    expect(res.status).toBe(403);
  });

  it("returns 200 when expires_at is in the future (not yet expired)", async () => {
    const { user, token } = await authUser();
    const [role] = await db()
      .insert(roles)
      .values({ name: `role-future-${crypto.randomUUID()}` })
      .returning();
    await db().insert(rolePermissions).values({ roleId: role.id, permission: "system.users.list" });
    await db().insert(userRoles).values({
      userId: user.id,
      roleId: role.id,
      expiresAt: new Date(Date.now() + 86400000),
    });
    const res = await api("/api/admin/users", { token });
    expect(res.status).toBe(200);
  });
});

// ---- Integration tests: admin routes ----

describe("admin routes", () => {
  async function superUser() {
    const { user, token } = await authUser();
    await grantRoleWithPattern(user.id, `admin-${crypto.randomUUID()}`, "*");
    return { user, token };
  }

  it("POST /api/admin/roles creates a role (system.roles.create)", async () => {
    const { user, token } = await authUser();
    await grantRoleWithPattern(user.id, `creator-${crypto.randomUUID()}`, "system.roles.create");
    const res = await api("/api/admin/roles", {
      method: "POST",
      token,
      body: { name: `test-role-${crypto.randomUUID()}`, description: "Test" },
    });
    expect(res.status).toBe(201);
    expect(res.json.data).toMatchObject({ name: expect.any(String) });
  });

  it("GET /api/admin/roles lists roles (system.roles.view)", async () => {
    const { user, token } = await authUser();
    await grantRoleWithPattern(user.id, `viewer-${crypto.randomUUID()}`, "system.roles.view");
    const res = await api("/api/admin/roles", { token });
    expect(res.status).toBe(200);
    expect(Array.isArray(res.json.data)).toBe(true);
  });

  it("POST /api/admin/roles/:id/permissions assigns a pattern to a role", async () => {
    const { token } = await superUser();
    // create the role first
    const createRes = await api("/api/admin/roles", {
      method: "POST",
      token,
      body: { name: `perm-target-${crypto.randomUUID()}` },
    });
    expect(createRes.status).toBe(201);
    const roleId = createRes.json.data.id;

    const res = await api(`/api/admin/roles/${roleId}/permissions`, {
      method: "POST",
      token,
      body: { permission: "store.*.view" },
    });
    expect(res.status).toBe(201);
    expect(res.json.data).toMatchObject({ permission: "store.*.view" });
  });

  it("POST /api/admin/users/:id/roles assigns a role to a user", async () => {
    const { user: target } = await authUser();
    const { token } = await superUser();

    const createRes = await api("/api/admin/roles", {
      method: "POST",
      token,
      body: { name: `assignable-${crypto.randomUUID()}` },
    });
    expect(createRes.status).toBe(201);
    const roleId = createRes.json.data.id;

    const res = await api(`/api/admin/users/${target.id}/roles`, {
      method: "POST",
      token,
      body: { roleId },
    });
    expect(res.status).toBe(201);
    expect(res.json.data).toMatchObject({ roleId });
  });

  it("POST /api/admin/users/:id/permissions assigns a direct permission to a user", async () => {
    const { user: target } = await authUser();
    const { token } = await superUser();

    const res = await api(`/api/admin/users/${target.id}/permissions`, {
      method: "POST",
      token,
      body: { permission: "store.abc.view" },
    });
    expect(res.status).toBe(201);
    expect(res.json.data).toMatchObject({ permission: "store.abc.view" });
  });

  it("DELETE /api/admin/users/:id/permissions/:permId removes a direct permission", async () => {
    const { user: target } = await authUser();
    const { token } = await superUser();

    const createRes = await api(`/api/admin/users/${target.id}/permissions`, {
      method: "POST",
      token,
      body: { permission: "store.abc.delete" },
    });
    expect(createRes.status).toBe(201);
    const permId = createRes.json.data.id;

    const res = await api(`/api/admin/users/${target.id}/permissions/${permId}`, {
      method: "DELETE",
      token,
    });
    expect(res.status).toBe(200);
    expect(res.json.data).toMatchObject({ removed: true });
  });
});
