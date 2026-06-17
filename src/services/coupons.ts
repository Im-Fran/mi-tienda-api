import { and, eq } from "drizzle-orm";
import { inArray } from "drizzle-orm";
import type { Database } from "../db";
import { couponCategories, couponProducts, coupons, productCategories } from "../db/schema";
import { conflict, notFound } from "../lib/errors";

type CouponRow = typeof coupons.$inferSelect;

export function listCoupons(db: Database, storeId: string) {
  return db.query.coupons.findMany({
    where: eq(coupons.storeId, storeId),
    with: { products: true, categories: true },
    orderBy: (co, { desc }) => desc(co.createdAt),
  });
}

export async function getCoupon(db: Database, storeId: string, id: string) {
  const coupon = await db.query.coupons.findFirst({
    where: and(eq(coupons.id, id), eq(coupons.storeId, storeId)),
    with: { products: true, categories: true },
  });
  if (!coupon) throw notFound("Coupon");
  return coupon;
}

async function syncCouponScope(
  db: Database,
  couponId: string,
  productIds?: string[],
  categoryIds?: string[],
) {
  if (productIds) {
    await db
      .delete(couponProducts)
      .where(eq(couponProducts.couponId, couponId));
    if (productIds.length > 0) {
      await db
        .insert(couponProducts)
        .values(productIds.map((productId) => ({ couponId, productId })));
    }
  }
  if (categoryIds) {
    await db
      .delete(couponCategories)
      .where(eq(couponCategories.couponId, couponId));
    if (categoryIds.length > 0) {
      await db
        .insert(couponCategories)
        .values(categoryIds.map((categoryId) => ({ couponId, categoryId })));
    }
  }
}

export async function createCoupon(
  db: Database,
  storeId: string,
  input: {
    code: string;
    type: "percentage" | "fixed";
    value: number;
    appliesTo?: "all" | "products" | "categories";
    occasion?: string | null;
    minOrderAmount?: number | null;
    maxUses?: number | null;
    startsAt?: Date | null;
    expiresAt?: Date | null;
    isActive?: boolean;
    productIds?: string[];
    categoryIds?: string[];
  },
) {
  const existing = await db.query.coupons.findFirst({
    where: and(eq(coupons.storeId, storeId), eq(coupons.code, input.code)),
  });
  if (existing)
    throw conflict("A coupon with this code already exists in the store");

  const [coupon] = await db
    .insert(coupons)
    .values({
      storeId,
      code: input.code,
      type: input.type,
      value: input.value,
      appliesTo: input.appliesTo ?? "all",
      occasion: input.occasion ?? null,
      minOrderAmount: input.minOrderAmount ?? null,
      maxUses: input.maxUses ?? null,
      startsAt: input.startsAt ?? null,
      expiresAt: input.expiresAt ?? null,
      isActive: input.isActive ?? true,
    })
    .returning();

  await syncCouponScope(db, coupon.id, input.productIds, input.categoryIds);
  return getCoupon(db, storeId, coupon.id);
}

export async function updateCoupon(
  db: Database,
  storeId: string,
  id: string,
  input: Record<string, unknown> & {
    code?: string;
    productIds?: string[];
    categoryIds?: string[];
  },
) {
  await getCoupon(db, storeId, id);
  const { productIds, categoryIds, ...patch } = input;

  if (input.code) {
    const clash = await db.query.coupons.findFirst({
      where: and(eq(coupons.storeId, storeId), eq(coupons.code, input.code)),
    });
    if (clash && clash.id !== id)
      throw conflict("A coupon with this code already exists in the store");
  }

  if (Object.keys(patch).length > 0) {
    await db
      .update(coupons)
      .set(patch as Partial<CouponRow>)
      .where(eq(coupons.id, id));
  }
  await syncCouponScope(db, id, productIds, categoryIds);
  return getCoupon(db, storeId, id);
}

export async function deleteCoupon(db: Database, storeId: string, id: string) {
  const [row] = await db
    .delete(coupons)
    .where(and(eq(coupons.id, id), eq(coupons.storeId, storeId)))
    .returning({ id: coupons.id });
  if (!row) throw notFound("Coupon");
}

// ---- Evaluation (shared by validate endpoint + checkout) ----

export interface CouponLineItem {
  productId: string;
  lineTotal: number;
}

export interface CouponEvaluation {
  valid: boolean;
  reason?: string;
  discount: number;
  coupon?: CouponRow;
}

export async function evaluateCoupon(
  db: Database,
  storeId: string,
  code: string,
  ctx: { subtotal: number; items?: CouponLineItem[] },
): Promise<CouponEvaluation> {
  const coupon = await db.query.coupons.findFirst({
    where: and(eq(coupons.storeId, storeId), eq(coupons.code, code)),
    with: { products: true, categories: true },
  });
  if (!coupon) return { valid: false, reason: "Coupon not found", discount: 0 };

  const now = new Date();
  if (!coupon.isActive)
    return { valid: false, reason: "Coupon is inactive", discount: 0, coupon };
  if (coupon.startsAt && now < coupon.startsAt)
    return { valid: false, reason: "Coupon is not active yet", discount: 0, coupon };
  if (coupon.expiresAt && now > coupon.expiresAt)
    return { valid: false, reason: "Coupon has expired", discount: 0, coupon };
  if (coupon.maxUses != null && coupon.usedCount >= coupon.maxUses)
    return { valid: false, reason: "Coupon usage limit reached", discount: 0, coupon };
  if (coupon.minOrderAmount != null && ctx.subtotal < coupon.minOrderAmount)
    return {
      valid: false,
      reason: "Order does not meet the minimum amount",
      discount: 0,
      coupon,
    };

  let base = ctx.subtotal;
  if (coupon.appliesTo !== "all") {
    if (!ctx.items)
      return {
        valid: false,
        reason: "Coupon scope requires cart items",
        discount: 0,
        coupon,
      };
    if (coupon.appliesTo === "products") {
      const allowed = new Set(coupon.products.map((p) => p.productId));
      base = ctx.items
        .filter((i) => allowed.has(i.productId))
        .reduce((sum, i) => sum + i.lineTotal, 0);
    } else {
      const allowedCats = new Set(coupon.categories.map((c) => c.categoryId));
      const productIds = [...new Set(ctx.items.map((i) => i.productId))];
      const pcs =
        productIds.length > 0
          ? await db
              .select({
                pid: productCategories.productId,
                cid: productCategories.categoryId,
              })
              .from(productCategories)
              .where(inArray(productCategories.productId, productIds))
          : [];
      const eligible = new Set(
        pcs.filter((pc) => allowedCats.has(pc.cid)).map((pc) => pc.pid),
      );
      base = ctx.items
        .filter((i) => eligible.has(i.productId))
        .reduce((sum, i) => sum + i.lineTotal, 0);
    }
  }

  if (base <= 0)
    return {
      valid: false,
      reason: "No eligible items for this coupon",
      discount: 0,
      coupon,
    };

  let discount =
    coupon.type === "percentage"
      ? Math.round((base * coupon.value) / 100)
      : Math.min(coupon.value, base);
  discount = Math.min(discount, ctx.subtotal);
  return { valid: true, discount, coupon };
}
