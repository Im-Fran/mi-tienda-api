import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { cloudflareTest, readD1Migrations } from "@cloudflare/vitest-pool-workers";
import { defineConfig } from "vitest/config";

/**
 * Locate `drizzle/migrations` by walking up from this config file. Vite loads
 * the config from a temp directory, so a cwd-relative path is unreliable.
 */
function findMigrationsDir(): string {
  let dir = path.dirname(fileURLToPath(import.meta.url));
  for (let i = 0; i < 8; i++) {
    const candidate = path.join(dir, "drizzle", "migrations");
    if (existsSync(candidate)) return candidate;
    dir = path.dirname(dir);
  }
  throw new Error("Could not locate drizzle/migrations");
}

export default defineConfig(async () => {
  const migrationsDir = findMigrationsDir();
  const projectRoot = path.resolve(migrationsDir, "..", "..");
  const migrations = await readD1Migrations(migrationsDir);

  return {
    root: projectRoot,
    plugins: [
      cloudflareTest({
        singleWorker: true,
        isolatedStorage: true,
        wrangler: { configPath: "./wrangler.jsonc" },
        miniflare: {
          compatibilityDate: "2026-06-17",
          compatibilityFlags: ["nodejs_compat"],
          bindings: {
            TEST_MIGRATIONS: migrations,
            // Force email to no-op and provide deterministic OAuth secrets.
            EMAIL_PROVIDER: "noop",
            GOOGLE_CLIENT_ID: "test-google-id",
            GOOGLE_CLIENT_SECRET: "test-google-secret",
            GITHUB_CLIENT_ID: "test-github-id",
            GITHUB_CLIENT_SECRET: "test-github-secret",
            RESEND_API_KEY: "test-resend-key",
          },
        },
      }),
    ],
    test: {
      include: ["test/**/*.test.ts"],
      setupFiles: ["./test/apply-migrations.ts"],
    },
  };
});
