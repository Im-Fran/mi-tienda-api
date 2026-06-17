import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createdAt, id } from "./common";

export const MAGIC_LINK_SUBJECTS = ["user", "customer"] as const;

/** One-time login tokens for both users and customers (only SHA-256 stored). */
export const magicLinks = sqliteTable(
  "magic_links",
  {
    id: id(),
    email: text("email").notNull(),
    tokenHash: text("token_hash").notNull(),
    subjectType: text("subject_type", { enum: MAGIC_LINK_SUBJECTS }).notNull(),
    consumed: integer("consumed", { mode: "boolean" }).notNull().default(false),
    expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
    createdAt: createdAt(),
  },
  (t) => [
    index("magic_links_token_hash_idx").on(t.tokenHash),
    index("magic_links_email_idx").on(t.email),
  ],
);
