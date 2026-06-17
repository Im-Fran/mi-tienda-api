import { and, eq } from "drizzle-orm";
import type { Database } from "../db";
import { categories } from "../db/schema";
import { badRequest, conflict, notFound } from "../lib/errors";
import { randomToken, slugify } from "../lib/crypto";

type CategoryRow = typeof categories.$inferSelect;
export type CategoryNode = CategoryRow & { children: CategoryNode[] };

function buildTree(rows: CategoryRow[]): CategoryNode[] {
  const nodes = new Map<string, CategoryNode>(
    rows.map((r) => [r.id, { ...r, children: [] }]),
  );
  const roots: CategoryNode[] = [];
  for (const node of nodes.values()) {
    const parent = node.parentId ? nodes.get(node.parentId) : undefined;
    if (parent) parent.children.push(node);
    else roots.push(node);
  }
  return roots;
}

export async function getCategoryTree(db: Database, storeId: string) {
  const rows = await db.query.categories.findMany({
    where: eq(categories.storeId, storeId),
    orderBy: (c, { asc }) => [asc(c.sortOrder), asc(c.name)],
  });
  return buildTree(rows);
}

async function ensureUniqueCategorySlug(
  db: Database,
  storeId: string,
  base: string,
  excludeId?: string,
): Promise<string> {
  const root = slugify(base);
  let candidate = root;
  for (let i = 2; i <= 50; i++) {
    const existing = await db.query.categories.findFirst({
      where: and(
        eq(categories.storeId, storeId),
        eq(categories.slug, candidate),
      ),
    });
    if (!existing || existing.id === excludeId) return candidate;
    candidate = `${root}-${i}`;
  }
  return `${root}-${randomToken(4).toLowerCase()}`;
}

async function ensureCategory(db: Database, storeId: string, id: string) {
  const category = await db.query.categories.findFirst({
    where: and(eq(categories.id, id), eq(categories.storeId, storeId)),
  });
  if (!category) throw notFound("Category");
  return category;
}

async function assertParentInStore(
  db: Database,
  storeId: string,
  parentId: string,
) {
  const parent = await db.query.categories.findFirst({
    where: and(eq(categories.id, parentId), eq(categories.storeId, storeId)),
  });
  if (!parent) throw badRequest("Parent category not found in this store");
}

async function wouldCreateCycle(
  db: Database,
  categoryId: string,
  newParentId: string,
): Promise<boolean> {
  let current: string | null = newParentId;
  while (current) {
    const currentId: string = current;
    if (currentId === categoryId) return true;
    const row = await db.query.categories.findFirst({
      where: eq(categories.id, currentId),
    });
    current = row?.parentId ?? null;
  }
  return false;
}

export async function createCategory(
  db: Database,
  storeId: string,
  input: {
    name: string;
    slug?: string;
    description?: string | null;
    parentId?: string | null;
    sortOrder?: number;
  },
) {
  if (input.parentId) await assertParentInStore(db, storeId, input.parentId);
  const slug = await ensureUniqueCategorySlug(
    db,
    storeId,
    input.slug ?? input.name,
  );
  const [category] = await db
    .insert(categories)
    .values({
      storeId,
      name: input.name,
      slug,
      description: input.description ?? null,
      parentId: input.parentId ?? null,
      sortOrder: input.sortOrder ?? 0,
    })
    .returning();
  return category;
}

export async function updateCategory(
  db: Database,
  storeId: string,
  id: string,
  input: {
    name?: string;
    slug?: string;
    description?: string | null;
    parentId?: string | null;
    sortOrder?: number;
  },
) {
  await ensureCategory(db, storeId, id);

  const patch: Partial<CategoryRow> = {
    name: input.name,
    description: input.description,
    sortOrder: input.sortOrder,
  };

  if (input.slug) {
    patch.slug = await ensureUniqueCategorySlug(db, storeId, input.slug, id);
  }

  if (input.parentId !== undefined) {
    if (input.parentId === null) {
      patch.parentId = null;
    } else {
      if (input.parentId === id)
        throw badRequest("A category cannot be its own parent");
      await assertParentInStore(db, storeId, input.parentId);
      if (await wouldCreateCycle(db, id, input.parentId))
        throw badRequest("Reparenting would create a cycle");
      patch.parentId = input.parentId;
    }
  }

  const [updated] = await db
    .update(categories)
    .set(patch)
    .where(eq(categories.id, id))
    .returning();
  return updated;
}

export async function deleteCategory(
  db: Database,
  storeId: string,
  id: string,
  recursive: boolean,
) {
  await ensureCategory(db, storeId, id);
  const childCount = await db.$count(
    categories,
    and(eq(categories.storeId, storeId), eq(categories.parentId, id)),
  );
  if (childCount > 0 && !recursive) {
    throw conflict(
      "Category has children; pass ?recursive=true to delete the whole subtree",
      { childCount },
    );
  }
  // FK onDelete cascade removes the subtree when recursive.
  await db.delete(categories).where(eq(categories.id, id));
}
