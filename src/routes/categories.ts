import { Hono } from "hono";
import { success } from "../lib/jsend";
import { parseJson, parseParams, parseQuery } from "../lib/validation";
import { authMiddleware } from "../middleware/auth";
import { storeContextMiddleware } from "../middleware/store-context";
import * as svc from "../services/categories";
import type { AppEnv } from "../types";
import { idParamSchema } from "../validators/common";
import {
  createCategorySchema,
  deleteCategoryQuerySchema,
  updateCategorySchema,
} from "../validators/categories";

export const categoriesRouter = new Hono<AppEnv>();
categoriesRouter.use(authMiddleware, storeContextMiddleware);

categoriesRouter.get("/", async (c) =>
  c.json(success({ categories: await svc.getCategoryTree(c.var.db, c.var.store.id) })),
);

categoriesRouter.post("/", async (c) => {
  const input = await parseJson(c, createCategorySchema);
  const category = await svc.createCategory(c.var.db, c.var.store.id, input);
  return c.json(success({ category }), 201);
});

categoriesRouter.patch("/:id", async (c) => {
  const { id } = parseParams(c, idParamSchema);
  const input = await parseJson(c, updateCategorySchema);
  const category = await svc.updateCategory(c.var.db, c.var.store.id, id, input);
  return c.json(success({ category }));
});

categoriesRouter.delete("/:id", async (c) => {
  const { id } = parseParams(c, idParamSchema);
  const { recursive } = parseQuery(c, deleteCategoryQuerySchema);
  await svc.deleteCategory(c.var.db, c.var.store.id, id, recursive);
  return c.json(success({ deleted: true }));
});
