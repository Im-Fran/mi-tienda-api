import { eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { productVariants } from "../src/db/schema";
import {
  api,
  authUser,
  createProductWithVariant,
  createStore,
  db,
  env,
} from "./helpers";

describe("products", () => {
  it("creates a product with variants and reads it back", async () => {
    const { user, token } = await authUser();
    const store = await createStore(user.id);

    const res = await api(`/api/stores/${store.id}/products`, {
      method: "POST",
      token,
      body: {
        name: "Hoodie",
        type: "physical",
        variants: [
          { name: "Small", price: 2500, stock: 4, options: [{ optionName: "size", optionValue: "S" }] },
        ],
      },
    });
    expect(res.status).toBe(201);
    const productId = res.json.data.product.id;

    const detail = await api(`/api/stores/${store.id}/products/${productId}`, {
      token,
    });
    expect(detail.status).toBe(200);
    expect(detail.json.data.product.variants).toHaveLength(1);
    expect(detail.json.data.product.variants[0].stock).toBe(4);
  });

  it("tracks variant stock through updates", async () => {
    const { user, token } = await authUser();
    const store = await createStore(user.id);
    const { product, variant } = await createProductWithVariant(store.id, {
      stock: 10,
    });

    const res = await api(
      `/api/stores/${store.id}/products/${product.id}/variants/${variant.id}`,
      { method: "PATCH", token, body: { stock: 2 } },
    );
    expect(res.status).toBe(200);
    const fresh = await db().query.productVariants.findFirst({
      where: eq(productVariants.id, variant.id),
    });
    expect(fresh?.stock).toBe(2);
  });

  it("deletes the R2 object when a product image is removed via product delete", async () => {
    const { user, token } = await authUser();
    const store = await createStore(user.id);
    const { product } = await createProductWithVariant(store.id);

    const form = new FormData();
    form.append(
      "image",
      new Blob([new Uint8Array([1, 2, 3, 4])], { type: "image/png" }),
      "pic.png",
    );
    const upload = await api(
      `/api/stores/${store.id}/products/${product.id}/images`,
      { method: "POST", token, body: form, raw: true },
    );
    expect(upload.status).toBe(201);
    const key = upload.json.data.images[0].r2Key;
    expect(await env.R2_BUCKET.get(key)).not.toBeNull();

    const del = await api(`/api/stores/${store.id}/products/${product.id}`, {
      method: "DELETE",
      token,
    });
    expect(del.status).toBe(200);
    // R2 object must be cleaned up (business rule 7).
    expect(await env.R2_BUCKET.get(key)).toBeNull();
  });
});
