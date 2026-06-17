import { and, eq } from "drizzle-orm";
import type { Database } from "../db";
import {
  productImages,
  productVariants,
  products,
  storeCountries,
  storeSettings,
  stores,
} from "../db/schema";
import { conflict, notFound } from "../lib/errors";
import { randomToken, slugify } from "../lib/crypto";
import { buildR2Key, deleteFile, uploadFile } from "../lib/r2";
import type { Env, StoreRow } from "../types";

const MAX_STORES = 3;

export function listStores(db: Database, userId: string) {
  return db.query.stores.findMany({
    where: eq(stores.userId, userId),
    with: { settings: true },
    orderBy: (s, { asc }) => asc(s.createdAt),
  });
}

export async function getStore(db: Database, storeId: string) {
  const store = await db.query.stores.findFirst({
    where: eq(stores.id, storeId),
    with: { settings: true, countries: true },
  });
  if (!store) throw notFound("Store");
  return store;
}

async function ensureUniqueStoreSlug(
  db: Database,
  base: string,
  excludeId?: string,
): Promise<string> {
  const root = slugify(base);
  let candidate = root;
  for (let i = 2; i <= 50; i++) {
    const existing = await db.query.stores.findFirst({
      where: eq(stores.slug, candidate),
    });
    if (!existing || existing.id === excludeId) return candidate;
    candidate = `${root}-${i}`;
  }
  return `${root}-${randomToken(4).toLowerCase()}`;
}

export async function createStore(
  db: Database,
  userId: string,
  input: { name: string; slug?: string },
) {
  const count = await db.$count(stores, eq(stores.userId, userId));
  if (count >= MAX_STORES) {
    throw conflict(`A user can own at most ${MAX_STORES} stores`, {
      max: MAX_STORES,
      current: count,
    });
  }
  const slug = await ensureUniqueStoreSlug(db, input.slug ?? input.name);
  const [store] = await db
    .insert(stores)
    .values({ userId, name: input.name, slug })
    .returning();
  await db.insert(storeSettings).values({ storeId: store.id });
  return getStore(db, store.id);
}

export async function updateStore(
  db: Database,
  storeId: string,
  input: { name?: string; slug?: string; isActive?: boolean },
) {
  const patch: Partial<StoreRow> = {
    name: input.name,
    isActive: input.isActive,
  };
  if (input.slug) {
    patch.slug = await ensureUniqueStoreSlug(db, input.slug, storeId);
  }
  const [updated] = await db
    .update(stores)
    .set(patch)
    .where(eq(stores.id, storeId))
    .returning();
  if (!updated) throw notFound("Store");
  return getStore(db, storeId);
}

async function collectStoreR2Keys(
  db: Database,
  storeId: string,
): Promise<string[]> {
  const keys: string[] = [];
  const store = await db.query.stores.findFirst({
    where: eq(stores.id, storeId),
  });
  if (store?.logoR2Key) keys.push(store.logoR2Key);

  const mains = await db
    .select({ key: products.mainImageR2Key })
    .from(products)
    .where(eq(products.storeId, storeId));
  for (const row of mains) if (row.key) keys.push(row.key);

  const gallery = await db
    .select({ key: productImages.r2Key })
    .from(productImages)
    .innerJoin(products, eq(products.id, productImages.productId))
    .where(eq(products.storeId, storeId));
  for (const row of gallery) keys.push(row.key);

  const digital = await db
    .select({ key: productVariants.digitalFileR2Key })
    .from(productVariants)
    .innerJoin(products, eq(products.id, productVariants.productId))
    .where(eq(products.storeId, storeId));
  for (const row of digital) if (row.key) keys.push(row.key);

  return keys;
}

export async function deleteStore(env: Env, db: Database, storeId: string) {
  const keys = await collectStoreR2Keys(db, storeId);
  await Promise.all(keys.map((k) => deleteFile(env.R2_BUCKET, k)));
  await db.delete(stores).where(eq(stores.id, storeId));
}

// ---- Settings ----

export async function getStoreSettings(db: Database, storeId: string) {
  const settings = await db.query.storeSettings.findFirst({
    where: eq(storeSettings.storeId, storeId),
  });
  if (!settings) throw notFound("Store settings");
  const countries = await db.query.storeCountries.findMany({
    where: eq(storeCountries.storeId, storeId),
  });
  return { ...settings, countries: countries.map((c) => c.countryCode) };
}

export async function updateStoreSettings(
  db: Database,
  storeId: string,
  input: Partial<typeof storeSettings.$inferInsert> & { countries?: string[] },
) {
  const { countries, ...settingsPatch } = input;
  if (Object.keys(settingsPatch).length > 0) {
    await db
      .update(storeSettings)
      .set(settingsPatch)
      .where(eq(storeSettings.storeId, storeId));
  }
  if (countries) {
    await db
      .delete(storeCountries)
      .where(eq(storeCountries.storeId, storeId));
    if (countries.length > 0) {
      await db
        .insert(storeCountries)
        .values(
          countries.map((countryCode) => ({ storeId, countryCode })),
        );
    }
  }
  return getStoreSettings(db, storeId);
}

export async function uploadStoreLogo(
  env: Env,
  db: Database,
  store: StoreRow,
  body: ArrayBuffer,
  filename: string,
  contentType?: string,
) {
  if (store.logoR2Key) await deleteFile(env.R2_BUCKET, store.logoR2Key);
  const key = buildR2Key(`stores/${store.id}/logo`, filename);
  await uploadFile(env.R2_BUCKET, key, body, contentType);
  const [updated] = await db
    .update(stores)
    .set({ logoR2Key: key })
    .where(eq(stores.id, store.id))
    .returning();
  return updated;
}
