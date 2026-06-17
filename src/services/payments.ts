import { and, eq } from "drizzle-orm";
import type { Database } from "../db";
import { paymentMethods } from "../db/schema";
import { notFound } from "../lib/errors";

export function listPaymentMethods(db: Database, storeId: string) {
  return db.query.paymentMethods.findMany({
    where: eq(paymentMethods.storeId, storeId),
  });
}

export async function createPaymentMethod(
  db: Database,
  storeId: string,
  input: Omit<typeof paymentMethods.$inferInsert, "storeId">,
) {
  const [row] = await db
    .insert(paymentMethods)
    .values({ ...input, storeId })
    .returning();
  return row;
}

export async function updatePaymentMethod(
  db: Database,
  storeId: string,
  id: string,
  input: Partial<typeof paymentMethods.$inferInsert>,
) {
  const [row] = await db
    .update(paymentMethods)
    .set(input)
    .where(and(eq(paymentMethods.id, id), eq(paymentMethods.storeId, storeId)))
    .returning();
  if (!row) throw notFound("Payment method");
  return row;
}

export async function deletePaymentMethod(
  db: Database,
  storeId: string,
  id: string,
) {
  const [row] = await db
    .delete(paymentMethods)
    .where(and(eq(paymentMethods.id, id), eq(paymentMethods.storeId, storeId)))
    .returning({ id: paymentMethods.id });
  if (!row) throw notFound("Payment method");
}
