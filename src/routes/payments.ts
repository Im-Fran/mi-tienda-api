import { Hono } from "hono";
import { success } from "../lib/jsend";
import { parseJson, parseParams } from "../lib/validation";
import { authMiddleware } from "../middleware/auth";
import { storeContextMiddleware } from "../middleware/store-context";
import * as svc from "../services/payments";
import type { AppEnv } from "../types";
import { idParamSchema } from "../validators/common";
import {
  createPaymentMethodSchema,
  updatePaymentMethodSchema,
} from "../validators/payments";

export const paymentsRouter = new Hono<AppEnv>();
paymentsRouter.use(authMiddleware, storeContextMiddleware);

paymentsRouter.get("/methods", async (c) => {
  const methods = await svc.listPaymentMethods(c.var.db, c.var.store.id);
  return c.json(success({ methods }));
});

paymentsRouter.post("/methods", async (c) => {
  const input = await parseJson(c, createPaymentMethodSchema);
  const method = await svc.createPaymentMethod(c.var.db, c.var.store.id, input);
  return c.json(success({ method }), 201);
});

paymentsRouter.patch("/methods/:id", async (c) => {
  const { id } = parseParams(c, idParamSchema);
  const input = await parseJson(c, updatePaymentMethodSchema);
  const method = await svc.updatePaymentMethod(
    c.var.db,
    c.var.store.id,
    id,
    input,
  );
  return c.json(success({ method }));
});

paymentsRouter.delete("/methods/:id", async (c) => {
  const { id } = parseParams(c, idParamSchema);
  await svc.deletePaymentMethod(c.var.db, c.var.store.id, id);
  return c.json(success({ deleted: true }));
});
