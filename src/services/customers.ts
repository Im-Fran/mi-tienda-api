import { and, desc, eq } from "drizzle-orm";
import type { Database } from "../db";
import { customerAddresses, customers, orders } from "../db/schema";
import { notFound } from "../lib/errors";
import type { CustomerRow } from "../types";

export async function getCustomer(db: Database, id: string): Promise<CustomerRow> {
  const customer = await db.query.customers.findFirst({
    where: eq(customers.id, id),
  });
  if (!customer) throw notFound("Customer");
  return customer;
}

export async function updateCustomer(
  db: Database,
  id: string,
  input: Partial<typeof customers.$inferInsert>,
) {
  const [row] = await db
    .update(customers)
    .set(input)
    .where(eq(customers.id, id))
    .returning();
  if (!row) throw notFound("Customer");
  return row;
}

export function listAddresses(db: Database, customerId: string) {
  return db.query.customerAddresses.findMany({
    where: eq(customerAddresses.customerId, customerId),
  });
}

async function unsetDefaultAddresses(db: Database, customerId: string) {
  await db
    .update(customerAddresses)
    .set({ isDefault: false })
    .where(eq(customerAddresses.customerId, customerId));
}

export async function addAddress(
  db: Database,
  customerId: string,
  input: Omit<typeof customerAddresses.$inferInsert, "customerId">,
) {
  if (input.isDefault) await unsetDefaultAddresses(db, customerId);
  const [row] = await db
    .insert(customerAddresses)
    .values({ ...input, customerId })
    .returning();
  return row;
}

export async function updateAddress(
  db: Database,
  customerId: string,
  addressId: string,
  input: Partial<typeof customerAddresses.$inferInsert>,
) {
  const existing = await db.query.customerAddresses.findFirst({
    where: and(
      eq(customerAddresses.id, addressId),
      eq(customerAddresses.customerId, customerId),
    ),
  });
  if (!existing) throw notFound("Address");
  if (input.isDefault) await unsetDefaultAddresses(db, customerId);
  const [row] = await db
    .update(customerAddresses)
    .set(input)
    .where(eq(customerAddresses.id, addressId))
    .returning();
  return row;
}

export async function deleteAddress(
  db: Database,
  customerId: string,
  addressId: string,
) {
  const [row] = await db
    .delete(customerAddresses)
    .where(
      and(
        eq(customerAddresses.id, addressId),
        eq(customerAddresses.customerId, customerId),
      ),
    )
    .returning({ id: customerAddresses.id });
  if (!row) throw notFound("Address");
}

// ---- Store-owner view of customers ----

export async function listStoreCustomers(
  db: Database,
  storeId: string,
  page: number,
  perPage: number,
) {
  return db
    .selectDistinct({
      id: customers.id,
      email: customers.email,
      name: customers.name,
      avatarUrl: customers.avatarUrl,
      phone: customers.phone,
      createdAt: customers.createdAt,
    })
    .from(customers)
    .innerJoin(orders, eq(orders.customerId, customers.id))
    .where(eq(orders.storeId, storeId))
    .limit(perPage)
    .offset((page - 1) * perPage);
}

export async function getStoreCustomer(
  db: Database,
  storeId: string,
  customerId: string,
) {
  const customer = await getCustomer(db, customerId);
  const customerOrders = await db.query.orders.findMany({
    where: and(eq(orders.storeId, storeId), eq(orders.customerId, customerId)),
    with: { items: true },
    orderBy: desc(orders.createdAt),
  });
  if (customerOrders.length === 0) {
    throw notFound("Customer has no orders in this store");
  }
  return { customer, orders: customerOrders };
}
