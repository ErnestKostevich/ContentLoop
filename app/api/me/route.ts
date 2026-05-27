import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { isClerkEnabledServer } from "@/lib/auth";

export const runtime = "nodejs";

/**
 * GET /api/me — returns the signed-in user's Pro status (server-side
 * source of truth, used by the workspace to recover Pro after
 * localStorage is cleared).
 *
 * Response shapes:
 *   - {signedIn:false, ...flags}         when Clerk is off OR user is anon
 *   - {signedIn:true, userId, proValidUntil: string|null}  when signed in
 */
export async function GET() {
  const flags = {
    auth: isClerkEnabledServer(),
    db: Boolean(process.env.DATABASE_URL),
  };

  if (!isClerkEnabledServer()) {
    return NextResponse.json({ signedIn: false, ...flags });
  }

  try {
    const { auth } = await import("@clerk/nextjs/server");
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ signedIn: false, ...flags });
    }

    const db = getDb();
    let proValidUntil: string | null = null;
    if (db) {
      const rows = await db
        .select()
        .from(schema.proSubscriptions)
        .where(eq(schema.proSubscriptions.userId, userId))
        .orderBy(desc(schema.proSubscriptions.validUntil))
        .limit(1);
      const top = rows[0];
      if (top && top.validUntil.getTime() > Date.now()) {
        proValidUntil = top.validUntil.toISOString();
      }
    }

    return NextResponse.json({
      signedIn: true,
      userId,
      proValidUntil,
      ...flags,
    });
  } catch (e) {
    return NextResponse.json(
      {
        signedIn: false,
        error: e instanceof Error ? e.message : "auth error",
        ...flags,
      },
      { status: 500 }
    );
  }
}
