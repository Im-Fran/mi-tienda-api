import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { stores, users } from "../db/schema";
import { success } from "../lib/jsend";
import { bearerToken, destroyUserSession } from "../lib/session";
import { parseJson } from "../lib/validation";
import { authMiddleware } from "../middleware/auth";
import { deleteStore } from "../services/stores";
import type { AppEnv } from "../types";
import { updateUserSchema } from "../validators/users";

export const usersRouter = new Hono<AppEnv>();
usersRouter.use(authMiddleware);

usersRouter.get("/me", (c) => c.json(success({ user: c.var.user })));

usersRouter.patch("/me", async (c) => {
  const input = await parseJson(c, updateUserSchema);
  const [updated] = await c.var.db
    .update(users)
    .set(input)
    .where(eq(users.id, c.var.user.id))
    .returning();
  return c.json(success({ user: updated }));
});

usersRouter.delete("/me", async (c) => {
  // Clean up R2 assets store-by-store before cascading the DB delete.
  const owned = await c.var.db.query.stores.findMany({
    where: eq(stores.userId, c.var.user.id),
  });
  for (const s of owned) await deleteStore(c.env, c.var.db, s.id);
  await c.var.db.delete(users).where(eq(users.id, c.var.user.id));

  const token = bearerToken(c.req.header("authorization"));
  if (token) await destroyUserSession(c.env, token);
  return c.json(success({ deleted: true }));
});
