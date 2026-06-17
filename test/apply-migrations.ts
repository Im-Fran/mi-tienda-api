import { applyD1Migrations, env } from "cloudflare:test";

// Apply the generated D1 migrations to the isolated test database once per
// test file. Runs before the tests (see vitest.config.ts setupFiles).
await applyD1Migrations(env.DB, env.TEST_MIGRATIONS);
