/**
 * Tests for the corrected stats contracts.
 *
 * Corrected shapes:
 *   /stats/summary         → { totalRevenue, totalOrders, averageOrderValue, currencyCode }
 *   /stats/top-products    → { products: [{ productId, productName, totalRevenue, totalQuantity }] }
 *   /stats/orders-by-status → { data: [{ status, count }] }
 *   /stats/revenue-over-time → { data: [{ date, revenue }] }
 */
import { describe, expect, it } from "vitest";
import { orderItems, orders } from "../src/db/schema";
import {
  api,
  authUser,
  createPaymentMethodRow,
  createProductWithVariant,
  createStore,
  db,
} from "./helpers";

async function seedPaidOrder(
  storeId: string,
  paymentMethodId: string,
  productId: string,
  variantId: string,
  total: number,
) {
  const [order] = await db()
    .insert(orders)
    .values({
      storeId,
      status: "paid",
      documentType: "receipt",
      subtotal: total,
      discountAmount: 0,
      taxAmount: 0,
      shippingAmount: 0,
      total,
      currencyCode: "USD",
      paymentMethodId,
    })
    .returning();

  await db().insert(orderItems).values({
    orderId: order.id,
    variantId,
    productSnapshot: JSON.stringify({
      productId,
      productName: "Test Product",
      variantId,
      variantName: "Default",
      sku: null,
      type: "physical",
    }),
    quantity: 1,
    unitPrice: total,
    totalPrice: total,
  });

  return order;
}

describe("stats – summary contract", () => {
  it("returns { totalRevenue, totalOrders, averageOrderValue, currencyCode }", async () => {
    const { user, token } = await authUser();
    const store = await createStore(user.id);
    const pm = await createPaymentMethodRow(store.id);
    const { product, variant } = await createProductWithVariant(store.id, { price: 1000 });

    await seedPaidOrder(store.id, pm.id, product.id, variant.id, 1000);
    await seedPaidOrder(store.id, pm.id, product.id, variant.id, 3000);

    const res = await api(`/api/stores/${store.id}/stats/summary`, { token });
    expect(res.status).toBe(200);
    const data = res.json.data;

    expect(typeof data.totalRevenue).toBe("number");
    expect(typeof data.totalOrders).toBe("number");
    expect(typeof data.averageOrderValue).toBe("number");
    expect(typeof data.currencyCode).toBe("string");

    expect(data.totalRevenue).toBe(4000);
    expect(data.totalOrders).toBe(2);
    expect(data.averageOrderValue).toBe(2000);
    // Must NOT have old field names
    expect(data.revenue).toBeUndefined();
    expect(data.paidOrders).toBeUndefined();
  });

  it("returns zeros for a store with no orders", async () => {
    const { user, token } = await authUser();
    const store = await createStore(user.id);

    const res = await api(`/api/stores/${store.id}/stats/summary`, { token });
    expect(res.status).toBe(200);
    expect(res.json.data.totalRevenue).toBe(0);
    expect(res.json.data.totalOrders).toBe(0);
    expect(res.json.data.averageOrderValue).toBe(0);
  });
});

describe("stats – top-products contract", () => {
  it("returns { products: [{ productId, productName, totalRevenue, totalQuantity }] }", async () => {
    const { user, token } = await authUser();
    const store = await createStore(user.id);
    const pm = await createPaymentMethodRow(store.id);
    const { product, variant } = await createProductWithVariant(store.id, { price: 500 });

    await seedPaidOrder(store.id, pm.id, product.id, variant.id, 500);

    const res = await api(`/api/stores/${store.id}/stats/top-products`, { token });
    expect(res.status).toBe(200);
    const data = res.json.data;

    expect(Array.isArray(data.products)).toBe(true);
    // Must NOT be bare array at top level
    expect(Array.isArray(data)).toBe(false);

    if (data.products.length > 0) {
      const p = data.products[0];
      expect(p.productId).toBeDefined();
      expect(p.productName).toBeDefined();
      expect(typeof p.totalRevenue).toBe("number");
      expect(typeof p.totalQuantity).toBe("number");
      // Must NOT have old field names
      expect(p.unitsSold).toBeUndefined();
      expect(p.revenue).toBeUndefined();
    }
  });
});

