import type { Env } from "../types";
import { AppError } from "./errors";
import { randomToken } from "./crypto";

export type OAuthProvider = "google" | "github";
export type OAuthSubject = "user" | "customer";

export interface OAuthProfile {
  providerId: string;
  email: string;
  name?: string;
  avatarUrl?: string;
}

export function isOAuthProvider(value: string): value is OAuthProvider {
  return value === "google" || value === "github";
}

// ---- CSRF state (stored in the relevant KV namespace) ----

interface OAuthStatePayload {
  provider: OAuthProvider;
  subjectType: OAuthSubject;
}

export async function createOAuthState(
  kv: KVNamespace,
  payload: OAuthStatePayload,
): Promise<string> {
  const state = randomToken(16);
  await kv.put(`oauth_state:${state}`, JSON.stringify(payload), {
    expirationTtl: 600,
  });
  return state;
}

export async function consumeOAuthState(
  kv: KVNamespace,
  state: string,
): Promise<OAuthStatePayload | null> {
  const raw = await kv.get(`oauth_state:${state}`);
  if (!raw) return null;
  await kv.delete(`oauth_state:${state}`);
  return JSON.parse(raw) as OAuthStatePayload;
}

// ---- Authorization URL ----

export function getAuthorizeUrl(
  env: Env,
  provider: OAuthProvider,
  redirectUri: string,
  state: string,
): string {
  if (provider === "google") {
    const params = new URLSearchParams({
      client_id: env.GOOGLE_CLIENT_ID,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "openid email profile",
      state,
      access_type: "online",
      prompt: "select_account",
    });
    return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
  }
  const params = new URLSearchParams({
    client_id: env.GITHUB_CLIENT_ID,
    redirect_uri: redirectUri,
    scope: "read:user user:email",
    state,
    allow_signup: "true",
  });
  return `https://github.com/login/oauth/authorize?${params}`;
}

// ---- Token exchange ----

export async function exchangeCodeForToken(
  env: Env,
  provider: OAuthProvider,
  code: string,
  redirectUri: string,
): Promise<string> {
  const endpoint =
    provider === "google"
      ? "https://oauth2.googleapis.com/token"
      : "https://github.com/login/oauth/access_token";

  const body = new URLSearchParams(
    provider === "google"
      ? {
          client_id: env.GOOGLE_CLIENT_ID,
          client_secret: env.GOOGLE_CLIENT_SECRET,
          code,
          grant_type: "authorization_code",
          redirect_uri: redirectUri,
        }
      : {
          client_id: env.GITHUB_CLIENT_ID,
          client_secret: env.GITHUB_CLIENT_SECRET,
          code,
          redirect_uri: redirectUri,
        },
  );

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      accept: "application/json",
    },
    body,
  });
  if (!res.ok) throw new AppError("OAuth token exchange failed", 502);
  const json = (await res.json()) as { access_token?: string };
  if (!json.access_token) throw new AppError("OAuth token missing", 502);
  return json.access_token;
}

// ---- Profile fetch ----

export async function fetchOAuthProfile(
  provider: OAuthProvider,
  accessToken: string,
): Promise<OAuthProfile> {
  if (provider === "google") {
    const res = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) throw new AppError("Failed to fetch Google profile", 502);
    const u = (await res.json()) as {
      id: string;
      email: string;
      name?: string;
      picture?: string;
    };
    return {
      providerId: u.id,
      email: u.email,
      name: u.name,
      avatarUrl: u.picture,
    };
  }

  const headers = {
    authorization: `Bearer ${accessToken}`,
    "user-agent": "mi-tienda-api",
    accept: "application/vnd.github+json",
  };
  const res = await fetch("https://api.github.com/user", { headers });
  if (!res.ok) throw new AppError("Failed to fetch GitHub profile", 502);
  const u = (await res.json()) as {
    id: number;
    login: string;
    name?: string | null;
    avatar_url?: string;
    email?: string | null;
  };

  let email = u.email ?? null;
  if (!email) {
    const er = await fetch("https://api.github.com/user/emails", { headers });
    if (er.ok) {
      const emails = (await er.json()) as Array<{
        email: string;
        primary: boolean;
        verified: boolean;
      }>;
      email =
        emails.find((e) => e.primary && e.verified)?.email ??
        emails.find((e) => e.verified)?.email ??
        emails[0]?.email ??
        null;
    }
  }
  if (!email) throw new AppError("GitHub account has no accessible email", 400);

  return {
    providerId: String(u.id),
    email,
    name: u.name ?? u.login,
    avatarUrl: u.avatar_url,
  };
}
