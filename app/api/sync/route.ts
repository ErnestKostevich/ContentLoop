import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { eq, desc, and } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { isClerkEnabledServer } from "@/lib/auth";

export const runtime = "nodejs";

/**
 * Unified sync endpoint.
 *
 * GET  /api/sync          → pull everything for the signed-in user
 * POST /api/sync          → push a snapshot (overwrites server state)
 *
 * Requires both Clerk + DB to be configured. Without either, returns 503
 * and the client keeps using localStorage only.
 */

async function ensureReady(): Promise<{ userId: string } | NextResponse> {
  if (!isClerkEnabledServer()) {
    return NextResponse.json(
      { error: "Auth (Clerk) not configured on this deploy." },
      { status: 503 }
    );
  }
  const db = getDb();
  if (!db) {
    return NextResponse.json(
      { error: "Database (DATABASE_URL) not configured on this deploy." },
      { status: 503 }
    );
  }
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  return { userId };
}

export async function GET() {
  const ready = await ensureReady();
  if (ready instanceof NextResponse) return ready;
  const { userId } = ready;
  const db = getDb()!;

  const [profiles, formats, history, settings, sub] = await Promise.all([
    db
      .select()
      .from(schema.voiceProfiles)
      .where(eq(schema.voiceProfiles.userId, userId)),
    db
      .select()
      .from(schema.customFormats)
      .where(eq(schema.customFormats.userId, userId)),
    db
      .select()
      .from(schema.historyEntries)
      .where(eq(schema.historyEntries.userId, userId))
      .orderBy(desc(schema.historyEntries.createdAt))
      .limit(30),
    db
      .select()
      .from(schema.userSettings)
      .where(eq(schema.userSettings.userId, userId))
      .limit(1),
    db
      .select()
      .from(schema.proSubscriptions)
      .where(eq(schema.proSubscriptions.userId, userId))
      .orderBy(desc(schema.proSubscriptions.validUntil))
      .limit(1),
  ]);

  return NextResponse.json({
    profiles,
    formats,
    history,
    activeProfileId: settings[0]?.activeProfileId ?? null,
    proValidUntil:
      sub[0] && sub[0].validUntil.getTime() > Date.now()
        ? sub[0].validUntil.toISOString()
        : null,
  });
}

interface PushBody {
  profiles?: Array<{
    id: string;
    name: string;
    instructions: string;
    samples: string[];
    updatedAt?: string;
  }>;
  customFormats?: Array<{
    id: string;
    label: string;
    description: string;
    systemPrompt: string;
    color: string;
    icon: string;
    createdAt?: string;
  }>;
  history?: Array<{
    id: string;
    createdAt?: string;
    sourcePreview: string;
    sourceFull: string;
    formats: string[];
    results: unknown[];
    voiceProfileUsed: boolean;
    voiceProfileName?: string;
  }>;
  activeProfileId?: string | null;
}

export async function POST(req: NextRequest) {
  const ready = await ensureReady();
  if (ready instanceof NextResponse) return ready;
  const { userId } = ready;
  const db = getDb()!;

  let body: PushBody;
  try {
    body = (await req.json()) as PushBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Upsert voice profiles
  if (Array.isArray(body.profiles)) {
    for (const p of body.profiles) {
      await db
        .insert(schema.voiceProfiles)
        .values({
          userId,
          id: p.id,
          name: p.name,
          instructions: p.instructions,
          samples: p.samples ?? [],
          updatedAt: p.updatedAt ? new Date(p.updatedAt) : new Date(),
        })
        .onConflictDoUpdate({
          target: [schema.voiceProfiles.userId, schema.voiceProfiles.id],
          set: {
            name: p.name,
            instructions: p.instructions,
            samples: p.samples ?? [],
            updatedAt: p.updatedAt ? new Date(p.updatedAt) : new Date(),
          },
        });
    }
  }

  // Upsert custom formats
  if (Array.isArray(body.customFormats)) {
    for (const f of body.customFormats) {
      await db
        .insert(schema.customFormats)
        .values({
          userId,
          id: f.id,
          label: f.label,
          description: f.description ?? "",
          systemPrompt: f.systemPrompt,
          color: f.color,
          icon: f.icon,
          createdAt: f.createdAt ? new Date(f.createdAt) : new Date(),
        })
        .onConflictDoUpdate({
          target: [schema.customFormats.userId, schema.customFormats.id],
          set: {
            label: f.label,
            description: f.description ?? "",
            systemPrompt: f.systemPrompt,
            color: f.color,
            icon: f.icon,
          },
        });
    }
  }

  // Upsert history (keep server-side as superset; client pulls back top 30)
  if (Array.isArray(body.history)) {
    for (const h of body.history) {
      await db
        .insert(schema.historyEntries)
        .values({
          userId,
          id: h.id,
          createdAt: h.createdAt ? new Date(h.createdAt) : new Date(),
          sourcePreview: h.sourcePreview,
          sourceFull: h.sourceFull,
          formats: h.formats,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          results: h.results as any,
          voiceProfileUsed: h.voiceProfileUsed,
          voiceProfileName: h.voiceProfileName ?? null,
        })
        .onConflictDoNothing();
    }
  }

  // Update active profile pointer
  if (body.activeProfileId !== undefined) {
    await db
      .insert(schema.userSettings)
      .values({
        userId,
        activeProfileId: body.activeProfileId,
      })
      .onConflictDoUpdate({
        target: schema.userSettings.userId,
        set: { activeProfileId: body.activeProfileId },
      });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const ready = await ensureReady();
  if (ready instanceof NextResponse) return ready;
  const { userId } = ready;
  const db = getDb()!;

  const url = new URL(req.url);
  const kind = url.searchParams.get("kind"); // "profile" | "format" | "history"
  const id = url.searchParams.get("id");

  if (!kind || !id) {
    return NextResponse.json(
      { error: "Missing ?kind=&id=" },
      { status: 400 }
    );
  }

  if (kind === "profile") {
    await db
      .delete(schema.voiceProfiles)
      .where(
        and(
          eq(schema.voiceProfiles.userId, userId),
          eq(schema.voiceProfiles.id, id)
        )
      );
  } else if (kind === "format") {
    await db
      .delete(schema.customFormats)
      .where(
        and(
          eq(schema.customFormats.userId, userId),
          eq(schema.customFormats.id, id)
        )
      );
  } else if (kind === "history") {
    await db
      .delete(schema.historyEntries)
      .where(
        and(
          eq(schema.historyEntries.userId, userId),
          eq(schema.historyEntries.id, id)
        )
      );
  } else {
    return NextResponse.json({ error: "Unknown kind" }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
