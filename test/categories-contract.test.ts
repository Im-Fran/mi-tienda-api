/**
 * Tests for the corrected listCategories contract:
 * backend must return { categories: CategoryNode[] } instead of a bare array.
 */
import { describe, expect, it } from "vitest";
import { api, authUser, createStore } from "./helpers";

describe("categories – list contract", () => {
  it("GET /categories returns { categories } shape (not a bare array)", async () => {
    const { user, token } = await authUser();
    const store = await createStore(user.id);

    const res = await api(`/api/stores/${store.id}/categories`, { token });
    expect(res.status).toBe(200);

    const data = res.json.data;
    // Must have categories array
    expect(Array.isArray(data.categories)).toBe(true);
    // Must NOT be a bare array at the data level
    expect(Array.isArray(data)).toBe(false);
  });

  it("creates a root category and it appears in the tree", async () => {
    const { user, token } = await authUser();
    const store = await createStore(user.id);

    const createRes = await api(`/api/stores/${store.id}/categories`, {
      method: "POST",
      token,
      body: { name: "Clothing" },
    });
    expect(createRes.status).toBe(201);
    expect(createRes.json.data.category.name).toBe("Clothing");
    expect(createRes.json.data.category.slug).toBe("clothing");

    const listRes = await api(`/api/stores/${store.id}/categories`, { token });
    expect(listRes.status).toBe(200);
    expect(listRes.json.data.categories).toHaveLength(1);
    expect(listRes.json.data.categories[0].name).toBe("Clothing");
  });

  it("builds a nested tree with children", async () => {
    const { user, token } = await authUser();
    const store = await createStore(user.id);

    const parent = await api(`/api/stores/${store.id}/categories`, {
      method: "POST",
      token,
      body: { name: "Electronics" },
    });
    const parentId = parent.json.data.category.id;

    await api(`/api/stores/${store.id}/categories`, {
      method: "POST",
      token,
      body: { name: "Phones", parentId },
    });

    const listRes = await api(`/api/stores/${store.id}/categories`, { token });
    expect(listRes.status).toBe(200);
    const cats = listRes.json.data.categories;
    expect(cats).toHaveLength(1);
    expect(cats[0].children).toHaveLength(1);
    expect(cats[0].children[0].name).toBe("Phones");
  });

  it("PATCH /categories/:id updates a category", async () => {
    const { user, token } = await authUser();
    const store = await createStore(user.id);

    const createRes = await api(`/api/stores/${store.id}/categories`, {
      method: "POST",
      token,
      body: { name: "Old Name" },
    });
    const catId = createRes.json.data.category.id;

    const patchRes = await api(
      `/api/stores/${store.id}/categories/${catId}`,
      { method: "PATCH", token, body: { name: "New Name" } },
    );
    expect(patchRes.status).toBe(200);
    expect(patchRes.json.data.category.name).toBe("New Name");
  });

  it("DELETE /categories/:id returns { deleted: true }", async () => {
    const { user, token } = await authUser();
    const store = await createStore(user.id);

    const createRes = await api(`/api/stores/${store.id}/categories`, {
      method: "POST",
      token,
      body: { name: "To Delete" },
    });
    const catId = createRes.json.data.category.id;

    const delRes = await api(`/api/stores/${store.id}/categories/${catId}`, {
      method: "DELETE",
      token,
    });
    expect(delRes.status).toBe(200);
    expect(delRes.json.data.deleted).toBe(true);

    const listRes = await api(`/api/stores/${store.id}/categories`, { token });
    expect(listRes.json.data.categories).toHaveLength(0);
  });

  it("prevents deletion of a category with children without recursive flag", async () => {
    const { user, token } = await authUser();
    const store = await createStore(user.id);

    const parent = await api(`/api/stores/${store.id}/categories`, {
      method: "POST",
      token,
      body: { name: "Parent" },
    });
    const parentId = parent.json.data.category.id;

    await api(`/api/stores/${store.id}/categories`, {
      method: "POST",
      token,
      body: { name: "Child", parentId },
    });

    const delRes = await api(
      `/api/stores/${store.id}/categories/${parentId}`,
      { method: "DELETE", token },
    );
    expect(delRes.status).toBe(409);

    const recursiveRes = await api(
      `/api/stores/${store.id}/categories/${parentId}?recursive=true`,
      { method: "DELETE", token },
    );
    expect(recursiveRes.status).toBe(200);
  });
});

describe("categories – slug editing", () => {
  it("PATCH with explicit slug updates it correctly", async () => {
    const { user, token } = await authUser();
    const store = await createStore(user.id);

    const createRes = await api(`/api/stores/${store.id}/categories`, {
      method: "POST",
      token,
      body: { name: "Ropa" },
    });
    expect(createRes.status).toBe(201);
    const catId = createRes.json.data.category.id;

    const patchRes = await api(
      `/api/stores/${store.id}/categories/${catId}`,
      { method: "PATCH", token, body: { slug: "nuevo-slug" } },
    );
    expect(patchRes.status).toBe(200);
    expect(patchRes.json.data.category.slug).toBe("nuevo-slug");
  });

  it("PATCH with the same slug the category already has does not fail", async () => {
    const { user, token } = await authUser();
    const store = await createStore(user.id);

    const createRes = await api(`/api/stores/${store.id}/categories`, {
      method: "POST",
      token,
      body: { name: "Calzado" },
    });
    expect(createRes.status).toBe(201);
    const catId = createRes.json.data.category.id;
    const currentSlug = createRes.json.data.category.slug;

    const patchRes = await api(
      `/api/stores/${store.id}/categories/${catId}`,
      { method: "PATCH", token, body: { slug: currentSlug } },
    );
    expect(patchRes.status).toBe(200);
    expect(patchRes.json.data.category.slug).toBe(currentSlug);
  });

  it("PATCH with a slug already used by another category in the same store returns a suffixed slug", async () => {
    const { user, token } = await authUser();
    const store = await createStore(user.id);

    const firstRes = await api(`/api/stores/${store.id}/categories`, {
      method: "POST",
      token,
      body: { name: "Ropa", slug: "ropa" },
    });
    expect(firstRes.status).toBe(201);

    const secondRes = await api(`/api/stores/${store.id}/categories`, {
      method: "POST",
      token,
      body: { name: "Ropa Nueva" },
    });
    expect(secondRes.status).toBe(201);
    const secondId = secondRes.json.data.category.id;

    const patchRes = await api(
      `/api/stores/${store.id}/categories/${secondId}`,
      { method: "PATCH", token, body: { slug: "ropa" } },
    );
    expect(patchRes.status).toBe(200);
    expect(patchRes.json.data.category.slug).toMatch(/^ropa-\d+$/);
  });

  it("PATCH with an invalid slug returns 400", async () => {
    const { user, token } = await authUser();
    const store = await createStore(user.id);

    const createRes = await api(`/api/stores/${store.id}/categories`, {
      method: "POST",
      token,
      body: { name: "Electrodomésticos" },
    });
    expect(createRes.status).toBe(201);
    const catId = createRes.json.data.category.id;

    const patchRes = await api(
      `/api/stores/${store.id}/categories/${catId}`,
      { method: "PATCH", token, body: { slug: "Slug Con Mayúsculas!" } },
    );
    // Hono + Zod devuelve 422 Unprocessable Entity para errores de validación de esquema
    expect(patchRes.status).toBe(422);
  });
});
