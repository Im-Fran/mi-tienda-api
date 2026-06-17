import { createMiddleware } from "hono/factory";
import { forbidden, unauthorized } from "../lib/errors";
import { userHasPermission } from "../services/permissions";
import type { AppEnv } from "../types";

/** Guard a route behind a system permission (e.g. `permissionMiddleware("store.delete")`). */
export function permissionMiddleware(permission: string) {
  return createMiddleware<AppEnv>(async (c, next) => {
    const user = c.get("user");
    if (!user) throw unauthorized();
    const allowed = await userHasPermission(c.var.db, user.id, permission);
    if (!allowed) throw forbidden(`Missing permission: ${permission}`);
    await next();
  });
}
