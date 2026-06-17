import { createMiddleware } from "hono/factory";
import { createDb } from "../db";
import type { AppEnv } from "../types";

/** Build a request-scoped Drizzle client and expose it as `c.var.db`. */
export const dbMiddleware = createMiddleware<AppEnv>(async (c, next) => {
  c.set("db", createDb(c.env.DB));
  await next();
});
