import { describe, expect, it } from "vitest";
import { api, authUser, createStore } from "./helpers";

describe("stores", () => {
  it("enforces a maximum of 3 stores per user", async () => {
    const { token } = await authUser();
    for (let i = 0; i < 3; i++) {
      const res = await api("/api/stores", {
        method: "POST",
        body: { name: `Store ${i}` },
        token,
      });
      expect(res.status).toBe(201);
    }
    const fourth = await api("/api/stores", {
      method: "POST",
      body: { name: "Store 4" },
      token,
    });
    expect(fourth.status).toBe(409);
    expect(fourth.json.status).toBe("fail");
  });

  it("store context rejects non-owners and allows the owner", async () => {
    const owner = await authUser();
    const intruder = await authUser();
    const store = await createStore(owner.user.id);

    const denied = await api(`/api/stores/${store.id}`, { token: intruder.token });
    expect(denied.status).toBe(403);

    const allowed = await api(`/api/stores/${store.id}`, { token: owner.token });
    expect(allowed.status).toBe(200);
    expect(allowed.json.data.store.id).toBe(store.id);
  });

  it("requires authentication to list stores", async () => {
    const res = await api("/api/stores");
    expect(res.status).toBe(401);
  });

  it("generates a unique slug from the name", async () => {
    const { token } = await authUser();
    const a = await api("/api/stores", {
      method: "POST",
      body: { name: "My Shop" },
      token,
    });
    const b = await api("/api/stores", {
      method: "POST",
      body: { name: "My Shop" },
      token,
    });
    expect(a.json.data.store.slug).toBe("my-shop");
    expect(b.json.data.store.slug).not.toBe("my-shop");
  });
});
