// Ambient declaration for the bits of `cloudflare:test` we use. Kept as a
// global script file (no top-level import/export) so the `declare module`
// is treated as an ambient module declaration by tsc.
declare module "cloudflare:test" {
  interface D1Migration {
    name: string;
    queries: string[];
  }
  export const env: import("../src/types").Env & {
    TEST_MIGRATIONS: D1Migration[];
  };
  export function applyD1Migrations(
    db: D1Database,
    migrations: D1Migration[],
  ): Promise<void>;
}
