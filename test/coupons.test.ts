import { describe, expect, it } from "vitest";
import { couponProducts, coupons } from "../src/db/schema";
import { evaluateCoupon } from "../src/services/coupons";
import { createProductWithVariant, createStore, createUser, db } from "./helpers";

async function freshStore() {
  const user = await createUser();
  return createStore(user.id);
}

describe("coupon evaluation", () => {
  it("rejects an expired coupon", async () => {
    const store = await freshStore();
    await db()
      .insert(coupons)
      .values({
        storeId: store.id,
        code: "EXP",
        type: "fixed",
        value: 500,
        expiresAt: new Date(Date.now() - 60_000),
        isActive: true,
      });
    const r = await evaluateCoupon(db(), store.id, "EXP", { subtotal: 2000 });
    expect(r.valid).toBe(false);
  });

  it("rejects a coupon past its usage limit", async () => {
    const store = await freshStore();
    await db()
      .insert(coupons)
      .values({
        storeId: store.id,
        code: "MAXED",
        type: "fixed",
        value: 500,
        maxUses: 1,
        usedCount: 1,
        isActive: true,
      });
    const r = await evaluateCoupon(db(), store.id, "MAXED", { subtotal: 2000 });
    expect(r.valid).toBe(false);
  });

  it("rejects when the order is below the minimum amount", async () => {
    const store = await freshStore();
    await db()
      .insert(coupons)
      .values({
        storeId: store.id,
        code: "MIN",
        type: "percentage",
        value: 10,
        minOrderAmount: 5000,
        isActive: true,
      });
    const r = await evaluateCoupon(db(), store.id, "MIN", { subtotal: 2000 });
    expect(r.valid).toBe(false);
  });

  it("computes a percentage discount on the whole order", async () => {
    const store = await freshStore();
    await db()
      .insert(coupons)
      .values({
        storeId: store.id,
        code: "SAVE10",
        type: "percentage",
        value: 10,
        appliesTo: "all",
        isActive: true,
      });
    const r = await evaluateCoupon(db(), store.id, "SAVE10", { subtotal: 2000 });
    expect(r.valid).toBe(true);
    expect(r.discount).toBe(200);
  });

  it("limits a product-scoped coupon to eligible items", async () => {
    const store = await freshStore();
    const px = await createProductWithVariant(store.id, { price: 1000 });
    const py = await createProductWithVariant(store.id, { price: 2000 });
    const [coupon] = await db()
      .insert(coupons)
      .values({
        storeId: store.id,
        code: "PONLY",
        type: "percentage",
        value: 50,
        appliesTo: "products",
        isActive: true,
      })
      .returning();
    await db()
      .insert(couponProducts)
      .values({ couponId: coupon.id, productId: px.product.id });

    const r = await evaluateCoupon(db(), store.id, "PONLY", {
      subtotal: 3000,
      items: [
        { productId: px.product.id, lineTotal: 1000 },
        { productId: py.product.id, lineTotal: 2000 },
      ],
    });
    expect(r.valid).toBe(true);
    // 50% of the eligible product only (1000) => 500
    expect(r.discount).toBe(500);
  });
});
