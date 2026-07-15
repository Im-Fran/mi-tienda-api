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

describe("categories – sortOrder reordering", () => {
  it("PATCH with sortOrder: 0 and parentId returns 200", async () => {
    const { user, token } = await authUser();
    const store = await createStore(user.id);

    const parentRes = await api(`/api/stores/${store.id}/categories`, {
      method: "POST",
      token,
      body: { name: "Parent" },
    });
    expect(parentRes.status).toBe(201);
    const parentId = parentRes.json.data.category.id;

    const childRes = await api(`/api/stores/${store.id}/categories`, {
      method: "POST",
      token,
      body: { name: "Child", parentId },
    });
    expect(childRes.status).toBe(201);
    const catId = childRes.json.data.category.id;

    // sortOrder: 0 con parentId — debe aceptarse sin 422
    const patchRes = await api(
      `/api/stores/${store.id}/categories/${catId}`,
      { method: "PATCH", token, body: { sortOrder: 0, parentId } },
    );
    expect(patchRes.status).toBe(200);
    expect(patchRes.json.data.category.sortOrder).toBe(0);
  });

  it("PATCH with sortOrder: -1 (negative value for prepend) returns 200", async () => {
    const { user, token } = await authUser();
    const store = await createStore(user.id);

    const createRes = await api(`/api/stores/${store.id}/categories`, {
      method: "POST",
      token,
      body: { name: "Reorderable" },
    });
    expect(createRes.status).toBe(201);
    const catId = createRes.json.data.category.id;

    // sortOrder negativo — el algoritmo de reordenamiento puede generarlos
    const patchRes = await api(
      `/api/stores/${store.id}/categories/${catId}`,
      { method: "PATCH", token, body: { sortOrder: -1 } },
    );
    expect(patchRes.status).toBe(200);
    expect(patchRes.json.data.category.sortOrder).toBe(-1);
  });

  it("PATCH with sortOrder: 0 only returns 200", async () => {
    const { user, token } = await authUser();
    const store = await createStore(user.id);

    const createRes = await api(`/api/stores/${store.id}/categories`, {
      method: "POST",
      token,
      body: { name: "Zero Order" },
    });
    expect(createRes.status).toBe(201);
    const catId = createRes.json.data.category.id;

    const patchRes = await api(
      `/api/stores/${store.id}/categories/${catId}`,
      { method: "PATCH", token, body: { sortOrder: 0 } },
    );
    expect(patchRes.status).toBe(200);
    expect(patchRes.json.data.category.sortOrder).toBe(0);
  });
});

