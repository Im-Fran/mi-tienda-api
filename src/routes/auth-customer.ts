import { Hono } from "hono";
import { sendMagicLinkEmail } from "../lib/email";
import { fail, success } from "../lib/jsend";
import { consumeMagicLink, createMagicLink } from "../lib/magic-link";
import {
  consumeOAuthState,
  createOAuthState,
  exchangeCodeForToken,
  fetchOAuthProfile,
  getAuthorizeUrl,
} from "../lib/oauth";
import {
  bearerToken,
  createCustomerSession,
  destroyCustomerSession,
} from "../lib/session";
import { parseJson, parseParams, parseQuery } from "../lib/validation";
import { customerAuthMiddleware } from "../middleware/customer-auth";
import {
  findOrCreateCustomerByEmail,
  upsertCustomerFromOAuth,
} from "../services/auth";
import type { AppEnv } from "../types";
import {
  emailBodySchema,
  magicLinkVerifyQuerySchema,
  oauthCallbackQuerySchema,
  oauthProviderParamSchema,
} from "../validators/auth";

export const authCustomerRouter = new Hono<AppEnv>();

authCustomerRouter.get("/oauth/:provider", async (c) => {
  const { provider } = parseParams(c, oauthProviderParamSchema);
  const redirectUri = `${c.env.OAUTH_REDIRECT_BASE}/api/auth/customer/oauth/${provider}/callback`;
  const state = await createOAuthState(c.env.KV_CUSTOMER_SESSIONS, {
    provider,
    subjectType: "customer",
  });
  return c.redirect(getAuthorizeUrl(c.env, provider, redirectUri, state));
});

authCustomerRouter.get("/oauth/:provider/callback", async (c) => {
  const { provider } = parseParams(c, oauthProviderParamSchema);
  const { code, state } = parseQuery(c, oauthCallbackQuerySchema);
  const saved = await consumeOAuthState(c.env.KV_CUSTOMER_SESSIONS, state);
  if (!saved || saved.provider !== provider || saved.subjectType !== "customer") {
    return c.json(fail({ state: "Invalid or expired state" }), 400);
  }
  const redirectUri = `${c.env.OAUTH_REDIRECT_BASE}/api/auth/customer/oauth/${provider}/callback`;
  const accessToken = await exchangeCodeForToken(
    c.env,
    provider,
    code,
    redirectUri,
  );
  const profile = await fetchOAuthProfile(provider, accessToken);
  const customer = await upsertCustomerFromOAuth(c.var.db, provider, profile);
  const token = await createCustomerSession(c.env, customer.id);
  return c.json(success({ token, customer }));
});

authCustomerRouter.post("/magic-link", async (c) => {
  const { email } = await parseJson(c, emailBodySchema);
  const rawToken = await createMagicLink(c.var.db, email, "customer");
  const link = `${c.env.BASE_URL}/api/auth/customer/magic-link/verify?token=${encodeURIComponent(
    rawToken,
  )}&email=${encodeURIComponent(email)}`;
  try {
    await sendMagicLinkEmail(c.env, email, link);
  } catch (err) {
    console.error("magic-link email failed", err);
  }
  return c.json(
    success({ sent: true }, "If the email exists, a sign-in link was sent"),
  );
});

authCustomerRouter.get("/magic-link/verify", async (c) => {
  const { token, email } = parseQuery(c, magicLinkVerifyQuerySchema);
  const ok = await consumeMagicLink(c.var.db, token, email, "customer");
  if (!ok) {
    return c.json(fail({ token: "Invalid, expired, or already used" }), 400);
  }
  const customer = await findOrCreateCustomerByEmail(c.var.db, email);
  const session = await createCustomerSession(c.env, customer.id);
  return c.json(success({ token: session, customer }));
});

authCustomerRouter.post("/logout", customerAuthMiddleware, async (c) => {
  const token = bearerToken(c.req.header("authorization"));
  if (token) await destroyCustomerSession(c.env, token);
  return c.json(success({ loggedOut: true }));
});

authCustomerRouter.get("/me", customerAuthMiddleware, (c) =>
  c.json(success({ customer: c.var.customer })),
);
