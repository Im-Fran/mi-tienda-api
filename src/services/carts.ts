import { and, desc, eq } from "drizzle-orm";
import type { Database } from "../db";
import { cartItems, carts, productVariants } from "../db/schema";
import { uuid } from "../lib/crypto";
import { badRequest, forbidden, notFound } from "../lib/errors";
import type { CustomerRow } from "../types";
import { evaluateCoupon } from "./coupons";

export interface CartActor {
  customer?: CustomerRow;
  guestToken?: string;
}

const CART_WITH = {
  items: { with: { variant: { with: { product: true } } } },
  coupon: true,
} as const;

export type LoadedCart = NonNullable<
  Awaited<ReturnType<typeof loadCart>>
>;

export async function loadCart(db: Database, cartId: string) {
  return db.query.carts.findFirst({
    where: eq(carts.id, cartId),
    with: CART_WITH,
  });
}

function assertAccess(cart: LoadedCart, actor: CartActor) {
  const byCustomer =
    !!cart.customerId && !!actor.customer && cart.customerId === actor.customer.id;
  const byGuest =
    !!cart.guestToken && !!actor.guestToken && cart.guestToken === actor.guestToken;
  if (!byCustomer && !byGuest) throw forbidden("You cannot access this cart");
}

export function cartSubtotal(cart: LoadedCart): number {
  return cart.items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
}

export function cartLineItems(cart: LoadedCart) {
  return cart.items.map((i) => ({
    productId: i.variant.productId,
    lineTotal: i.unitPrice * i.quantity,
  }));
}

/** Build the response view: cart + computed subtotal/discount preview. */
export async function buildCartView(db: Database, cart: LoadedCart) {
  const subtotal = cartSubtotal(cart);
  let discount = 0;
  if (cart.coupon) {
    const evalResult = await evaluateCoupon(db, cart.storeId, cart.coupon.code, {
      subtotal,
      items: cartLineItems(cart),
    });
    if (evalResult.valid) discount = evalResult.discount;
  }
  return { ...cart, totals: { subtotal, discount, estimatedTotal: subtotal - discount } };
}

async function loadOwnedCart(
  db: Database,
  storeId: string,
  cartId: string,
  actor: CartActor,
) {
  const cart = await loadCart(db, cartId);
  if (!cart || cart.storeId !== storeId) throw notFound("Cart");
  assertAccess(cart, actor);
  return cart;
}

export async function createCart(
  db: Database,
  storeId: string,
  actor: CartActor,
) {
  const isCustomer = !!actor.customer;
  const guestToken = isCustomer ? null : uuid();
  const [created] = await db
    .insert(carts)
    .values({
      storeId,
      customerId: actor.customer?.id ?? null,
      guestToken,
      status: "active",
    })
    .returning();
  const cart = await loadCart(db, created.id);
  return { cart: await buildCartView(db, cart!), guestToken };
}

export async function getCart(
  db: Database,
  storeId: string,
  cartId: string,
  actor: CartActor,
) {
  const cart = await loadOwnedCart(db, storeId, cartId, actor);
  return buildCartView(db, cart);
}

export async function addItem(
  db: Database,
  storeId: string,
  cartId: string,
  actor: CartActor,
  input: { variantId: string; quantity: number },
) {
  const cart = await loadOwnedCart(db, storeId, cartId, actor);
  if (cart.status !== "active") throw badRequest("Cart is not active");

  const variant = await db.query.productVariants.findFirst({
    where: eq(productVariants.id, input.variantId),
    with: { product: true },
  });
  if (!variant || variant.product.storeId !== storeId)
    throw badRequest("Variant not found in this store");

  const existing = cart.items.find((i) => i.variantId === input.variantId);
  if (existing) {
    await db
      .update(cartItems)
      .set({ quantity: existing.quantity + input.quantity })
      .where(eq(cartItems.id, existing.id));
  } else {
    await db.insert(cartItems).values({
      cartId,
      variantId: input.variantId,
      quantity: input.quantity,
      unitPrice: variant.price,
    });
  }
  await touchCart(db, cartId);
  return buildCartView(db, (await loadCart(db, cartId))!);
}

export async function updateItem(
  db: Database,
  storeId: string,
  cartId: string,
  actor: CartActor,
  itemId: string,
  quantity: number,
) {
  const cart = await loadOwnedCart(db, storeId, cartId, actor);
  const item = cart.items.find((i) => i.id === itemId);
  if (!item) throw notFound("Cart item");
  await db
    .update(cartItems)
    .set({ quantity })
    .where(eq(cartItems.id, itemId));
  await touchCart(db, cartId);
  return buildCartView(db, (await loadCart(db, cartId))!);
}

export async function removeItem(
  db: Database,
  storeId: string,
  cartId: string,
  actor: CartActor,
  itemId: string,
) {
  const cart = await loadOwnedCart(db, storeId, cartId, actor);
  const item = cart.items.find((i) => i.id === itemId);
  if (!item) throw notFound("Cart item");
  await db.delete(cartItems).where(eq(cartItems.id, itemId));
  await touchCart(db, cartId);
  return buildCartView(db, (await loadCart(db, cartId))!);
}

export async function applyCoupon(
  db: Database,
  storeId: string,
  cartId: string,
  actor: CartActor,
  code: string,
) {
  const cart = await loadOwnedCart(db, storeId, cartId, actor);
  const subtotal = cartSubtotal(cart);
  const result = await evaluateCoupon(db, storeId, code, {
    subtotal,
    items: cartLineItems(cart),
  });
  if (!result.valid || !result.coupon) {
    throw badRequest(result.reason ?? "Invalid coupon");
  }
  await db
    .update(carts)
    .set({ couponId: result.coupon.id })
    .where(eq(carts.id, cartId));
  return buildCartView(db, (await loadCart(db, cartId))!);
}

export async function removeCoupon(
  db: Database,
  storeId: string,
  cartId: string,
  actor: CartActor,
) {
  await loadOwnedCart(db, storeId, cartId, actor);
  await db.update(carts).set({ couponId: null }).where(eq(carts.id, cartId));
  return buildCartView(db, (await loadCart(db, cartId))!);
}

async function touchCart(db: Database, cartId: string) {
  await db
    .update(carts)
    .set({ updatedAt: new Date() })
    .where(eq(carts.id, cartId));
}

// ---- Admin views ----

export async function listCarts(
  db: Database,
  storeId: string,
  status: "active" | "abandoned" | "completed" | undefined,
  page: number,
  perPage: number,
) {
  const where = status
    ? and(eq(carts.storeId, storeId), eq(carts.status, status))
    : eq(carts.storeId, storeId);
  const total = await db.$count(carts, where);
  const items = await db.query.carts.findMany({
    where,
    with: CART_WITH,
    limit: perPage,
    offset: (page - 1) * perPage,
    orderBy: desc(carts.updatedAt),
  });
  return { items, total, page, perPage };
}

export async function getCartAdmin(
  db: Database,
  storeId: string,
  cartId: string,
) {
  const cart = await loadCart(db, cartId);
  if (!cart || cart.storeId !== storeId) throw notFound("Cart");
  return buildCartView(db, cart);
}
