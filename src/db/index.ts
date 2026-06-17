import { drizzle, type DrizzleD1Database } from "drizzle-orm/d1";
import * as schema from "./schema";

/** Build a Drizzle client bound to a request's D1 binding. */
export function createDb(d1: D1Database) {
  return drizzle(d1, { schema });
}

export type Database = DrizzleD1Database<typeof schema>;
export { schema };
