import { defineConfig } from "drizzle-kit";

/**
 * drizzle-kit configuration.
 *
 * We only use drizzle-kit to GENERATE SQL migrations from the schema
 * (`npm run db:generate`). The generated SQL lives in `drizzle/migrations`
 * and is applied to D1 either with `wrangler d1 migrations apply` or through
 * the Cloudflare API.
 *
 * To push/pull directly against the remote D1 over HTTP, uncomment the
 * `driver` + `dbCredentials` block and provide a Cloudflare API token.
 */
export default defineConfig({
  schema: "./src/db/schema/index.ts",
  out: "./drizzle/migrations",
  dialect: "sqlite",
  casing: "snake_case",
  // driver: "d1-http",
  // dbCredentials: {
  //   accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
  //   databaseId: process.env.CLOUDFLARE_DATABASE_ID!,
  //   token: process.env.CLOUDFLARE_D1_TOKEN!,
  // },
});
