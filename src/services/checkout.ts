import { eq, sql } from "drizzle-orm";
import type { Database } from "../db";
import {
  type AddressSnapshot,
  type GuestSnapshot,
  carts,
  coupons,
  customerAddresses,
  orderItems,
  orders,
  paymentMethods,
  productVariants,
  shippingMethods,
  storeSettings,
} from "../db/schema";
import { uuid } from "../lib/crypto";
import { badRequest, conflict, forbidden, notFound } from "../lib/errors";
import type { CheckoutInput } from "../validators/carts";
import {
  type CartActor,
  type LoadedCart,
  cartLineItems,
  cartSubtotal,
  loadCart,
} from "./carts";
import { evaluateCoupon } from "./coupons";

interface GuestAddressInput {
  label?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  countryCode: string;
  postalCode?: string;
}

function assertActor(cart: LoadedCart, actor: CartActor) {
  const ok =
    (!!cart.customerId &&
      !!actor.customer &&
      cart.customerId === actor.customer.id) ||
    (!!cart.guestToken &&
      !!actor.guestToken &&
      cart.guestToken === actor.guestToken);
  if (!ok) throw forbidden("You cannot checkout this cart");
}

function addressRowToSnapshot(a: typeof customerAddresses.$inferSelect): AddressSnapshot {
  return {
    label: a.label ?? undefined,
    addressLine1: a.addressLine1,
    addressLine2: a.addressLine2 ?? undefined,
    city: a.city,
    state: a.state ?? undefined,
    countryCode: a.countryCode,
    postalCode: a.postalCode ?? undefined,
  };
}

async function resolveAddress(
  db: Database,
  customerId: string | null,
  addressId?: string,
  inline?: GuestAddressInput,
): Promise<{ id: string | null; snapshot: AddressSnapshot | null }> {
  if (addressId) {
    const a = await db.query.customerAddresses.findFirst({
      where: eq(customerAddresses.id, addressId),
    });
    if (!a) throw badRequest("Address not found");
    if (customerId && a.customerId !== customerId)
      throw forbidden("Address does not belong to you");
    return { id: a.id, snapshot: addressRowToSnapshot(a) };
  }
  if (inline) return { id: null, snapshot: { ...inline } };
  return { id: null, snapshot: null };
}

