import { desc, eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { PRO_PLAN_DAYS } from "@/lib/payments";

const DAY_MS = 24 * 60 * 60 * 1000;

export async function txHashAlreadyUsed(txHash: string): Promise<boolean> {
  const db = getDb();
  if (!db) return false;
  const normalized = txHash.toLowerCase();
  const rows = await db
    .select({ id: schema.proSubscriptions.id })
    .from(schema.proSubscriptions)
    .where(eq(schema.proSubscriptions.id, normalized))
    .limit(1);
  return rows.length > 0;
}

export async function grantProSubscription(
  userId: string,
  txHash: string,
  provider: string,
  days = PRO_PLAN_DAYS
): Promise<{ validUntil: string }> {
  const db = getDb();
  if (!db) {
    throw new Error("Database is not configured. Cannot grant Pro.");
  }

  const id = txHash.toLowerCase();
  if (await txHashAlreadyUsed(id)) {
    throw new Error("This transaction hash was already used.");
  }

  const existing = await db
    .select()
    .from(schema.proSubscriptions)
    .where(eq(schema.proSubscriptions.userId, userId))
    .orderBy(desc(schema.proSubscriptions.validUntil))
    .limit(1);

  const now = Date.now();
  const currentUntil = existing[0]?.validUntil.getTime() ?? 0;
  const base = Math.max(now, currentUntil);
  const validUntil = new Date(base + days * DAY_MS);

  await db.insert(schema.proSubscriptions).values({
    userId,
    id,
    provider,
    orderId: id,
    status: "confirmed",
    validUntil,
  });

  return { validUntil: validUntil.toISOString() };
}