import type { Context } from "hono";
import type { ZodType } from "zod";
import { ValidationError } from "./errors";

/** Parse + validate the JSON body, throwing ValidationError (422) on failure. */
export async function parseJson<T>(c: Context, schema: ZodType<T>): Promise<T> {
  const body = await c.req.json().catch(() => ({}));
  const result = schema.safeParse(body);
  if (!result.success) throw new ValidationError(result.error);
  return result.data;
}

/** Parse + validate query string params. */
export function parseQuery<T>(c: Context, schema: ZodType<T>): T {
  const result = schema.safeParse(c.req.query());
  if (!result.success) throw new ValidationError(result.error);
  return result.data;
}

/** Parse + validate route params. */
export function parseParams<T>(c: Context, schema: ZodType<T>): T {
  const result = schema.safeParse(c.req.param());
  if (!result.success) throw new ValidationError(result.error);
  return result.data;
}
