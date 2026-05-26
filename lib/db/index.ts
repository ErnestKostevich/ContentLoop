/**
 * Database client. Gated by DATABASE_URL — when unset, every helper
 * returns null and the caller falls back to localStorage. This lets
 * the app run in zero-cost mode (no DB) until you wire Neon.
 *
 * Setup:
 *   1. Sign up at https://neon.tech (free tier: 0.5 GB storage)
 *   2. Create a database (any name)
 *   3. Copy the pooled connection string (it starts with postgresql://)
 *   4. Add DATABASE_URL=... to .env.local AND to Vercel env vars
 *   5. Run `npm run db:push` to create tables
 */

import { neon, neonConfig } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// Use HTTP fetch (works on Vercel Edge + Node). Caches connections.
neonConfig.fetchConnectionCache = true;

let _db: NeonHttpDatabase<typeof schema> | null = null;

export function isDbEnabled(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

/** Returns null if DATABASE_URL is unset. Caller should fall back. */
export function getDb(): NeonHttpDatabase<typeof schema> | null {
  if (!process.env.DATABASE_URL) return null;
  if (_db) return _db;
  const sql = neon(process.env.DATABASE_URL);
  _db = drizzle(sql, { schema });
  return _db;
}

export { schema };
