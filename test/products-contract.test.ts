/**
 * Tests for the corrected listProducts contract:
 * backend must return { products, pagination } instead of { items, total, page, perPage }.
 */
import { describe, expect, it } from "vitest";
import {
  api,
  authUser,
  createProductWithVariant,
  createStore,
} from "./helpers";

describe("products – list contract", () => {
  it("GET /products returns { products, pagination } shape", async () => {
    const { user, token } = await authUser();
    const store = await createStore(user.id);
    await createProductWithVariant(store.id, { price: 1000 });
    await createProductWithVariant(store.id, { price: 2000 });

    const res = await api(`/api/stores/${store.id}/products`, { token });
    expect(res.status).toBe(200);

    const data = res.json.data;
    // Must have products array (not items)
    expect(Array.isArray(data.products)).toBe(true);
    expect(data.products).toHaveLength(2);
    // Must have pagination object
    expect(data.pagination).toBeDefined();
    expect(data.pagination.total).toBe(2);
    expect(data.pagination.page).toBe(1);
    expect(data.pagination.perPage).toBeGreaterThan(0);
    expect(data.pagination.totalPages).toBe(1);
    // Must NOT have old shape
    expect(data.items).toBeUndefined();
  });

  it("pagination.totalPages is computed correctly", async () => {
    const { user, token } = await authUser();
    const store = await createStore(user.id);
    for (let i = 0; i < 3; i++) {
      await createProductWithVariant(store.id);
    }

    const res = await api(
      `/api/stores/${store.id}/products?page=1&perPage=2`,
      { token },
    );
    expect(res.status).toBe(200);
    const { pagination } = res.json.data;
    expect(pagination.total).toBe(3);
    expect(pagination.totalPages).toBe(2);
    expect(pagination.perPage).toBe(2);
  });

  it("filters by type=digital", async () => {
    const { user, token } = await authUser();
    const store = await createStore(user.id);
    await createProductWithVariant(store.id, { type: "physical" });
    await createProductWithVariant(store.id, { type: "digital" });

    const res = await api(
      `/api/stores/${store.id}/products?type=digital`,
      { token },
    );
    expect(res.status).toBe(200);
    expect(res.json.data.products).toHaveLength(1);
    expect(res.json.data.products[0].type).toBe("digital");
  });

  it("GET /products/:id returns { product } with variants and images", async () => {
    const { user, token } = await authUser();
    const store = await createStore(user.id);
    const { product } = await createProductWithVariant(store.id, { price: 3500 });

    const res = await api(`/api/stores/${store.id}/products/${product.id}`, { token });
    expect(res.status).toBe(200);
    expect(res.json.data.product.id).toBe(product.id);
    expect(Array.isArray(res.json.data.product.variants)).toBe(true);
    expect(Array.isArray(res.json.data.product.images)).toBe(true);
  });

  it("POST /products returns 201 with { product }", async () => {
    const { user, token } = await authUser();
    const store = await createStore(user.id);

    const res = await api(`/api/stores/${store.id}/products`, {
      method: "POST",
      token,
      body: {
        name: "Test T-Shirt",
        type: "physical",
        isActive: true,
        variants: [{ name: "M", price: 1500, stock: 5 }],
      },
    });
    expect(res.status).toBe(201);
    expect(res.json.data.product.name).toBe("Test T-Shirt");
    expect(res.json.data.product.variants).toHaveLength(1);
  });

  it("PATCH /products/:id returns { product }", async () => {
    const { user, token } = await authUser();
    const store = await createStore(user.id);
    const { product } = await createProductWithVariant(store.id);

    const res = await api(`/api/stores/${store.id}/products/${product.id}`, {
      method: "PATCH",
      token,
      body: { name: "Updated Name", isActive: false },
    });
    expect(res.status).toBe(200);
    expect(res.json.data.product.name).toBe("Updated Name");
    expect(res.json.data.product.isActive).toBe(false);
  });

  it("DELETE /products/:id returns { deleted: true }", async () => {
    const { user, token } = await authUser();
    const store = await createStore(user.id);
    const { product } = await createProductWithVariant(store.id);

    const res = await api(`/api/stores/${store.id}/products/${product.id}`, {
      method: "DELETE",
      token,
    });
    expect(res.status).toBe(200);
    expect(res.json.data.deleted).toBe(true);
  });

  it("returns 404 for non-existent product", async () => {
    const { user, token } = await authUser();
    const store = await createStore(user.id);

    const res = await api(
      `/api/stores/${store.id}/products/non-existent-id`,
      { token },
    );
    expect(res.status).toBe(404);
    expect(res.json.status).toBe("fail");
  });
});

describe("products – variants contract", () => {
  it("POST /products/:id/variants returns { variant }", async () => {
    const { user, token } = await authUser();
    const store = await createStore(user.id);
    const { product } = await createProductWithVariant(store.id);

    const res = await api(
      `/api/stores/${store.id}/products/${product.id}/variants`,
      {
        method: "POST",
        token,
        body: { name: "XL", price: 2000, stock: 3 },
      },
    );
    expect(res.status).toBe(201);
    expect(res.json.data.variant.name).toBe("XL");
    expect(res.json.data.variant.price).toBe(2000);
  });

  it("PATCH /products/:id/variants/:variantId returns { variant }", async () => {
    const { user, token } = await authUser();
    const store = await createStore(user.id);
    const { product, variant } = await createProductWithVariant(store.id, {
      price: 1000,
    });

    const res = await api(
      `/api/stores/${store.id}/products/${product.id}/variants/${variant.id}`,
      { method: "PATCH", token, body: { price: 2500 } },
    );
    expect(res.status).toBe(200);
    expect(res.json.data.variant.price).toBe(2500);
  });

  it("DELETE /products/:id/variants/:variantId returns { deleted: true }", async () => {
    const { user, token } = await authUser();
    const store = await createStore(user.id);
    const { product, variant } = await createProductWithVariant(store.id);

    // Add a second variant first so we can delete the first
    await api(`/api/stores/${store.id}/products/${product.id}/variants`, {
      method: "POST",
      token,
      body: { name: "L", price: 1500 },
    });

    const res = await api(
      `/api/stores/${store.id}/products/${product.id}/variants/${variant.id}`,
      { method: "DELETE", token },
    );
    expect(res.status).toBe(200);
    expect(res.json.data.deleted).toBe(true);
  });
});
