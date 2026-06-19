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
  const products = await svc.topProducts(c.var.db, c.var.store.id, limit, from, to);
  return c.json(success({ products }));
});

statsRouter.get("/orders-by-status", async (c) => {
  const { from, to } = parseQuery(c, statsRangeSchema);
  const data = await svc.ordersByStatus(c.var.db, c.var.store.id, from, to);
  return c.json(success({ data }));
});

statsRouter.get("/revenue-over-time", async (c) => {
  const { from, to, interval } = parseQuery(c, revenueOverTimeSchema);
  const data = await svc.revenueOverTime(c.var.db, c.var.store.id, interval, from, to);
  return c.json(success({ data }));
});
