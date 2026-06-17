import { Hono } from "hono";
import { success } from "../lib/jsend";
import { parseJson, parseParams } from "../lib/validation";
import { authMiddleware } from "../middleware/auth";
import { publicStoreContextMiddleware, storeContextMiddleware } from "../middleware/store-context";
import {
  cartLineItems,
  cartSubtotal,
  loadCart,
} from "../services/carts";
import * as svc from "../services/coupons";
import type { AppEnv } from "../types";
import { idParamSchema } from "../validators/common";
import {
  createCouponSchema,
  updateCouponSchema,
  validateCouponSchema,
} from "../validators/coupons";

export const couponsRouter = new Hono<AppEnv>();

// Public-facing coupon validation (no owner auth).
couponsRouter.post("/validate", publicStoreContextMiddleware, async (c) => {
  const input = await parseJson(c, validateCouponSchema);
  let subtotal = input.subtotal ?? 0;
  let items: { productId: string; lineTotal: number }[] | undefined;
  if (input.cartId) {
    const cart = await loadCart(c.var.db, input.cartId);
    if (cart && cart.storeId === c.var.store.id) {
      subtotal = cartSubtotal(cart);
      items = cartLineItems(cart);
    }
  }
  const result = await svc.evaluateCoupon(c.var.db, c.var.store.id, input.code, {
    subtotal,
    items,
  });
  return c.json(
    success({
      valid: result.valid,
      discount: result.discount,
      reason: result.reason,
    }),
  );
});

// ---- Owner CRUD ----

couponsRouter.get("/", authMiddleware, storeContextMiddleware, async (c) =>
  c.json(success(await svc.listCoupons(c.var.db, c.var.store.id))),
);

couponsRouter.post("/", authMiddleware, storeContextMiddleware, async (c) => {
  const input = await parseJson(c, createCouponSchema);
  const coupon = await svc.createCoupon(c.var.db, c.var.store.id, input);
  return c.json(success({ coupon }), 201);
});

couponsRouter.get("/:id", authMiddleware, storeContextMiddleware, async (c) => {
  const { id } = parseParams(c, idParamSchema);
  return c.json(success({ coupon: await svc.getCoupon(c.var.db, c.var.store.id, id) }));
});

couponsRouter.patch("/:id", authMiddleware, storeContextMiddleware, async (c) => {
  const { id } = parseParams(c, idParamSchema);
  const input = await parseJson(c, updateCouponSchema);
  const coupon = await svc.updateCoupon(c.var.db, c.var.store.id, id, input);
  return c.json(success({ coupon }));
});

couponsRouter.delete("/:id", authMiddleware, storeContextMiddleware, async (c) => {
  const { id } = parseParams(c, idParamSchema);
  await svc.deleteCoupon(c.var.db, c.var.store.id, id);
  return c.json(success({ deleted: true }));
});