describe("stats – orders-by-status contract", () => {
  it("returns { data: [{ status, count }] } (not a bare array)", async () => {
    const { user, token } = await authUser();
    const store = await createStore(user.id);
    const pm = await createPaymentMethodRow(store.id);
    const { product, variant } = await createProductWithVariant(store.id);
    await seedPaidOrder(store.id, pm.id, product.id, variant.id, 1000);

    const res = await api(`/api/stores/${store.id}/stats/orders-by-status`, { token });
    expect(res.status).toBe(200);
    const data = res.json.data;

    expect(data.data).toBeDefined();
    expect(Array.isArray(data.data)).toBe(true);
    // Must NOT be bare array at top level
    expect(Array.isArray(data)).toBe(false);

    if (data.data.length > 0) {
      const item = data.data[0];
      expect(item.status).toBeDefined();
      expect(typeof item.count).toBe("number");
    }
  });
});

describe("stats – revenue-over-time contract", () => {
  it("returns { data: [{ date, revenue }] } with 'date' field (not 'bucket')", async () => {
    const { user, token } = await authUser();
    const store = await createStore(user.id);
    const pm = await createPaymentMethodRow(store.id);
    const { product, variant } = await createProductWithVariant(store.id);
    await seedPaidOrder(store.id, pm.id, product.id, variant.id, 2000);

    const res = await api(
      `/api/stores/${store.id}/stats/revenue-over-time?interval=day`,
      { token },
    );
    expect(res.status).toBe(200);
    const data = res.json.data;

    expect(data.data).toBeDefined();
    expect(Array.isArray(data.data)).toBe(true);
    // Must NOT be bare array at top level
    expect(Array.isArray(data)).toBe(false);

    if (data.data.length > 0) {
      const point = data.data[0];
      // Must have 'date' field, NOT 'bucket'
      expect(point.date).toBeDefined();
      expect(point.bucket).toBeUndefined();
      expect(typeof point.revenue).toBe("number");
    }
  });

  it("accepts interval=week and interval=month without error", async () => {
    const { user, token } = await authUser();
    const store = await createStore(user.id);

    const week = await api(
      `/api/stores/${store.id}/stats/revenue-over-time?interval=week`,
      { token },
    );
    expect(week.status).toBe(200);

    const month = await api(
      `/api/stores/${store.id}/stats/revenue-over-time?interval=month`,
      { token },
    );
    expect(month.status).toBe(200);
  });
});

describe("stats – admin carts contract", () => {
  it("GET /carts returns { carts, pagination } (not { items, total })", async () => {
    const { user, token } = await authUser();
    const store = await createStore(user.id);

    const res = await api(`/api/stores/${store.id}/carts`, { token });
    expect(res.status).toBe(200);
    const data = res.json.data;

    expect(Array.isArray(data.carts)).toBe(true);
    expect(data.pagination).toBeDefined();
    expect(typeof data.pagination.total).toBe("number");
    expect(typeof data.pagination.page).toBe("number");
    expect(typeof data.pagination.perPage).toBe("number");
    expect(typeof data.pagination.totalPages).toBe("number");
    // Must NOT have old shape
    expect(data.items).toBeUndefined();
  });

  it("filters carts by status=active", async () => {
    const { user, token } = await authUser();
    const store = await createStore(user.id);

    const res = await api(
      `/api/stores/${store.id}/carts?status=active`,
      { token },
    );
    expect(res.status).toBe(200);
    expect(Array.isArray(res.json.data.carts)).toBe(true);
  });
});
