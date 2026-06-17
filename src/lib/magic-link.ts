import { and, eq, gt } from "drizzle-orm";
import type { Database } from "../db";
import { magicLinks } from "../db/schema";
import { randomToken, sha256Hex } from "./crypto";

export const MAGIC_LINK_TTL_MS = 15 * 60 * 1000; // 15 minutes

export type MagicLinkSubject = "user" | "customer";

/** Generate a raw token and its SHA-256 hash. Only the hash is persisted. */
export async function generateMagicToken(): Promise<{
  rawToken: string;
  tokenHash: string;
}> {
  const rawToken = randomToken(32);
  const tokenHash = await sha256Hex(rawToken);
  return { rawToken, tokenHash };
}

export const hashToken = (rawToken: string): Promise<string> =>
  sha256Hex(rawToken);

/** Insert a magic link row and return the raw token to email out. */
export async function createMagicLink(
  db: Database,
  email: string,
  subjectType: MagicLinkSubject,
): Promise<string> {
  const { rawToken, tokenHash } = await generateMagicToken();
  const expiresAt = new Date(Date.now() + MAGIC_LINK_TTL_MS);
  await db.insert(magicLinks).values({
    email: email.toLowerCase(),
    tokenHash,
    subjectType,
    expiresAt,
  });
  return rawToken;
}

/**
 * Atomically validate + consume a magic link. Returns true only if a
 * matching non-consumed, non-expired token existed for this email/subject.
 * Uses a single conditional UPDATE ... RETURNING to prevent reuse races.
 */
export async function consumeMagicLink(
  db: Database,
  rawToken: string,
  email: string,
  subjectType: MagicLinkSubject,
): Promise<boolean> {
  const tokenHash = await hashToken(rawToken);
  const consumed = await db
    .update(magicLinks)
    .set({ consumed: true })
    .where(
      and(
        eq(magicLinks.tokenHash, tokenHash),
        eq(magicLinks.email, email.toLowerCase()),
        eq(magicLinks.subjectType, subjectType),
        eq(magicLinks.consumed, false),
        gt(magicLinks.expiresAt, new Date()),
      ),
    )
    .returning({ id: magicLinks.id });
  return consumed.length > 0;
}
