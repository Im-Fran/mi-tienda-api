import { env } from "cloudflare:test";
import { createDb } from "../src/db";
import {
  customers,
  paymentMethods,
  productVariants,
  products,
  storeSettings,
  stores,
  users,
} from "../src/db/schema";
import { createCustomerSession, createUserSession } from "../src/lib/session";
import app from "../src/index";

export { env };
export const db = () => createDb(env.DB);

interface ApiOptions {
  method?: string;
  body?: unknown;
  token?: string;
  guestToken?: string;
  headers?: Record<string, string>;
  // When set, body is sent as-is (e.g. FormData) without JSON serialization.
  raw?: boolean;
}

export async function api(path: string, opts: ApiOptions = {}) {
  const headers: Record<string, string> = { ...(opts.headers ?? {}) };
  if (opts.token) headers.authorization = `Bearer ${opts.token}`;
  if (opts.guestToken) headers["x-guest-token"] = opts.guestToken;

  let body: BodyInit | undefined;
  if (opts.body !== undefined) {
    if (opts.raw) {
      body = opts.body as BodyInit;
    } else {
      headers["content-type"] = "application/json";
      body = JSON.stringify(opts.body);
    }
  }

  const res = await app.request(
    path,
    { method: opts.method ?? "GET", headers, body },
    env,
  );
  // Clone-read so callers can still inspect the Response if needed.
  const json = (await res.clone().json().catch(() => null)) as any;
  return { status: res.status, json, res };
}

let counter = 0;
const uniqueEmail = (prefix: string) =>
  `${prefix}-${Date.now()}-${counter++}@test.dev`;

export async function createUser(email = uniqueEmail("user")) {
  const [user] = await db()
    .insert(users)
    .values({ email, provider: "email", emailVerified: true })
    .returning();
  return user;
}

export async function authUser(email?: string) {
  const user = await createUser(email);
  const token = await createUserSession(env, user.id);
  return { user, token };
}

export async function createCustomer(email = uniqueEmail("customer")) {
  const [customer] = await db()
    .insert(customers)
    .values({ email, provider: "email", emailVerified: true })
    .returning();
  return customer;
}

export async function authCustomer(email?: string) {
  const customer = await createCustomer(email);
  const token = await createCustomerSession(env, customer.id);
  return { customer, token };
}

// ---- Domain builders (direct DB inserts for fast test setup) ----

export async function createStore(
  userId: string,
  opts: { name?: string; isActive?: boolean } = {},
) {
  const [store] = await db()
    .insert(stores)
    .values({
      userId,
      name: opts.name ?? "Test Store",
      slug: `store-${crypto.randomUUID().slice(0, 8)}`,
      isActive: opts.isActive ?? true,
    })
    .returning();
  await db().insert(storeSettings).values({ storeId: store.id });
  return store;
}

export async function createProductWithVariant(
  storeId: string,
  opts: { price?: number; stock?: number; type?: "physical" | "digital" } = {},
) {
  const [product] = await db()
    .insert(products)
    .values({
      storeId,
      name: "Test Product",
      type: opts.type ?? "physical",
    })
    .returning();
  const [variant] = await db()
    .insert(productVariants)
    .values({
      productId: product.id,
      name: "Default",
      price: opts.price ?? 1000,
      stock: opts.stock ?? 10,
    })
    .returning();
  return { product, variant };
}

export async function createPaymentMethodRow(
  storeId: string,
  type: "in_person" | "bank_transfer" | "external" = "in_person",
) {
  const [pm] = await db()
    .insert(paymentMethods)
    .values({ storeId, type, isActive: true })
    .returning();
  return pm;
}
