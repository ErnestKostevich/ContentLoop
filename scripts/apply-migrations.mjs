/**
 * One-shot DB initializer.
 * Reads drizzle/*.sql files and runs them against DATABASE_URL via the
 * Neon HTTP driver. Idempotent — uses CREATE TABLE IF NOT EXISTS pattern
 * via drizzle-kit generate output (which already includes guards).
 *
 * Usage:
 *   $env:DATABASE_URL='postgresql://...'
 *   node scripts/apply-migrations.mjs
 */
import { neon } from "@neondatabase/serverless";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const sql = neon(url);
const dir = "./drizzle";

const files = (await readdir(dir))
  .filter((f) => f.endsWith(".sql"))
  .sort();

if (files.length === 0) {
  console.error("No .sql migrations found in ./drizzle");
  process.exit(1);
}

for (const file of files) {
  const body = await readFile(join(dir, file), "utf8");
  // Drizzle separates statements with `--> statement-breakpoint` markers
  const statements = body
    .split(/--> statement-breakpoint/g)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  console.log(`▶ ${file} (${statements.length} statements)`);
  for (const stmt of statements) {
    try {
      await sql.query(stmt);
    } catch (err) {
      // Tolerate "already exists" so the script is idempotent.
      const msg = String(err?.message ?? err);
      if (/already exists/i.test(msg)) {
        console.log("  ↪ already exists, skipping");
        continue;
      }
      console.error(`  ✗ failed:`, msg);
      console.error("  statement:", stmt.slice(0, 200));
      process.exit(1);
    }
  }
}

// Quick verification: list tables
const rows = await sql`
  SELECT table_name FROM information_schema.tables
  WHERE table_schema = 'public'
  ORDER BY table_name
`;
console.log("\n✓ done. Tables in public schema:");
for (const r of rows) console.log("  •", r.table_name);
