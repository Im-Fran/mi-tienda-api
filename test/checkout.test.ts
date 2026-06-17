import { eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { carts, coupons, productVariants } from "../src/db/schema";
import {
  api,
  authUser,
  createPaymentMethodRow,
  createProductWithVariant,
  createStore,
  db,
} from "./helpers";

async function guestCartWith(stock: number, price = 1000) {
  const { user } = await authUser();
  const store = await createStore(user.id);
  const { product, variant } = await createProductWithVariant(store.id, {
    price,
    stock,
  });
  const pm = await createPaymentMethodRow(store.id, "in_person");

  const created = await api(`/api/stores/${store.id}/cart`, { method: "POST" });
  const guestToken = created.json.data.guestToken as string;
  const cartId = created.json.data.cart.id as string;
  return { store, product, variant, pm, guestToken, cartId };
}

describe("checkout", () => {
  it("reduces stock, snapshots items, and completes the cart", async () => {
    const ctx = await guestCartWith(5, 1000);
    await api(`/api/stores/${ctx.store.id}/cart/${ctx.cartId}/items`, {
      method: "POST",
      guestToken: ctx.guestToken,
      body: { variantId: ctx.variant.id, quantity: 2 },
    });

    const res = await api(
      `/api/stores/${ctx.store.id}/cart/${ctx.cartId}/checkout`,
      {
        method: "POST",
        guestToken: ctx.guestToken,
        body: {
          guest: { name: "Guest", email: "guest@test.dev" },
          documentType: "receipt",
          paymentMethodId: ctx.pm.id,
        },
      },
    );
    expect(res.status).toBe(201);
    expect(res.json.data.order.total).toBe(2000);

    const variant = await db().query.productVariants.findFirst({
      where: eq(productVariants.id, ctx.variant.id),
    });
    expect(variant?.stock).toBe(3);

    const item = res.json.data.order.items[0];
    expect(item.productSnapshot.productName).toBe("Test Product");
    expect(item.quantity).toBe(2);

    const cart = await db().query.carts.findFirst({
      where: eq(carts.id, ctx.cartId),
    });
    expect(cart?.status).toBe("completed");
  });

  it("rejects checkout when an item is out of stock", async () => {
    const ctx = await guestCartWith(1, 1000);
    await api(`/api/stores/${ctx.store.id}/cart/${ctx.cartId}/items`, {
      method: "POST",
      guestToken: ctx.guestToken,
      body: { variantId: ctx.variant.id, quantity: 3 },
    });

    const res = await api(
      `/api/stores/${ctx.store.id}/cart/${ctx.cartId}/checkout`,
      {
        method: "POST",
        guestToken: ctx.guestToken,
        body: {
          guest: { name: "Guest", email: "guest@test.dev" },
          paymentMethodId: ctx.pm.id,
        },
      },
    );
    expect(res.status).toBe(409);
    expect(res.json.status).toBe("fail");
    expect(res.json.data.conflicts).toHaveLength(1);

    // Stock must be untouched after a failed checkout.
    const variant = await db().query.productVariants.findFirst({
      where: eq(productVariants.id, ctx.variant.id),
    });
    expect(variant?.stock).toBe(1);
  });

  it("applies a coupon discount to the order total", async () => {
    const ctx = await guestCartWith(10, 1000);
    await api(`/api/stores/${ctx.store.id}/cart/${ctx.cartId}/items`, {
      method: "POST",
      guestToken: ctx.guestToken,
      body: { variantId: ctx.variant.id, quantity: 2 },
    });
    await db()
      .insert(coupons)
      .values({
        storeId: ctx.store.id,
        code: "SAVE10",
        type: "percentage",
        value: 10,
        appliesTo: "all",
        isActive: true,
      });
    await api(`/api/stores/${ctx.store.id}/cart/${ctx.cartId}/coupon`, {
      method: "POST",
      guestToken: ctx.guestToken,
      body: { code: "SAVE10" },
    });

    const res = await api(
      `/api/stores/${ctx.store.id}/cart/${ctx.cartId}/checkout`,
      {
        method: "POST",
        guestToken: ctx.guestToken,
        body: {
          guest: { name: "Guest", email: "guest@test.dev" },
          paymentMethodId: ctx.pm.id,
        },
      },
    );
    expect(res.status).toBe(201);
    expect(res.json.data.order.discountAmount).toBe(200);
    expect(res.json.data.order.total).toBe(1800);
  });

  it("returns bank transfer details for bank_transfer orders", async () => {
    const { user } = await authUser();
    const store = await createStore(user.id);
    const { variant } = await createProductWithVariant(store.id, { stock: 5 });
    const pm = await createPaymentMethodRow(store.id, "bank_transfer");

    const created = await api(`/api/stores/${store.id}/cart`, { method: "POST" });
    const guestToken = created.json.data.guestToken as string;
    const cartId = created.json.data.cart.id as string;
    await api(`/api/stores/${store.id}/cart/${cartId}/items`, {
      method: "POST",
      guestToken,
      body: { variantId: variant.id, quantity: 1 },
    });

    const res = await api(`/api/stores/${store.id}/cart/${cartId}/checkout`, {
      method: "POST",
      guestToken,
      body: {
        guest: { name: "Guest", email: "guest@test.dev" },
        paymentMethodId: pm.id,
      },
    });
    expect(res.status).toBe(201);
    // bankTransfer key is present in the response (null when unconfigured).
    expect(res.json.data).toHaveProperty("bankTransfer");
  });
});