export async function checkout(
  db: Database,
  storeId: string,
  cartId: string,
  actor: CartActor,
  input: CheckoutInput,
) {
  const cart = await loadCart(db, cartId);
  if (!cart || cart.storeId !== storeId) throw notFound("Cart");
  assertActor(cart, actor);
  if (cart.status !== "active") throw badRequest("Cart is not active");
  if (cart.items.length === 0) throw badRequest("Cart is empty");

  const settings = await db.query.storeSettings.findFirst({
    where: eq(storeSettings.storeId, storeId),
  });
  if (!settings) throw notFound("Store settings");

  // Payment method must belong to the store and be active.
  const paymentMethod = await db.query.paymentMethods.findFirst({
    where: eq(paymentMethods.id, input.paymentMethodId),
  });
  if (!paymentMethod || paymentMethod.storeId !== storeId)
    throw badRequest("Payment method not found in this store");
  if (!paymentMethod.isActive)
    throw badRequest("Payment method is not active");

  // Shipping method (optional).
  let shippingAmount = 0;
  if (input.shippingMethodId) {
    const shippingMethod = await db.query.shippingMethods.findFirst({
      where: eq(shippingMethods.id, input.shippingMethodId),
    });
    if (!shippingMethod || shippingMethod.storeId !== storeId)
      throw badRequest("Shipping method not found in this store");
    shippingAmount = shippingMethod.cost;
  }

  // ---- Stock validation (physical products only) ----
  const conflicts: {
    variantId: string;
    name: string;
    requested: number;
    available: number;
  }[] = [];
  for (const item of cart.items) {
    if (item.variant.product.type !== "physical") continue;
    if (item.variant.stock < item.quantity) {
      conflicts.push({
        variantId: item.variantId,
        name: `${item.variant.product.name} - ${item.variant.name}`,
        requested: item.quantity,
        available: item.variant.stock,
      });
    }
  }
  if (conflicts.length > 0) {
    throw conflict("Some items are out of stock", { conflicts });
  }

  // ---- Amounts ----
  const subtotal = cartSubtotal(cart);

  let discountAmount = 0;
  let couponApplied = false;
  if (cart.coupon) {
    const result = await evaluateCoupon(db, storeId, cart.coupon.code, {
      subtotal,
      items: cartLineItems(cart),
    });
    if (result.valid) {
      discountAmount = result.discount;
      couponApplied = true;
    }
  }

  const taxableBase = Math.max(0, subtotal - discountAmount);
  const taxAmount = Math.round((taxableBase * settings.taxRate) / 100);
  const total = Math.max(0, subtotal - discountAmount + taxAmount + shippingAmount);

  // ---- Identity + snapshots ----
  const customerId = actor.customer?.id ?? null;
  let guestSnapshot: GuestSnapshot | null = null;
  if (!customerId) {
    if (!input.guest)
      throw badRequest("Guest details are required for guest checkout");
    if (settings.requireCustomerIdDocument && !input.guest.idDocument)
      throw badRequest("This store requires an ID document at checkout");
    guestSnapshot = {
      name: input.guest.name,
      email: input.guest.email.toLowerCase(),
      phone: input.guest.phone,
      idDocument: input.guest.idDocument,
      documentType: input.documentType,
    };
  }

  const billing = await resolveAddress(
    db,
    customerId,
    input.billingAddressId,
    input.billingAddress,
  );
  const shipping = await resolveAddress(
    db,
    customerId,
    input.shippingAddressId,
    input.shippingAddress,
  );

  // ---- Build atomic batch ----
  const orderId = uuid();

  const orderInsert = db.insert(orders).values({
    id: orderId,
    storeId,
    cartId,
    customerId,
    guestSnapshot,
    billingAddressId: billing.id,
    billingSnapshot: billing.snapshot,
    shippingAddressId: shipping.id,
    shippingSnapshot: shipping.snapshot,
    documentType: input.documentType,
    subtotal,
    discountAmount,
    taxAmount,
    shippingAmount,
    total,
    currencyCode: settings.currencyCode,
    status: "pending_payment",
    paymentMethodId: paymentMethod.id,
    notes: input.notes ?? null,
  });

  const orderItemsInsert = db.insert(orderItems).values(
    cart.items.map((item) => ({
      orderId,
      variantId: item.variantId,
      productSnapshot: {
        productId: item.variant.productId,
        productName: item.variant.product.name,
        variantId: item.variantId,
        variantName: item.variant.name,
        sku: item.variant.sku,
        type: item.variant.product.type,
      },
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.unitPrice * item.quantity,
    })),
  );

  const stockUpdates = cart.items
    .filter((item) => item.variant.product.type === "physical")
    .map((item) =>
      db
        .update(productVariants)
        .set({ stock: sql`${productVariants.stock} - ${item.quantity}` })
        .where(eq(productVariants.id, item.variantId)),
    );

  const cartUpdate = db
    .update(carts)
    .set({ status: "completed" })
    .where(eq(carts.id, cartId));

  const couponUpdates = couponApplied
    ? [
        db
          .update(coupons)
          .set({ usedCount: sql`${coupons.usedCount} + 1` })
          .where(eq(coupons.id, cart.coupon!.id)),
      ]
    : [];

  await db.batch([
    orderInsert,
    orderItemsInsert,
    ...stockUpdates,
    cartUpdate,
    ...couponUpdates,
  ]);

  const order = await db.query.orders.findFirst({
    where: eq(orders.id, orderId),
    with: { items: true, paymentMethod: true },
  });

  // Bank transfer details for the frontend (business rule 6).
  let bankTransfer: unknown = null;
  if (paymentMethod.type === "bank_transfer") {
    bankTransfer = settings.bankTransferInfo ?? paymentMethod.config ?? null;
  }

  return { order, bankTransfer };
}
