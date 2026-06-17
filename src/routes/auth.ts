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
  createUserSession,
  destroyUserSession,
} from "../lib/session";
import { parseJson, parseParams, parseQuery } from "../lib/validation";
import { authMiddleware } from "../middleware/auth";
import { findOrCreateUserByEmail, upsertUserFromOAuth } from "../services/auth";
import type { AppEnv } from "../types";
import {
  emailBodySchema,
  magicLinkVerifyQuerySchema,
  oauthCallbackQuerySchema,
  oauthProviderParamSchema,
} from "../validators/auth";
import { authCustomerRouter } from "./auth-customer";

export const authRouter = new Hono<AppEnv>();

// Mount the customer auth sub-router at /api/auth/customer
authRouter.route("/customer", authCustomerRouter);

authRouter.get("/oauth/:provider", async (c) => {
  const { provider } = parseParams(c, oauthProviderParamSchema);
  const redirectUri = `${c.env.OAUTH_REDIRECT_BASE}/api/auth/oauth/${provider}/callback`;
  const state = await createOAuthState(c.env.KV_SESSIONS, {
    provider,
    subjectType: "user",
  });
  return c.redirect(getAuthorizeUrl(c.env, provider, redirectUri, state));
});

authRouter.get("/oauth/:provider/callback", async (c) => {
  const { provider } = parseParams(c, oauthProviderParamSchema);
  const { code, state } = parseQuery(c, oauthCallbackQuerySchema);
  const saved = await consumeOAuthState(c.env.KV_SESSIONS, state);
  if (!saved || saved.provider !== provider || saved.subjectType !== "user") {
    return c.json(fail({ state: "Invalid or expired state" }), 400);
  }
  const redirectUri = `${c.env.OAUTH_REDIRECT_BASE}/api/auth/oauth/${provider}/callback`;
  const accessToken = await exchangeCodeForToken(
    c.env,
    provider,
    code,
    redirectUri,
  );
  const profile = await fetchOAuthProfile(provider, accessToken);
  const user = await upsertUserFromOAuth(c.var.db, provider, profile);
  const token = await createUserSession(c.env, user.id);
  return c.redirect(`${c.env.FRONTEND_URL}/admin/login?oauth_token=${encodeURIComponent(token)}`);
});

authRouter.post("/magic-link", async (c) => {
  const { email } = await parseJson(c, emailBodySchema);
  const rawToken = await createMagicLink(c.var.db, email, "user");
  const link = `${c.env.FRONTEND_URL}/admin/login?token=${encodeURIComponent(
    rawToken,
  )}&email=${encodeURIComponent(email)}`;
  try {
    await sendMagicLinkEmail(c.env, email, link);
  } catch (err) {
    console.error("magic-link email failed", err);
  }
  // Always succeed to avoid user enumeration.
  return c.json(
    success({ sent: true }, "If the email exists, a sign-in link was sent"),
  );
});

authRouter.get("/magic-link/verify", async (c) => {
  const { token, email } = parseQuery(c, magicLinkVerifyQuerySchema);
  const ok = await consumeMagicLink(c.var.db, token, email, "user");
  if (!ok) {
    return c.json(
      fail({ token: "Invalid, expired, or already used" }),
      400,
    );
  }
  const user = await findOrCreateUserByEmail(c.var.db, email);
  const session = await createUserSession(c.env, user.id);
  return c.json(success({ token: session, user }));
});

authRouter.post("/logout", authMiddleware, async (c) => {
  const token = bearerToken(c.req.header("authorization"));
  if (token) await destroyUserSession(c.env, token);
  return c.json(success({ loggedOut: true }));
});

authRouter.get("/me", authMiddleware, (c) =>
  c.json(success({ user: c.var.user })),
);
