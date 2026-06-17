import { and, eq } from "drizzle-orm";
import type { Database } from "../db";
import { shippingMethods } from "../db/schema";
import { notFound } from "../lib/errors";

export function listShippingMethods(db: Database, storeId: string) {
  return db.query.shippingMethods.findMany({
    where: eq(shippingMethods.storeId, storeId),
  });
}

export async function createShippingMethod(
  db: Database,
  storeId: string,
  input: Omit<typeof shippingMethods.$inferInsert, "storeId">,
) {
  const [row] = await db
    .insert(shippingMethods)
    .values({ ...input, storeId })
    .returning();
  return row;
}

export async function updateShippingMethod(
  db: Database,
  storeId: string,
  id: string,
  input: Partial<typeof shippingMethods.$inferInsert>,
) {
  const [row] = await db
    .update(shippingMethods)
    .set(input)
    .where(
      and(eq(shippingMethods.id, id), eq(shippingMethods.storeId, storeId)),
    )
    .returning();
  if (!row) throw notFound("Shipping method");
  return row;
}

export async function deleteShippingMethod(
  db: Database,
  storeId: string,
  id: string,
) {
  const [row] = await db
    .delete(shippingMethods)
    .where(
      and(eq(shippingMethods.id, id), eq(shippingMethods.storeId, storeId)),
    )
    .returning({ id: shippingMethods.id });
  if (!row) throw notFound("Shipping method");
}
