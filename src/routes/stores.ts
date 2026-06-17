import { Hono } from "hono";
import { badRequest } from "../lib/errors";
import { success } from "../lib/jsend";
import { collectUploads } from "../lib/upload";
import { parseJson } from "../lib/validation";
import { authMiddleware } from "../middleware/auth";
import { storeContextMiddleware } from "../middleware/store-context";
import * as svc from "../services/stores";
import type { AppEnv } from "../types";
import {
  createStoreSchema,
  updateStoreSchema,
  updateStoreSettingsSchema,
} from "../validators/stores";
import { cartRouter } from "./cart";
import { cartsAdminRouter } from "./carts-admin";
import { categoriesRouter } from "./categories";
import { couponsRouter } from "./coupons";
import { ordersRouter } from "./orders";
import { paymentsRouter } from "./payments";
import { productsRouter } from "./products";
import { shippingRouter } from "./shipping";
import { statsRouter } from "./stats";
import { storeCustomersRouter } from "./store-customers";

export const storesRouter = new Hono<AppEnv>();

// ---- List + create (auth only) ----

storesRouter.get("/", authMiddleware, async (c) =>
  c.json(success({ stores: await svc.listStores(c.var.db, c.var.user.id) })),
);

storesRouter.post("/", authMiddleware, async (c) => {
  const input = await parseJson(c, createStoreSchema);
  const store = await svc.createStore(c.var.db, c.var.user.id, input);
  return c.json(success({ store }), 201);
});

// ---- Single store management (auth + ownership) ----

storesRouter.get("/:storeId", authMiddleware, storeContextMiddleware, async (c) =>
  c.json(success({ store: await svc.getStore(c.var.db, c.var.store.id) })),
);

storesRouter.patch(
  "/:storeId",
  authMiddleware,
  storeContextMiddleware,
  async (c) => {
    const input = await parseJson(c, updateStoreSchema);
    const store = await svc.updateStore(c.var.db, c.var.store.id, input);
    return c.json(success({ store }));
  },
);

storesRouter.delete(
  "/:storeId",
  authMiddleware,
  storeContextMiddleware,
  async (c) => {
    await svc.deleteStore(c.env, c.var.db, c.var.store.id);
    return c.json(success({ deleted: true }));
  },
);

storesRouter.get(
  "/:storeId/settings",
  authMiddleware,
  storeContextMiddleware,
  async (c) =>
    c.json(
      success({ settings: await svc.getStoreSettings(c.var.db, c.var.store.id) }),
    ),
);

storesRouter.patch(
  "/:storeId/settings",
  authMiddleware,
  storeContextMiddleware,
  async (c) => {
    const input = await parseJson(c, updateStoreSettingsSchema);
    const settings = await svc.updateStoreSettings(
      c.var.db,
      c.var.store.id,
      input,
    );
    return c.json(success({ settings }));
  },
);

storesRouter.post(
  "/:storeId/logo",
  authMiddleware,
  storeContextMiddleware,
  async (c) => {
    const form = await c.req.formData();
    const [file] = collectUploads(form, ["logo", "file"]);
    if (!file) throw badRequest("No logo file provided (field 'logo')");
    const store = await svc.uploadStoreLogo(
      c.env,
      c.var.db,
      c.var.store,
      await file.arrayBuffer(),
      file.name,
      file.type,
    );
    return c.json(success({ store }));
  },
);

// ---- Nested store resources ----

storesRouter.route("/:storeId/products", productsRouter);
storesRouter.route("/:storeId/categories", categoriesRouter);
storesRouter.route("/:storeId/coupons", couponsRouter);
storesRouter.route("/:storeId/customers", storeCustomersRouter);
storesRouter.route("/:storeId/carts", cartsAdminRouter);
storesRouter.route("/:storeId/cart", cartRouter);
storesRouter.route("/:storeId/orders", ordersRouter);
storesRouter.route("/:storeId/payments", paymentsRouter);
storesRouter.route("/:storeId/shipping", shippingRouter);
storesRouter.route("/:storeId/stats", statsRouter);
