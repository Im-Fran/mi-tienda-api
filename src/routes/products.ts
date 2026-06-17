import { Hono } from "hono";
import { badRequest } from "../lib/errors";
import { success } from "../lib/jsend";
import { parseJson, parseParams, parseQuery } from "../lib/validation";
import { collectUploads } from "../lib/upload";
import { authMiddleware } from "../middleware/auth";
import { storeContextMiddleware } from "../middleware/store-context";
import * as svc from "../services/products";
import type { AppEnv } from "../types";
import { idParamSchema } from "../validators/common";
import {
  createProductSchema,
  createVariantSchema,
  productFiltersSchema,
  updateProductSchema,
  updateVariantSchema,
} from "../validators/products";

export const productsRouter = new Hono<AppEnv>();
productsRouter.use(authMiddleware, storeContextMiddleware);

productsRouter.get("/", async (c) => {
  const filters = parseQuery(c, productFiltersSchema);
  return c.json(success(await svc.listProducts(c.var.db, c.var.store.id, filters)));
});

productsRouter.post("/", async (c) => {
  const input = await parseJson(c, createProductSchema);
  const product = await svc.createProduct(c.var.db, c.var.store.id, input);
  return c.json(success({ product }), 201);
});

productsRouter.get("/:id", async (c) => {
  const { id } = parseParams(c, idParamSchema);
  return c.json(
    success({ product: await svc.getProduct(c.var.db, c.var.store.id, id) }),
  );
});

productsRouter.patch("/:id", async (c) => {
  const { id } = parseParams(c, idParamSchema);
  const input = await parseJson(c, updateProductSchema);
  const product = await svc.updateProduct(c.var.db, c.var.store.id, id, input);
  return c.json(success({ product }));
});

productsRouter.delete("/:id", async (c) => {
  const { id } = parseParams(c, idParamSchema);
  await svc.deleteProduct(c.env, c.var.db, c.var.store.id, id);
  return c.json(success({ deleted: true }));
});

// ---- Images ----

productsRouter.post("/:id/images", async (c) => {
  const { id } = parseParams(c, idParamSchema);
  const form = await c.req.formData();
  const files = collectUploads(form, ["images", "image"]);
  if (files.length === 0)
    throw badRequest("No image files provided (use field 'images' or 'image')");

  const uploads = await Promise.all(
    files.map(async (f) => ({
      body: await f.arrayBuffer(),
      filename: f.name,
      contentType: f.type,
    })),
  );
  const images = await svc.addProductImages(
    c.env,
    c.var.db,
    c.var.store.id,
    id,
    uploads,
  );
  return c.json(success({ images }), 201);
});

productsRouter.delete("/:id/images/:imageId", async (c) => {
  await svc.removeProductImage(
    c.env,
    c.var.db,
    c.var.store.id,
    c.req.param("id"),
    c.req.param("imageId"),
  );
  return c.json(success({ deleted: true }));
});

productsRouter.patch("/:id/images/:imageId/main", async (c) => {
  const product = await svc.setMainProductImage(
    c.var.db,
    c.var.store.id,
    c.req.param("id"),
    c.req.param("imageId"),
  );
  return c.json(success({ product }));
});

// ---- Variants ----

productsRouter.post("/:id/variants", async (c) => {
  const { id } = parseParams(c, idParamSchema);
  const input = await parseJson(c, createVariantSchema);
  const variant = await svc.addVariant(c.var.db, c.var.store.id, id, input);
  return c.json(success({ variant }), 201);
});

productsRouter.patch("/:id/variants/:variantId", async (c) => {
  const input = await parseJson(c, updateVariantSchema);
  const variant = await svc.updateVariant(
    c.var.db,
    c.var.store.id,
    c.req.param("id"),
    c.req.param("variantId"),
    input,
  );
  return c.json(success({ variant }));
});

productsRouter.delete("/:id/variants/:variantId", async (c) => {
  await svc.deleteVariant(
    c.env,
    c.var.db,
    c.var.store.id,
    c.req.param("id"),
    c.req.param("variantId"),
  );
  return c.json(success({ deleted: true }));
});
