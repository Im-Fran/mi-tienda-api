import { Hono } from "hono";
import { success } from "../lib/jsend";
import { parseQuery } from "../lib/validation";
import { authMiddleware } from "../middleware/auth";
import { storeContextMiddleware } from "../middleware/store-context";
import * as svc from "../services/stats";
import type { AppEnv } from "../types";
import {
  revenueOverTimeSchema,
  statsRangeSchema,
  topProductsSchema,
} from "../validators/stats";

export const statsRouter = new Hono<AppEnv>();
statsRouter.use(authMiddleware, storeContextMiddleware);

statsRouter.get("/summary", async (c) => {
  const { from, to } = parseQuery(c, statsRangeSchema);
  return c.json(success(await svc.summary(c.var.db, c.var.store.id, from, to)));
});

statsRouter.get("/top-products", async (c) => {
  const { from, to, limit } = parseQuery(c, topProductsSchema);
  return c.json(
    success(await svc.topProducts(c.var.db, c.var.store.id, limit, from, to)),
  );
});

statsRouter.get("/orders-by-status", async (c) => {
  const { from, to } = parseQuery(c, statsRangeSchema);
  return c.json(
    success(await svc.ordersByStatus(c.var.db, c.var.store.id, from, to)),
  );
});

statsRouter.get("/revenue-over-time", async (c) => {
  const { from, to, interval } = parseQuery(c, revenueOverTimeSchema);
  return c.json(
    success(
      await svc.revenueOverTime(c.var.db, c.var.store.id, interval, from, to),
    ),
  );
});
