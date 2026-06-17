import { and, desc, eq, gte, lte } from "drizzle-orm";
import type { Database } from "../db";
import { orders } from "../db/schema";
import { notFound } from "../lib/errors";

export interface OrderFilters {
  status?: typeof orders.$inferSelect.status;
  customerId?: string;
  from?: Date;
  to?: Date;
  page: number;
  perPage: number;
}

export async function listOrders(
  db: Database,
  storeId: string,
  filters: OrderFilters,
) {
  const conds = [eq(orders.storeId, storeId)];
  if (filters.status) conds.push(eq(orders.status, filters.status));
  if (filters.customerId) conds.push(eq(orders.customerId, filters.customerId));
  if (filters.from) conds.push(gte(orders.createdAt, filters.from));
  if (filters.to) conds.push(lte(orders.createdAt, filters.to));
  const where = and(...conds);

  const total = await db.$count(orders, where);
  const items = await db.query.orders.findMany({
    where,
    with: { items: true },
    limit: filters.perPage,
    offset: (filters.page - 1) * filters.perPage,
    orderBy: desc(orders.createdAt),
  });
  return { items, total, page: filters.page, perPage: filters.perPage };
}

export async function getOrder(db: Database, storeId: string, id: string) {
  const order = await db.query.orders.findFirst({
    where: and(eq(orders.id, id), eq(orders.storeId, storeId)),
    with: { items: true, paymentMethod: true, customer: true },
  });
  if (!order) throw notFound("Order");
  return order;
}

export async function updateOrderStatus(
  db: Database,
  storeId: string,
  id: string,
  input: { status: OrderFilters["status"]; paymentReference?: string | null; notes?: string | null },
) {
  const patch: Record<string, unknown> = { status: input.status };
  if (input.paymentReference !== undefined)
    patch.paymentReference = input.paymentReference;
  if (input.notes !== undefined) patch.notes = input.notes;

  const [row] = await db
    .update(orders)
    .set(patch)
    .where(and(eq(orders.id, id), eq(orders.storeId, storeId)))
    .returning();
  if (!row) throw notFound("Order");
  return getOrder(db, storeId, id);
}

// ---- Customer view (across all stores) ----

export async function listCustomerOrders(
  db: Database,
  customerId: string,
  page: number,
  perPage: number,
) {
  const total = await db.$count(orders, eq(orders.customerId, customerId));
  const items = await db.query.orders.findMany({
    where: eq(orders.customerId, customerId),
    with: { items: true, store: true },
    limit: perPage,
    offset: (page - 1) * perPage,
    orderBy: desc(orders.createdAt),
  });
  return { items, total, page, perPage };
}

export async function getCustomerOrder(
  db: Database,
  customerId: string,
  id: string,
) {
  const order = await db.query.orders.findFirst({
    where: and(eq(orders.id, id), eq(orders.customerId, customerId)),
    with: { items: true, store: true },
  });
  if (!order) throw notFound("Order");
  return order;
}
