import type { Context } from "hono";
import { createMiddleware } from "hono/factory";
import { forbidden, unauthorized } from "../lib/errors";
import { userHasPermission } from "../services/permissions";
import type { AppEnv } from "../types";

type PermissionArg = string | ((c: Context<AppEnv>) => string);

/** Guard a route behind a permission pattern.
 *  Accepts a static string or a function that receives the context (for dynamic params).
 *  Examples:
 *    permissionMiddleware("store.create")
 *    permissionMiddleware(c => `store.${c.req.param("storeId")}.view`)
 */
export function permissionMiddleware(permission: PermissionArg) {
  return createMiddleware<AppEnv>(async (c, next) => {
    const user = c.get("user");
    if (!user) throw unauthorized();
    const perm = typeof permission === "function" ? permission(c) : permission;
    const allowed = await userHasPermission(c.var.db, user.id, perm);
    if (!allowed) throw forbidden(`Missing permission: ${perm}`);
    await next();
  });
}
