import type {
  CustomerSessionData,
  Env,
  SessionData,
} from "../types";
import { randomToken } from "./crypto";

const USER_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days
const CUSTOMER_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days
const KEY = (token: string) => `session:${token}`;

// ---- User sessions (KV_SESSIONS) ----

export async function createUserSession(
  env: Env,
  userId: string,
): Promise<string> {
  const token = randomToken(32);
  const now = Date.now();
  const data: SessionData = {
    userId,
    createdAt: now,
    expiresAt: now + USER_TTL_SECONDS * 1000,
  };
  await env.KV_SESSIONS.put(KEY(token), JSON.stringify(data), {
    expirationTtl: USER_TTL_SECONDS,
  });
  return token;
}

export async function getUserSession(
  env: Env,
  token: string,
): Promise<SessionData | null> {
  const raw = await env.KV_SESSIONS.get(KEY(token));
  if (!raw) return null;
  const data = JSON.parse(raw) as SessionData;
  if (data.expiresAt <= Date.now()) {
    await env.KV_SESSIONS.delete(KEY(token));
    return null;
  }
  return data;
}

export async function destroyUserSession(
  env: Env,
  token: string,
): Promise<void> {
  await env.KV_SESSIONS.delete(KEY(token));
}

// ---- Customer sessions (KV_CUSTOMER_SESSIONS) ----

export async function createCustomerSession(
  env: Env,
  customerId: string,
): Promise<string> {
  const token = randomToken(32);
  const now = Date.now();
  const data: CustomerSessionData = {
    customerId,
    createdAt: now,
    expiresAt: now + CUSTOMER_TTL_SECONDS * 1000,
  };
  await env.KV_CUSTOMER_SESSIONS.put(KEY(token), JSON.stringify(data), {
    expirationTtl: CUSTOMER_TTL_SECONDS,
  });
  return token;
}

export async function getCustomerSession(
  env: Env,
  token: string,
): Promise<CustomerSessionData | null> {
  const raw = await env.KV_CUSTOMER_SESSIONS.get(KEY(token));
  if (!raw) return null;
  const data = JSON.parse(raw) as CustomerSessionData;
  if (data.expiresAt <= Date.now()) {
    await env.KV_CUSTOMER_SESSIONS.delete(KEY(token));
    return null;
  }
  return data;
}

export async function destroyCustomerSession(
  env: Env,
  token: string,
): Promise<void> {
  await env.KV_CUSTOMER_SESSIONS.delete(KEY(token));
}

/** Extract a Bearer token from the Authorization header. */
export function bearerToken(authorization: string | undefined): string | null {
  if (!authorization) return null;
  const [scheme, token] = authorization.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) return null;
  return token.trim();
}
