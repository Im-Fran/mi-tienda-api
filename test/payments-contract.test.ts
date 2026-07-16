/**
 * Tests for the listPaymentMethods contract:
 * backend must return { methods: PaymentMethod[] } instead of a bare array.
 */
import { describe, expect, it } from "vitest";
import { api, authUser, createStore } from "./helpers";

describe("payments – list contract", () => {
  it("GET /payments/methods returns { methods } shape (not a bare array)", async () => {
    const { user, token } = await authUser();
    const store = await createStore(user.id);

    const res = await api(`/api/stores/${store.id}/payments/methods`, { token });
    expect(res.status).toBe(200);

    const data = res.json.data;
    expect(Array.isArray(data.methods)).toBe(true);
    expect(Array.isArray(data)).toBe(false);
  });
});
