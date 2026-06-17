import { eq } from "drizzle-orm";
import { createMiddleware } from "hono/factory";
import { customers } from "../db/schema";
import { unauthorized } from "../lib/errors";
import { bearerToken, getCustomerSession } from "../lib/session";
import type { AppEnv } from "../types";

/** Require a valid customer session (KV_CUSTOMER_SESSIONS); injects `c.var.customer`. */
export const customerAuthMiddleware = createMiddleware<AppEnv>(
  async (c, next) => {
    const token = bearerToken(c.req.header("authorization"));
    if (!token) throw unauthorized("Missing bearer token");

    const session = await getCustomerSession(c.env, token);
    if (!session) throw unauthorized("Invalid or expired customer session");

    const customer = await c.var.db.query.customers.findFirst({
      where: eq(customers.id, session.customerId),
    });
    if (!customer) throw unauthorized("Customer no longer exists");

    c.set("customer", customer);
    await next();
  },
);

/**
 * Resolve an optional identity for public cart routes: a logged-in customer
 * (Bearer) and/or a guest token (`X-Guest-Token` header). Never throws —
 * ownership is validated against the cart row in the service layer.
 */
export const optionalCustomerMiddleware = createMiddleware<AppEnv>(
  async (c, next) => {
    const token = bearerToken(c.req.header("authorization"));
    if (token) {
      const session = await getCustomerSession(c.env, token);
      if (session) {
        const customer = await c.var.db.query.customers.findFirst({
          where: eq(customers.id, session.customerId),
        });
        if (customer) c.set("customer", customer);
      }
    }
    const guest = c.req.header("x-guest-token");
    if (guest) c.set("guestToken", guest);
    await next();
  },
);
