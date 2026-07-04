import { Hono } from "hono";
import { success } from "../lib/jsend";
import { parseJson, parseParams, parseQuery } from "../lib/validation";
import { authMiddleware } from "../middleware/auth";
import { permissionMiddleware } from "../middleware/permissions";
import * as admin from "../services/admin";
import type { AppEnv } from "../types";
import {
  assignRolePermissionSchema,
  assignUserPermissionSchema,
  assignUserRoleSchema,
  createRoleSchema,
  updateRoleSchema,
} from "../validators/admin";
import { idParamSchema, paginationQuerySchema } from "../validators/common";

export const adminRouter = new Hono<AppEnv>();
adminRouter.use(authMiddleware);

// --- Users ---

adminRouter.get("/users", permissionMiddleware("system.users.list"), async (c) => {
  const { page, perPage } = parseQuery(c, paginationQuerySchema);
  return c.json(success(await admin.listUsers(c.var.db, page, perPage)));
});

adminRouter.get("/users/:id", permissionMiddleware("system.users.view"), async (c) => {
  const { id } = parseParams(c, idParamSchema);
  return c.json(success(await admin.getUserDetail(c.var.db, id)));
});

// --- User role assignments ---

adminRouter.get("/users/:id/roles", permissionMiddleware("system.users.view"), async (c) => {
  const { id } = parseParams(c, idParamSchema);
  return c.json(success(await admin.listUserRoles(c.var.db, id)));
});

adminRouter.post(
  "/users/:id/roles",
  permissionMiddleware("system.users.manage-roles"),
  async (c) => {
    const { id } = parseParams(c, idParamSchema);
    const { roleId, expiresAt } = await parseJson(c, assignUserRoleSchema);
    return c.json(success(await admin.assignRoleToUser(c.var.db, id, roleId, expiresAt)), 201);
  },
);

adminRouter.delete(
  "/users/:id/roles/:roleId",
  permissionMiddleware("system.users.manage-roles"),
  async (c) => {
    await admin.removeRoleFromUser(c.var.db, c.req.param("id"), c.req.param("roleId"));
    return c.json(success({ removed: true }));
  },
);

// --- User permission assignments ---

adminRouter.get(
  "/users/:id/permissions",
  permissionMiddleware("system.users.view"),
  async (c) => {
    const { id } = parseParams(c, idParamSchema);
    return c.json(success(await admin.listUserPermissions(c.var.db, id)));
  },
);

adminRouter.post(
  "/users/:id/permissions",
  permissionMiddleware("system.users.manage-permissions"),
  async (c) => {
    const { id } = parseParams(c, idParamSchema);
    const { permission, expiresAt, priority } = await parseJson(c, assignUserPermissionSchema);
    return c.json(
      success(await admin.assignPermissionToUser(c.var.db, id, permission, expiresAt, priority)),
      201,
    );
  },
);

adminRouter.delete(
  "/users/:id/permissions/:permId",
  permissionMiddleware("system.users.manage-permissions"),
  async (c) => {
    await admin.removeUserPermission(c.var.db, c.req.param("id"), c.req.param("permId"));
    return c.json(success({ removed: true }));
  },
);

// --- Roles CRUD ---

adminRouter.get("/roles", permissionMiddleware("system.roles.view"), async (c) =>
  c.json(success(await admin.listRoles(c.var.db))),
);

adminRouter.post("/roles", permissionMiddleware("system.roles.create"), async (c) => {
  const { name, description } = await parseJson(c, createRoleSchema);
  return c.json(success(await admin.createRole(c.var.db, name, description)), 201);
});

adminRouter.patch("/roles/:id", permissionMiddleware("system.roles.update"), async (c) => {
  const { id } = parseParams(c, idParamSchema);
  const data = await parseJson(c, updateRoleSchema);
  return c.json(success(await admin.updateRole(c.var.db, id, data)));
});

adminRouter.delete("/roles/:id", permissionMiddleware("system.roles.delete"), async (c) => {
  const { id } = parseParams(c, idParamSchema);
  await admin.deleteRole(c.var.db, id);
  return c.json(success({ deleted: true }));
});

// --- Role permission assignments ---

adminRouter.get(
  "/roles/:id/permissions",
  permissionMiddleware("system.roles.view"),
  async (c) => {
    const { id } = parseParams(c, idParamSchema);
    return c.json(success(await admin.listRolePermissions(c.var.db, id)));
  },
);

adminRouter.post(
  "/roles/:id/permissions",
  permissionMiddleware("system.roles.manage-permissions"),
  async (c) => {
    const { id } = parseParams(c, idParamSchema);
    const { permission, expiresAt, priority } = await parseJson(c, assignRolePermissionSchema);
    return c.json(
      success(await admin.assignPermissionToRole(c.var.db, id, permission, expiresAt, priority)),
      201,
    );
  },
);

adminRouter.delete(
  "/roles/:id/permissions/:permId",
  permissionMiddleware("system.roles.manage-permissions"),
  async (c) => {
    await admin.removeRolePermission(c.var.db, c.req.param("id"), c.req.param("permId"));
    return c.json(success({ removed: true }));
  },
);

// --- Permission catalogue ---

adminRouter.get(
  "/permissions",
  permissionMiddleware("system.permissions.view"),
  async (c) => c.json(success(await admin.listPermissions(c.var.db))),
);
