import { eq } from "drizzle-orm";
import { afterEach, describe, expect, it, vi } from "vitest";
import { users } from "../src/db/schema";
import { createOAuthState } from "../src/lib/oauth";
import { getUserSession } from "../src/lib/session";
import { upsertUserFromOAuth } from "../src/services/auth";
import { api, authUser, db, env } from "./helpers";

afterEach(() => vi.unstubAllGlobals());

function stubOAuthFetch(profile: Record<string, unknown>) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL) => {
      const url = typeof input === "string" ? input : (input as Request).url;
      const body = url.includes("/token")
        ? { access_token: "test-token" }
        : profile;
      return new Response(JSON.stringify(body), {
        headers: { "content-type": "application/json" },
      });
    }),
  );
}

describe("oauth auth", () => {
  it("redirects to the provider with a stored CSRF state", async () => {
    const res = await api("/api/auth/oauth/google");
    expect(res.status).toBe(302);
    const location = res.res.headers.get("location") ?? "";
    expect(location).toContain("accounts.google.com");
    const state = new URL(location).searchParams.get("state") ?? "";
    expect(state).not.toBe("");
    expect(await env.KV_SESSIONS.get(`oauth_state:${state}`)).toBeTruthy();
  });

  it("handles the callback: creates the user and issues a session", async () => {
    const state = await createOAuthState(env.KV_SESSIONS, {
      provider: "google",
      subjectType: "user",
    });
    stubOAuthFetch({ id: "g-123", email: "oauth@test.dev", name: "OAuth User" });

    const res = await api(`/api/auth/oauth/google/callback?code=abc&state=${state}`);
    expect(res.status).toBe(200);
    expect(res.json.data.token).toBeTruthy();

    const user = await db().query.users.findFirst({
      where: eq(users.email, "oauth@test.dev"),
    });
    expect(user?.provider).toBe("google");
    const session = await getUserSession(env, res.json.data.token);
    expect(session?.userId).toBe(user!.id);
  });

  it("rejects a callback with an unknown state", async () => {
    const res = await api("/api/auth/oauth/google/callback?code=abc&state=nope");
    expect(res.json.status).toBe("fail");
  });

  it("logout invalidates the session in KV", async () => {
    const { token } = await authUser();
    expect(await getUserSession(env, token)).not.toBeNull();
    const res = await api("/api/auth/logout", { method: "POST", token });
    expect(res.status).toBe(200);
    expect(await getUserSession(env, token)).toBeNull();
  });

  it("upserts (updates) an existing user on a second login", async () => {
    const first = await upsertUserFromOAuth(db(), "github", {
      providerId: "1",
      email: "up@test.dev",
      name: "First",
    });
    const second = await upsertUserFromOAuth(db(), "github", {
      providerId: "1",
      email: "up@test.dev",
      name: "Second",
      avatarUrl: "http://example.com/a.png",
    });
    expect(second.id).toBe(first.id);
    expect(second.name).toBe("Second");
  });
});
