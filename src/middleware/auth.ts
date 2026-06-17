import { eq } from "drizzle-orm";
import { createMiddleware } from "hono/factory";
import { users } from "../db/schema";
import { unauthorized } from "../lib/errors";
import { bearerToken, getUserSession } from "../lib/session";
import type { AppEnv } from "../types";

/** Validate a user Bearer session from KV_SESSIONS and inject `c.var.user`. */
export const authMiddleware = createMiddleware<AppEnv>(async (c, next) => {
  const token = bearerToken(c.req.header("authorization"));
  if (!token) throw unauthorized("Missing bearer token");

  const session = await getUserSession(c.env, token);
  if (!session) throw unauthorized("Invalid or expired session");

  const user = await c.var.db.query.users.findFirst({
    where: eq(users.id, session.userId),
  });
  if (!user) throw unauthorized("User no longer exists");

  c.set("user", user);
  await next();
});
