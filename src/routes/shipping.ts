import { Hono } from "hono";
import { success } from "../lib/jsend";
import { parseJson, parseParams } from "../lib/validation";
import { authMiddleware } from "../middleware/auth";
import { storeContextMiddleware } from "../middleware/store-context";
import * as svc from "../services/shipping";
import type { AppEnv } from "../types";
import { idParamSchema } from "../validators/common";
import {
  createShippingMethodSchema,
  updateShippingMethodSchema,
} from "../validators/shipping";

export const shippingRouter = new Hono<AppEnv>();
shippingRouter.use(authMiddleware, storeContextMiddleware);

shippingRouter.get("/methods", async (c) =>
  c.json(success(await svc.listShippingMethods(c.var.db, c.var.store.id))),
);

shippingRouter.post("/methods", async (c) => {
  const input = await parseJson(c, createShippingMethodSchema);
  const method = await svc.createShippingMethod(c.var.db, c.var.store.id, input);
  return c.json(success({ method }), 201);
});

shippingRouter.patch("/methods/:id", async (c) => {
  const { id } = parseParams(c, idParamSchema);
  const input = await parseJson(c, updateShippingMethodSchema);
  const method = await svc.updateShippingMethod(
    c.var.db,
    c.var.store.id,
    id,
    input,
  );
  return c.json(success({ method }));
});

shippingRouter.delete("/methods/:id", async (c) => {
  const { id } = parseParams(c, idParamSchema);
  await svc.deleteShippingMethod(c.var.db, c.var.store.id, id);
  return c.json(success({ deleted: true }));
});