describe("categories – slug scoped per parent", () => {
  it("same-name subcategories under different parents both get the bare slug (no suffix)", async () => {
    const { user, token } = await authUser();
    const store = await createStore(user.id);

    const macbook = await api(`/api/stores/${store.id}/categories`, {
      method: "POST",
      token,
      body: { name: "MacBook" },
    });
    const iphone = await api(`/api/stores/${store.id}/categories`, {
      method: "POST",
      token,
      body: { name: "iPhone" },
    });
    const macbookId = macbook.json.data.category.id;
    const iphoneId = iphone.json.data.category.id;

    const airUnderMacbook = await api(`/api/stores/${store.id}/categories`, {
      method: "POST",
      token,
      body: { name: "Air", parentId: macbookId },
    });
    expect(airUnderMacbook.status).toBe(201);
    expect(airUnderMacbook.json.data.category.slug).toBe("air");

    const airUnderIphone = await api(`/api/stores/${store.id}/categories`, {
      method: "POST",
      token,
      body: { name: "Air", parentId: iphoneId },
    });
    expect(airUnderIphone.status).toBe(201);
    expect(airUnderIphone.json.data.category.slug).toBe("air");
  });

  it("same-name subcategories under the SAME parent still get suffixed", async () => {
    const { user, token } = await authUser();
    const store = await createStore(user.id);

    const macbook = await api(`/api/stores/${store.id}/categories`, {
      method: "POST",
      token,
      body: { name: "MacBook" },
    });
    const macbookId = macbook.json.data.category.id;

    const first = await api(`/api/stores/${store.id}/categories`, {
      method: "POST",
      token,
      body: { name: "Air", parentId: macbookId },
    });
    expect(first.status).toBe(201);
    expect(first.json.data.category.slug).toBe("air");

    const second = await api(`/api/stores/${store.id}/categories`, {
      method: "POST",
      token,
      body: { name: "Air", parentId: macbookId },
    });
    expect(second.status).toBe(201);
    expect(second.json.data.category.slug).toMatch(/^air-\d+$/);
  });

  it("reparenting to a parent that already has this slug is blocked with 409, without renaming", async () => {
    const { user, token } = await authUser();
    const store = await createStore(user.id);

    const macbook = await api(`/api/stores/${store.id}/categories`, {
      method: "POST",
      token,
      body: { name: "MacBook" },
    });
    const iphone = await api(`/api/stores/${store.id}/categories`, {
      method: "POST",
      token,
      body: { name: "iPhone" },
    });
    const macbookId = macbook.json.data.category.id;
    const iphoneId = iphone.json.data.category.id;

    await api(`/api/stores/${store.id}/categories`, {
      method: "POST",
      token,
      body: { name: "Air", parentId: macbookId },
    });
    const airUnderIphone = await api(`/api/stores/${store.id}/categories`, {
      method: "POST",
      token,
      body: { name: "Air", parentId: iphoneId },
    });
    const airIphoneId = airUnderIphone.json.data.category.id;

    const patchRes = await api(
      `/api/stores/${store.id}/categories/${airIphoneId}`,
      { method: "PATCH", token, body: { parentId: macbookId } },
    );
    expect(patchRes.status).toBe(409);

    const listRes = await api(`/api/stores/${store.id}/categories`, { token });
    const iphoneNode = listRes.json.data.categories.find(
      (c: { id: string }) => c.id === iphoneId,
    );
    expect(iphoneNode.children).toHaveLength(1);
    expect(iphoneNode.children[0].id).toBe(airIphoneId);
  });

  it("reparenting to a parent without a slug conflict is allowed and keeps the slug", async () => {
    const { user, token } = await authUser();
    const store = await createStore(user.id);

    const macbook = await api(`/api/stores/${store.id}/categories`, {
      method: "POST",
      token,
      body: { name: "MacBook" },
    });
    const samsung = await api(`/api/stores/${store.id}/categories`, {
      method: "POST",
      token,
      body: { name: "Samsung" },
    });
    const macbookId = macbook.json.data.category.id;
    const samsungId = samsung.json.data.category.id;

    const air = await api(`/api/stores/${store.id}/categories`, {
      method: "POST",
      token,
      body: { name: "Air", parentId: macbookId },
    });
    const airId = air.json.data.category.id;

    const patchRes = await api(
      `/api/stores/${store.id}/categories/${airId}`,
      { method: "PATCH", token, body: { parentId: samsungId } },
    );
    expect(patchRes.status).toBe(200);
    expect(patchRes.json.data.category.slug).toBe("air");
    expect(patchRes.json.data.category.parentId).toBe(samsungId);
  });

  it("changing slug and parentId together toward a conflicting target is blocked with 409", async () => {
    const { user, token } = await authUser();
    const store = await createStore(user.id);

    const macbook = await api(`/api/stores/${store.id}/categories`, {
      method: "POST",
      token,
      body: { name: "MacBook" },
    });
    const iphone = await api(`/api/stores/${store.id}/categories`, {
      method: "POST",
      token,
      body: { name: "iPhone" },
    });
    const macbookId = macbook.json.data.category.id;
    const iphoneId = iphone.json.data.category.id;

    await api(`/api/stores/${store.id}/categories`, {
      method: "POST",
      token,
      body: { name: "Air", parentId: macbookId },
    });
    const other = await api(`/api/stores/${store.id}/categories`, {
      method: "POST",
      token,
      body: { name: "Pro", parentId: iphoneId },
    });
    const otherId = other.json.data.category.id;

    const patchRes = await api(
      `/api/stores/${store.id}/categories/${otherId}`,
      {
        method: "PATCH",
        token,
        body: { parentId: macbookId, slug: "air" },
      },
    );
    expect(patchRes.status).toBe(409);
  });
});
