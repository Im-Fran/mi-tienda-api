import { Hono } from "hono";
import { success } from "../lib/jsend";
import { parseParams, parseQuery } from "../lib/validation";
import { authMiddleware } from "../middleware/auth";
import { storeContextMiddleware } from "../middleware/store-context";
import * as svc from "../services/customers";
import type { AppEnv } from "../types";
import { idParamSchema, paginationQuerySchema } from "../validators/common";

export const storeCustomersRouter = new Hono<AppEnv>();
storeCustomersRouter.use(authMiddleware, storeContextMiddleware);

storeCustomersRouter.get("/", async (c) => {
  const { page, perPage } = parseQuery(c, paginationQuerySchema);
  return c.json(
    success(await svc.listStoreCustomers(c.var.db, c.var.store.id, page, perPage)),
  );
});

storeCustomersRouter.get("/:id", async (c) => {
  const { id } = parseParams(c, idParamSchema);
  return c.json(
    success(await svc.getStoreCustomer(c.var.db, c.var.store.id, id)),
  );
});
