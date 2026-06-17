import { Hono } from "hono";
import { success } from "../lib/jsend";
import { parseJson } from "../lib/validation";
import { optionalCustomerMiddleware } from "../middleware/customer-auth";
import { publicStoreContextMiddleware } from "../middleware/store-context";
import type { CartActor } from "../services/carts";
import * as svc from "../services/carts";
import { checkout } from "../services/checkout";
import type { AppEnv } from "../types";
import {
  addCartItemSchema,
  applyCouponSchema,
  checkoutSchema,
  updateCartItemSchema,
} from "../validators/carts";

export const cartRouter = new Hono<AppEnv>();
cartRouter.use(publicStoreContextMiddleware, optionalCustomerMiddleware);

function actor(c: { var: AppEnv["Variables"] }): CartActor {
  return { customer: c.var.customer, guestToken: c.var.guestToken };
}

cartRouter.post("/", async (c) => {
  const result = await svc.createCart(c.var.db, c.var.store.id, actor(c));
  return c.json(success(result), 201);
});

cartRouter.get("/:cartId", async (c) => {
  const cart = await svc.getCart(
    c.var.db,
    c.var.store.id,
    c.req.param("cartId"),
    actor(c),
  );
  return c.json(success({ cart }));
});

cartRouter.post("/:cartId/items", async (c) => {
  const input = await parseJson(c, addCartItemSchema);
  const cart = await svc.addItem(
    c.var.db,
    c.var.store.id,
    c.req.param("cartId"),
    actor(c),
    input,
  );
  return c.json(success({ cart }));
});

cartRouter.patch("/:cartId/items/:itemId", async (c) => {
  const { quantity } = await parseJson(c, updateCartItemSchema);
  const cart = await svc.updateItem(
    c.var.db,
    c.var.store.id,
    c.req.param("cartId"),
    actor(c),
    c.req.param("itemId"),
    quantity,
  );
  return c.json(success({ cart }));
});

cartRouter.delete("/:cartId/items/:itemId", async (c) => {
  const cart = await svc.removeItem(
    c.var.db,
    c.var.store.id,
    c.req.param("cartId"),
    actor(c),
    c.req.param("itemId"),
  );
  return c.json(success({ cart }));
});

cartRouter.post("/:cartId/coupon", async (c) => {
  const { code } = await parseJson(c, applyCouponSchema);
  const cart = await svc.applyCoupon(
    c.var.db,
    c.var.store.id,
    c.req.param("cartId"),
    actor(c),
    code,
  );
  return c.json(success({ cart }));
});

cartRouter.delete("/:cartId/coupon", async (c) => {
  const cart = await svc.removeCoupon(
    c.var.db,
    c.var.store.id,
    c.req.param("cartId"),
    actor(c),
  );
  return c.json(success({ cart }));
});

cartRouter.post("/:cartId/checkout", async (c) => {
  const input = await parseJson(c, checkoutSchema);
  const result = await checkout(
    c.var.db,
    c.var.store.id,
    c.req.param("cartId"),
    actor(c),
    input,
  );
  return c.json(success(result), 201);
});
