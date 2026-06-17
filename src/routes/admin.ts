import { Hono } from "hono";
import { success } from "../lib/jsend";
import { parseJson, parseParams, parseQuery } from "../lib/validation";
import { authMiddleware } from "../middleware/auth";
import { permissionMiddleware } from "../middleware/permissions";
import * as admin from "../services/admin";
import type { AppEnv } from "../types";
import { assignPermissionSchema, assignRolesSchema } from "../validators/admin";
import { idParamSchema, paginationQuerySchema } from "../validators/common";

export const adminRouter = new Hono<AppEnv>();
adminRouter.use(authMiddleware);

adminRouter.get("/users", permissionMiddleware("user.view"), async (c) => {
  const { page, perPage } = parseQuery(c, paginationQuerySchema);
  return c.json(success(await admin.listUsers(c.var.db, page, perPage)));
});

adminRouter.get("/users/:id", permissionMiddleware("user.view"), async (c) => {
  const { id } = parseParams(c, idParamSchema);
  return c.json(success(await admin.getUserDetail(c.var.db, id)));
});

adminRouter.patch(
  "/users/:id/roles",
  permissionMiddleware("user.manage_roles"),
  async (c) => {
    const { id } = parseParams(c, idParamSchema);
    const { add, remove } = await parseJson(c, assignRolesSchema);
    return c.json(
      success(await admin.assignUserRoles(c.var.db, id, add, remove)),
    );
  },
);

adminRouter.get("/roles", permissionMiddleware("role.view"), async (c) =>
  c.json(success(await admin.listRoles(c.var.db))),
);

adminRouter.get(
  "/permissions",
  permissionMiddleware("permission.view"),
  async (c) => c.json(success(await admin.listPermissions(c.var.db))),
);

adminRouter.post(
  "/roles/:id/permissions",
  permissionMiddleware("role.manage_permissions"),
  async (c) => {
    const { id } = parseParams(c, idParamSchema);
    const { permissionId } = await parseJson(c, assignPermissionSchema);
    return c.json(
      success(await admin.assignPermissionToRole(c.var.db, id, permissionId)),
    );
  },
);

adminRouter.delete(
  "/roles/:id/permissions/:permId",
  permissionMiddleware("role.manage_permissions"),
  async (c) => {
    await admin.removePermissionFromRole(
      c.var.db,
      c.req.param("id"),
      c.req.param("permId"),
    );
    return c.json(success({ removed: true }));
  },
);
