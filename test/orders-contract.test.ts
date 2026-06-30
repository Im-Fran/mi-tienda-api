/**
 * Tests for the corrected listOrders contract:
 * backend must return { orders, pagination } instead of { items, total, page, perPage }.
 */
import { describe, expect, it } from "vitest";
import { orders } from "../src/db/schema";
import {
  api,
  authUser,
  createPaymentMethodRow,
  createStore,
  db,
} from "./helpers";

async function createOrderRow(
  storeId: string,
  paymentMethodId: string,
  status: "pending_payment" | "paid" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded" = "pending_payment",
) {
  const [order] = await db()
    .insert(orders)
    .values({
      storeId,
      status,
      documentType: "receipt",
      subtotal: 2000,
      discountAmount: 0,
      taxAmount: 0,
      shippingAmount: 0,
      total: 2000,
      currencyCode: "USD",
      paymentMethodId,
    })
    .returning();
  return order;
}

describe("orders – list contract", () => {
  it("GET /orders returns { orders, pagination } shape", async () => {
    const { user, token } = await authUser();
    const store = await createStore(user.id);
    const pm = await createPaymentMethodRow(store.id);
    await createOrderRow(store.id, pm.id);
    await createOrderRow(store.id, pm.id);

    const res = await api(`/api/stores/${store.id}/orders`, { token });
    expect(res.status).toBe(200);

    const data = res.json.data;
    expect(Array.isArray(data.orders)).toBe(true);
    expect(data.orders).toHaveLength(2);
    expect(data.pagination).toBeDefined();
    expect(data.pagination.total).toBe(2);
    expect(data.pagination.page).toBe(1);
    expect(data.pagination.totalPages).toBe(1);
    // Must NOT have old shape
    expect(data.items).toBeUndefined();
  });

  it("filters orders by status", async () => {
    const { user, token } = await authUser();
    const store = await createStore(user.id);
    const pm = await createPaymentMethodRow(store.id);
    await createOrderRow(store.id, pm.id, "pending_payment");
    await createOrderRow(store.id, pm.id, "paid");
    await createOrderRow(store.id, pm.id, "paid");

    const res = await api(
      `/api/stores/${store.id}/orders?status=paid`,
      { token },
    );
    expect(res.status).toBe(200);
    expect(res.json.data.orders).toHaveLength(2);
    expect(res.json.data.pagination.total).toBe(2);
  });

  it("paginates orders correctly", async () => {
    const { user, token } = await authUser();
    const store = await createStore(user.id);
    const pm = await createPaymentMethodRow(store.id);
    for (let i = 0; i < 5; i++) {
      await createOrderRow(store.id, pm.id);
    }

    const res = await api(
      `/api/stores/${store.id}/orders?page=1&perPage=2`,
      { token },
    );
    expect(res.status).toBe(200);
    expect(res.json.data.orders).toHaveLength(2);
    expect(res.json.data.pagination.total).toBe(5);
    expect(res.json.data.pagination.totalPages).toBe(3);
  });

  it("GET /orders/:id returns { order } with items", async () => {
    const { user, token } = await authUser();
    const store = await createStore(user.id);
    const pm = await createPaymentMethodRow(store.id);
    const order = await createOrderRow(store.id, pm.id);

    const res = await api(`/api/stores/${store.id}/orders/${order.id}`, { token });
    expect(res.status).toBe(200);
    expect(res.json.data.order.id).toBe(order.id);
    expect(Array.isArray(res.json.data.order.items)).toBe(true);
  });

  it("PATCH /orders/:id/status updates status", async () => {
    const { user, token } = await authUser();
    const store = await createStore(user.id);
    const pm = await createPaymentMethodRow(store.id);
    const order = await createOrderRow(store.id, pm.id, "pending_payment");

    const res = await api(
      `/api/stores/${store.id}/orders/${order.id}/status`,
      { method: "PATCH", token, body: { status: "paid" } },
    );
    expect(res.status).toBe(200);
    expect(res.json.data.order.status).toBe("paid");
  });

  it("returns 404 for non-existent order", async () => {
    const { user, token } = await authUser();
    const store = await createStore(user.id);

    const res = await api(
      `/api/stores/${store.id}/orders/non-existent-id`,
      { token },
    );
    expect(res.status).toBe(404);
  });
});
