import { and, eq, inArray, like } from "drizzle-orm";
import type { Database } from "../db";
import {
  categories,
  productCategories,
  productImages,
  productVariantOptions,
  productVariants,
  products,
} from "../db/schema";
import { badRequest, notFound } from "../lib/errors";
import { buildR2Key, deleteFile, uploadFile } from "../lib/r2";
import type { Env } from "../types";

export interface ProductFilters {
  category?: string;
  type?: "physical" | "digital";
  active?: boolean;
  search?: string;
  page: number;
  perPage: number;
}

export interface VariantInput {
  name: string;
  sku?: string | null;
  price: number;
  compareAtPrice?: number | null;
  stock?: number;
  weight?: number | null;
  digitalFileR2Key?: string | null;
  options?: { optionName: string; optionValue: string }[];
}

export interface UploadInput {
  body: ArrayBuffer;
  filename: string;
  contentType?: string;
}

export async function listProducts(
  db: Database,
  storeId: string,
  filters: ProductFilters,
) {
  const conds = [eq(products.storeId, storeId)];
  if (filters.type) conds.push(eq(products.type, filters.type));
  if (filters.active !== undefined)
    conds.push(eq(products.isActive, filters.active));
  if (filters.search) conds.push(like(products.name, `%${filters.search}%`));

  if (filters.category) {
    const rows = await db
      .select({ pid: productCategories.productId })
      .from(productCategories)
      .where(eq(productCategories.categoryId, filters.category));
    const ids = rows.map((r) => r.pid);
    if (ids.length === 0) {
      return { items: [], total: 0, page: filters.page, perPage: filters.perPage };
    }
    conds.push(inArray(products.id, ids));
  }

  const where = and(...conds);
  const total = await db.$count(products, where);
  const items = await db.query.products.findMany({
    where,
    with: { images: true, variants: true },
    limit: filters.perPage,
    offset: (filters.page - 1) * filters.perPage,
    orderBy: (p, { desc }) => desc(p.createdAt),
  });
  return { items, total, page: filters.page, perPage: filters.perPage };
}

export async function getProduct(
  db: Database,
  storeId: string,
  id: string,
) {
  const product = await db.query.products.findFirst({
    where: and(eq(products.id, id), eq(products.storeId, storeId)),
    with: {
      images: true,
      variants: { with: { options: true } },
      categories: { with: { category: true } },
    },
  });
  if (!product) throw notFound("Product");
  return product;
}

async function validStoreCategoryIds(
  db: Database,
  storeId: string,
  categoryIds: string[],
): Promise<string[]> {
  if (categoryIds.length === 0) return [];
  const rows = await db
    .select({ id: categories.id })
    .from(categories)
    .where(
      and(eq(categories.storeId, storeId), inArray(categories.id, categoryIds)),
    );
  return rows.map((r) => r.id);
}

async function insertVariant(
  db: Database,
  productId: string,
  v: VariantInput,
) {
  const [variant] = await db
    .insert(productVariants)
    .values({
      productId,
      name: v.name,
      sku: v.sku ?? null,
      price: v.price,
      compareAtPrice: v.compareAtPrice ?? null,
      stock: v.stock ?? 0,
      weight: v.weight ?? null,
      digitalFileR2Key: v.digitalFileR2Key ?? null,
    })
    .returning();
  if (v.options && v.options.length > 0) {
    await db.insert(productVariantOptions).values(
      v.options.map((o) => ({
        variantId: variant.id,
        optionName: o.optionName,
        optionValue: o.optionValue,
      })),
    );
  }
  return variant;
}

export async function createProduct(
  db: Database,
  storeId: string,
  input: {
    name: string;
    shortDescription?: string | null;
    fullDescription?: string | null;
    type?: "physical" | "digital";
    isActive?: boolean;
    categoryIds?: string[];
    variants?: VariantInput[];
  },
) {
  const [product] = await db
    .insert(products)
    .values({
      storeId,
      name: input.name,
      shortDescription: input.shortDescription ?? null,
      fullDescription: input.fullDescription ?? null,
      type: input.type ?? "physical",
      isActive: input.isActive ?? true,
    })
    .returning();

  for (const v of input.variants ?? []) {
    await insertVariant(db, product.id, v);
  }

  const validCategoryIds = await validStoreCategoryIds(
    db,
    storeId,
    input.categoryIds ?? [],
  );
  if (validCategoryIds.length > 0) {
    await db
      .insert(productCategories)
      .values(
        validCategoryIds.map((categoryId) => ({
          productId: product.id,
          categoryId,
        })),
      );
  }

  return getProduct(db, storeId, product.id);
}

async function ensureProduct(db: Database, storeId: string, productId: string) {
  const product = await db.query.products.findFirst({
    where: and(eq(products.id, productId), eq(products.storeId, storeId)),
  });
  if (!product) throw notFound("Product");
  return product;
}

export async function updateProduct(
  db: Database,
  storeId: string,
  id: string,
  input: {
    name?: string;
    shortDescription?: string | null;
    fullDescription?: string | null;
    type?: "physical" | "digital";
    isActive?: boolean;
    categoryIds?: string[];
  },
) {
  await ensureProduct(db, storeId, id);
  const { categoryIds, ...patch } = input;
  if (Object.keys(patch).length > 0) {
    await db.update(products).set(patch).where(eq(products.id, id));
  }
  if (categoryIds) {
    await db
      .delete(productCategories)
      .where(eq(productCategories.productId, id));
    const valid = await validStoreCategoryIds(db, storeId, categoryIds);
    if (valid.length > 0) {
      await db
        .insert(productCategories)
        .values(valid.map((categoryId) => ({ productId: id, categoryId })));
    }
  }
  return getProduct(db, storeId, id);
}

