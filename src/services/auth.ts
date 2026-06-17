import { eq } from "drizzle-orm";
import type { Database } from "../db";
import { customers, users } from "../db/schema";
import type { OAuthProfile, OAuthProvider } from "../lib/oauth";
import type { CustomerRow, UserRow } from "../types";

// ---- Users ----

export async function upsertUserFromOAuth(
  db: Database,
  provider: OAuthProvider,
  profile: OAuthProfile,
): Promise<UserRow> {
  const email = profile.email.toLowerCase();
  const existing = await db.query.users.findFirst({
    where: eq(users.email, email),
  });
  if (existing) {
    const [updated] = await db
      .update(users)
      .set({
        name: profile.name ?? existing.name,
        avatarUrl: profile.avatarUrl ?? existing.avatarUrl,
        emailVerified: true,
      })
      .where(eq(users.id, existing.id))
      .returning();
    return updated;
  }
  const [created] = await db
    .insert(users)
    .values({
      email,
      name: profile.name,
      avatarUrl: profile.avatarUrl,
      provider,
      providerId: profile.providerId,
      emailVerified: true,
    })
    .returning();
  return created;
}

export async function findOrCreateUserByEmail(
  db: Database,
  email: string,
): Promise<UserRow> {
  const lower = email.toLowerCase();
  const existing = await db.query.users.findFirst({
    where: eq(users.email, lower),
  });
  if (existing) return existing;
  const [created] = await db
    .insert(users)
    .values({ email: lower, provider: "email", emailVerified: true })
    .returning();
  return created;
}

// ---- Customers ----

export async function upsertCustomerFromOAuth(
  db: Database,
  provider: OAuthProvider,
  profile: OAuthProfile,
): Promise<CustomerRow> {
  const email = profile.email.toLowerCase();
  const existing = await db.query.customers.findFirst({
    where: eq(customers.email, email),
  });
  if (existing) {
    const [updated] = await db
      .update(customers)
      .set({
        name: profile.name ?? existing.name,
        avatarUrl: profile.avatarUrl ?? existing.avatarUrl,
        emailVerified: true,
      })
      .where(eq(customers.id, existing.id))
      .returning();
    return updated;
  }
  const [created] = await db
    .insert(customers)
    .values({
      email,
      name: profile.name,
      avatarUrl: profile.avatarUrl,
      provider,
      providerId: profile.providerId,
      emailVerified: true,
    })
    .returning();
  return created;
}

export async function findOrCreateCustomerByEmail(
  db: Database,
  email: string,
): Promise<CustomerRow> {
  const lower = email.toLowerCase();
  const existing = await db.query.customers.findFirst({
    where: eq(customers.email, lower),
  });
  if (existing) return existing;
  const [created] = await db
    .insert(customers)
    .values({ email: lower, provider: "email", emailVerified: true })
    .returning();
  return created;
}
