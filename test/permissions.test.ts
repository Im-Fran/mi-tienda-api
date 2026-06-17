import { describe, expect, it } from "vitest";
import {
  rolePermissions,
  systemPermissions,
  systemRoles,
  userSystemRoles,
} from "../src/db/schema";
import { api, authUser, db } from "./helpers";

async function grantRole(
  userId: string,
  roleName: "Administrator" | "UserAdministrator" | "StoreAdministrator",
  permissionName?: string,
) {
  const [role] = await db()
    .insert(systemRoles)
    .values({ name: roleName })
    .returning();
  if (permissionName) {
    const [perm] = await db()
      .insert(systemPermissions)
      .values({ name: permissionName, description: permissionName })
      .returning();
    await db()
      .insert(rolePermissions)
      .values({ roleId: role.id, permissionId: perm.id });
  }
  await db().insert(userSystemRoles).values({ userId, roleId: role.id });
}

describe("permission middleware", () => {
  it("rejects a user with no roles", async () => {
    const { token } = await authUser();
    const res = await api("/api/admin/users", { token });
    expect(res.status).toBe(403);
  });

  it("allows an Administrator (bypass)", async () => {
    const { user, token } = await authUser();
    await grantRole(user.id, "Administrator");
    const res = await api("/api/admin/users", { token });
    expect(res.status).toBe(200);
  });

  it("allows a role that holds the exact permission", async () => {
    const { user, token } = await authUser();
    await grantRole(user.id, "StoreAdministrator", "user.view");
    const res = await api("/api/admin/users", { token });
    expect(res.status).toBe(200);
  });

  it("rejects a role missing the required permission", async () => {
    const { user, token } = await authUser();
    await grantRole(user.id, "UserAdministrator", "stats.view");
    const res = await api("/api/admin/users", { token });
    expect(res.status).toBe(403);
  });
});
