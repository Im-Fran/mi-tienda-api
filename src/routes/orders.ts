import { Hono } from "hono";
import { success } from "../lib/jsend";
import { parseJson, parseParams, parseQuery } from "../lib/validation";
import { authMiddleware } from "../middleware/auth";
import { storeContextMiddleware } from "../middleware/store-context";
import * as svc from "../services/orders";
import type { AppEnv } from "../types";
import { idParamSchema } from "../validators/common";
import {
  orderFiltersSchema,
  updateOrderStatusSchema,
} from "../validators/orders";

export const ordersRouter = new Hono<AppEnv>();
ordersRouter.use(authMiddleware, storeContextMiddleware);

ordersRouter.get("/", async (c) => {
  const filters = parseQuery(c, orderFiltersSchema);
  return c.json(success(await svc.listOrders(c.var.db, c.var.store.id, filters)));
});

ordersRouter.get("/:id", async (c) => {
  const { id } = parseParams(c, idParamSchema);
  return c.json(
    success({ order: await svc.getOrder(c.var.db, c.var.store.id, id) }),
  );
});

ordersRouter.patch("/:id/status", async (c) => {
  const { id } = parseParams(c, idParamSchema);
  const input = await parseJson(c, updateOrderStatusSchema);
  const order = await svc.updateOrderStatus(c.var.db, c.var.store.id, id, input);
  return c.json(success({ order }));
});
