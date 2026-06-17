import { eq } from "drizzle-orm";
import { createMiddleware } from "hono/factory";
import { stores } from "../db/schema";
import { badRequest, forbidden, notFound } from "../lib/errors";
import { userHasAnyRole } from "../services/permissions";
import type { AppEnv } from "../types";

const ADMIN_ROLES = ["Administrator", "StoreAdministrator"] as const;

/**
 * For owner routes under `/api/stores/:storeId/*`: the store must exist and
 * the authenticated user must own it (or be a platform admin). Injects `c.var.store`.
 */
export const storeContextMiddleware = createMiddleware<AppEnv>(
  async (c, next) => {
    const storeId = c.req.param("storeId");
    if (!storeId) throw badRequest("Missing storeId");

    const store = await c.var.db.query.stores.findFirst({
      where: eq(stores.id, storeId),
    });
    if (!store) throw notFound("Store");

    const user = c.get("user");
    const isOwner = !!user && store.userId === user.id;
    const isAdmin =
      !!user && (await userHasAnyRole(c.var.db, user.id, ADMIN_ROLES));
    if (!isOwner && !isAdmin) {
      throw forbidden("You do not have access to this store");
    }

    c.set("store", store);
    await next();
  },
);

/**
 * For public storefront routes under `/api/stores/:storeId/*` (cart, coupon
 * validation): the store must exist and be active. No ownership required.
 */
export const publicStoreContextMiddleware = createMiddleware<AppEnv>(
  async (c, next) => {
    const storeId = c.req.param("storeId");
    if (!storeId) throw badRequest("Missing storeId");

    const store = await c.var.db.query.stores.findFirst({
      where: eq(stores.id, storeId),
    });
    if (!store) throw notFound("Store");
    if (!store.isActive) throw forbidden("Store is not active");

    c.set("store", store);
    await next();
  },
);
