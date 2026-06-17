import { eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { magicLinks, users } from "../src/db/schema";
import { hashToken, createMagicLink } from "../src/lib/magic-link";
import { randomToken } from "../src/lib/crypto";
import { getUserSession } from "../src/lib/session";
import { api, db, env } from "./helpers";

describe("magic link auth", () => {
  it("stores only a hashed token and always responds success", async () => {
    const email = "request@test.dev";
    const { status, json } = await api("/api/auth/magic-link", {
      method: "POST",
      body: { email },
    });
    expect(status).toBe(200);
    expect(json.status).toBe("success");

    const rows = await db()
      .select()
      .from(magicLinks)
      .where(eq(magicLinks.email, email));
    expect(rows).toHaveLength(1);
    // SHA-256 hex is 64 chars and is never the raw token.
    expect(rows[0].tokenHash).toHaveLength(64);
    expect(rows[0].subjectType).toBe("user");
    expect(rows[0].consumed).toBe(false);
  });

  it("verifies a valid token, creates the user, and issues a session", async () => {
    const email = "verify@test.dev";
    const rawToken = await createMagicLink(db(), email, "user");

    const { status, json } = await api(
      `/api/auth/magic-link/verify?token=${rawToken}&email=${email}`,
    );
    expect(status).toBe(200);
    expect(json.status).toBe("success");
    expect(json.data.token).toBeTruthy();

    const user = await db().query.users.findFirst({
      where: eq(users.email, email),
    });
    expect(user).toBeTruthy();

    const session = await getUserSession(env, json.data.token);
    expect(session?.userId).toBe(user!.id);
  });

  it("rejects a reused token", async () => {
    const email = "reuse@test.dev";
    const rawToken = await createMagicLink(db(), email, "user");

    const first = await api(
      `/api/auth/magic-link/verify?token=${rawToken}&email=${email}`,
    );
    expect(first.json.status).toBe("success");

    const second = await api(
      `/api/auth/magic-link/verify?token=${rawToken}&email=${email}`,
    );
    expect(second.json.status).toBe("fail");
  });

  it("rejects an expired token", async () => {
    const email = "expired@test.dev";
    const rawToken = randomToken(32);
    const tokenHash = await hashToken(rawToken);
    await db()
      .insert(magicLinks)
      .values({
        email,
        tokenHash,
        subjectType: "user",
        expiresAt: new Date(Date.now() - 60_000),
      });

    const { json } = await api(
      `/api/auth/magic-link/verify?token=${rawToken}&email=${email}`,
    );
    expect(json.status).toBe("fail");
  });

  it("rejects an invalid token", async () => {
    const { json } = await api(
      "/api/auth/magic-link/verify?token=not-a-real-token&email=nobody@test.dev",
    );
    expect(json.status).toBe("fail");
  });

  it("keeps user and customer magic links separate", async () => {
    const email = "shared@test.dev";
    // A token minted for a customer must not authenticate a user.
    const rawToken = await createMagicLink(db(), email, "customer");
    const asUser = await api(
      `/api/auth/magic-link/verify?token=${rawToken}&email=${email}`,
    );
    expect(asUser.json.status).toBe("fail");

    const asCustomer = await api(
      `/api/auth/customer/magic-link/verify?token=${rawToken}&email=${email}`,
    );
    expect(asCustomer.json.status).toBe("success");
  });
});