async function collectProductR2Keys(
  db: Database,
  productId: string,
): Promise<string[]> {
  const keys: string[] = [];
  const product = await db.query.products.findFirst({
    where: eq(products.id, productId),
  });
  if (product?.mainImageR2Key) keys.push(product.mainImageR2Key);
  const imgs = await db
    .select({ key: productImages.r2Key })
    .from(productImages)
    .where(eq(productImages.productId, productId));
  for (const i of imgs) keys.push(i.key);
  const vars = await db
    .select({ key: productVariants.digitalFileR2Key })
    .from(productVariants)
    .where(eq(productVariants.productId, productId));
  for (const v of vars) if (v.key) keys.push(v.key);
  return keys;
}

export async function deleteProduct(
  env: Env,
  db: Database,
  storeId: string,
  id: string,
) {
  await ensureProduct(db, storeId, id);
  const keys = await collectProductR2Keys(db, id);
  await Promise.all(keys.map((k) => deleteFile(env.R2_BUCKET, k)));
  await db.delete(products).where(eq(products.id, id));
}

// ---- Images ----

export async function addProductImages(
  env: Env,
  db: Database,
  storeId: string,
  productId: string,
  files: UploadInput[],
) {
  const product = await ensureProduct(db, storeId, productId);
  const existingCount = await db.$count(
    productImages,
    eq(productImages.productId, productId),
  );

  const inserted = [];
  let index = existingCount;
  for (const file of files) {
    const key = buildR2Key(
      `stores/${storeId}/products/${productId}`,
      file.filename,
    );
    await uploadFile(env.R2_BUCKET, key, file.body, file.contentType);
    const isMain = index === 0 && !product.mainImageR2Key;
    const [row] = await db
      .insert(productImages)
      .values({ productId, r2Key: key, sortOrder: index, isMain })
      .returning();
    if (isMain) {
      await db
        .update(products)
        .set({ mainImageR2Key: key })
        .where(eq(products.id, productId));
    }
    inserted.push(row);
    index++;
  }
  return inserted;
}

export async function removeProductImage(
  env: Env,
  db: Database,
  storeId: string,
  productId: string,
  imageId: string,
) {
  await ensureProduct(db, storeId, productId);
  const image = await db.query.productImages.findFirst({
    where: and(
      eq(productImages.id, imageId),
      eq(productImages.productId, productId),
    ),
  });
  if (!image) throw notFound("Image");
  await deleteFile(env.R2_BUCKET, image.r2Key);
  await db.delete(productImages).where(eq(productImages.id, imageId));
  if (image.isMain) {
    await db
      .update(products)
      .set({ mainImageR2Key: null })
      .where(eq(products.id, productId));
  }
}

export async function setMainProductImage(
  db: Database,
  storeId: string,
  productId: string,
  imageId: string,
) {
  await ensureProduct(db, storeId, productId);
  const image = await db.query.productImages.findFirst({
    where: and(
      eq(productImages.id, imageId),
      eq(productImages.productId, productId),
    ),
  });
  if (!image) throw notFound("Image");
  await db
    .update(productImages)
    .set({ isMain: false })
    .where(eq(productImages.productId, productId));
  await db
    .update(productImages)
    .set({ isMain: true })
    .where(eq(productImages.id, imageId));
  await db
    .update(products)
    .set({ mainImageR2Key: image.r2Key })
    .where(eq(products.id, productId));
  return getProduct(db, storeId, productId);
}

// ---- Variants ----

export async function addVariant(
  db: Database,
  storeId: string,
  productId: string,
  input: VariantInput,
) {
  await ensureProduct(db, storeId, productId);
  const variant = await insertVariant(db, productId, input);
  return db.query.productVariants.findFirst({
    where: eq(productVariants.id, variant.id),
    with: { options: true },
  });
}

export async function updateVariant(
  db: Database,
  storeId: string,
  productId: string,
  variantId: string,
  input: Partial<VariantInput>,
) {
  await ensureProduct(db, storeId, productId);
  const existing = await db.query.productVariants.findFirst({
    where: and(
      eq(productVariants.id, variantId),
      eq(productVariants.productId, productId),
    ),
  });
  if (!existing) throw notFound("Variant");

  const { options, ...patch } = input;
  if (Object.keys(patch).length > 0) {
    await db
      .update(productVariants)
      .set(patch)
      .where(eq(productVariants.id, variantId));
  }
  if (options) {
    await db
      .delete(productVariantOptions)
      .where(eq(productVariantOptions.variantId, variantId));
    if (options.length > 0) {
      await db.insert(productVariantOptions).values(
        options.map((o) => ({
          variantId,
          optionName: o.optionName,
          optionValue: o.optionValue,
        })),
      );
    }
  }
  return db.query.productVariants.findFirst({
    where: eq(productVariants.id, variantId),
    with: { options: true },
  });
}

export async function deleteVariant(
  env: Env,
  db: Database,
  storeId: string,
  productId: string,
  variantId: string,
) {
  await ensureProduct(db, storeId, productId);
  const variant = await db.query.productVariants.findFirst({
    where: and(
      eq(productVariants.id, variantId),
      eq(productVariants.productId, productId),
    ),
  });
  if (!variant) throw notFound("Variant");
  if (variant.digitalFileR2Key)
    await deleteFile(env.R2_BUCKET, variant.digitalFileR2Key);
  await db.delete(productVariants).where(eq(productVariants.id, variantId));
}
