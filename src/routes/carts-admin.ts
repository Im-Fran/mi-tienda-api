import { Hono } from "hono";
import { z } from "zod";
import { CART_STATUSES } from "../db/schema";
import { success } from "../lib/jsend";
import { parseParams, parseQuery } from "../lib/validation";
import { authMiddleware } from "../middleware/auth";
import { storeContextMiddleware } from "../middleware/store-context";
import * as svc from "../services/carts";
import type { AppEnv } from "../types";
import { idParamSchema, paginationQuerySchema } from "../validators/common";

export const cartsAdminRouter = new Hono<AppEnv>();
cartsAdminRouter.use(authMiddleware, storeContextMiddleware);

const statusSchema = z.enum(CART_STATUSES).optional();

cartsAdminRouter.get("/", async (c) => {
  const { page, perPage } = parseQuery(c, paginationQuerySchema);
  const parsedStatus = statusSchema.safeParse(c.req.query("status"));
  const status = parsedStatus.success ? parsedStatus.data : undefined;
  return c.json(
    success(await svc.listCarts(c.var.db, c.var.store.id, status, page, perPage)),
  );
});

cartsAdminRouter.get("/:id", async (c) => {
  const { id } = parseParams(c, idParamSchema);
  return c.json(
    success({ cart: await svc.getCartAdmin(c.var.db, c.var.store.id, id) }),
  );
});
