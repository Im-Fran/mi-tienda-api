import { and, eq, gte, lte, sql } from "drizzle-orm";
import type { Database } from "../db";
import { orderItems, orders } from "../db/schema";

/** Statuses that count as realized revenue. */
const REVENUE_SQL = sql`case when ${orders.status} in ('paid','processing','shipped','delivered') then ${orders.total} else 0 end`;
const PAID_SQL = sql`case when ${orders.status} in ('paid','processing','shipped','delivered') then 1 else 0 end`;

function dateConds(storeId: string, from?: Date, to?: Date) {
  const conds = [eq(orders.storeId, storeId)];
  if (from) conds.push(gte(orders.createdAt, from));
  if (to) conds.push(lte(orders.createdAt, to));
  return and(...conds);
}

export async function summary(
  db: Database,
  storeId: string,
  from?: Date,
  to?: Date,
) {
  const [row] = await db
    .select({
      totalOrders: sql<number>`count(*)`,
      paidOrders: sql<number>`coalesce(sum(${PAID_SQL}), 0)`,
      revenue: sql<number>`coalesce(sum(${REVENUE_SQL}), 0)`,
    })
    .from(orders)
    .where(dateConds(storeId, from, to));

  const totalOrders = Number(row?.totalOrders ?? 0);
  const totalRevenue = Number(row?.revenue ?? 0);
  const paidOrders = Number(row?.paidOrders ?? 0);
  const averageOrderValue = paidOrders > 0 ? totalRevenue / paidOrders : 0;

  return {
    totalRevenue,
    totalOrders,
    averageOrderValue,
    currencyCode: "USD",
  };
}

export async function topProducts(
  db: Database,
  storeId: string,
  limit: number,
  from?: Date,
  to?: Date,
) {
  const productId = sql<string>`json_extract(${orderItems.productSnapshot}, '$.productId')`;
  const rows = await db
    .select({
      productId,
      productName: sql<string>`json_extract(${orderItems.productSnapshot}, '$.productName')`,
      unitsSold: sql<number>`sum(${orderItems.quantity})`,
      revenue: sql<number>`sum(${orderItems.totalPrice})`,
    })
    .from(orderItems)
    .innerJoin(orders, eq(orders.id, orderItems.orderId))
    .where(dateConds(storeId, from, to))
    .groupBy(productId)
    .orderBy(sql`sum(${orderItems.quantity}) desc`)
    .limit(limit);

  return rows.map((r) => ({
    productId: r.productId,
    productName: r.productName,
    totalRevenue: Number(r.revenue),
    totalQuantity: Number(r.unitsSold),
  }));
}

export async function ordersByStatus(
  db: Database,
  storeId: string,
  from?: Date,
  to?: Date,
) {
  const rows = await db
    .select({
      status: orders.status,
      count: sql<number>`count(*)`,
    })
    .from(orders)
    .where(dateConds(storeId, from, to))
    .groupBy(orders.status);
  return rows.map((r) => ({ status: r.status, count: Number(r.count) }));
}

export async function revenueOverTime(
  db: Database,
  storeId: string,
  interval: "day" | "week" | "month",
  from?: Date,
  to?: Date,
) {
  const fmt =
    interval === "month" ? "%Y-%m" : interval === "week" ? "%Y-%W" : "%Y-%m-%d";
  const bucket = sql<string>`strftime(${fmt}, ${orders.createdAt}, 'unixepoch')`;
  const rows = await db
    .select({
      bucket,
      revenue: sql<number>`coalesce(sum(${REVENUE_SQL}), 0)`,
      ordersCount: sql<number>`count(*)`,
    })
    .from(orders)
    .where(dateConds(storeId, from, to))
    .groupBy(bucket)
    .orderBy(bucket);

  return rows.map((r) => ({
    date: r.bucket,
    revenue: Number(r.revenue),
  }));
}
