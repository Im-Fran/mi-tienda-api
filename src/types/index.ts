import type { Database } from "../db";
import type { customers, stores, users } from "../db/schema";

/** Worker bindings (resources + vars + secrets) declared in wrangler.jsonc. */
export interface Env {
  // Resource bindings
  DB: D1Database;
  KV_SESSIONS: KVNamespace;
  KV_CUSTOMER_SESSIONS: KVNamespace;
  R2_BUCKET: R2Bucket;
  // Plain vars
  BASE_URL: string;
  R2_PUBLIC_URL: string;
  EMAIL_FROM: string;
  EMAIL_PROVIDER: string;
  OAUTH_REDIRECT_BASE: string;
  // Secrets (wrangler secret put / .dev.vars)
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
  RESEND_API_KEY: string;
}

export type UserRow = typeof users.$inferSelect;
export type CustomerRow = typeof customers.$inferSelect;
export type StoreRow = typeof stores.$inferSelect;

/** Opaque session payloads stored in KV. */
export interface SessionData {
  userId: string;
  createdAt: number;
  expiresAt: number;
}

export interface CustomerSessionData {
  customerId: string;
  createdAt: number;
  expiresAt: number;
}

/** Values injected into the Hono context by middleware. */
export interface Variables {
  db: Database;
  user: UserRow;
  store: StoreRow;
  customer?: CustomerRow;
  guestToken?: string;
}

/** Hono generic env for the whole app. */
export type AppEnv = { Bindings: Env; Variables: Variables };
