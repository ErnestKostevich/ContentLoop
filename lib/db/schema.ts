/**
 * Database schema (Drizzle + Postgres).
 *
 * Mirrors the localStorage shapes in lib/storage.ts so the same client
 * code can switch between local-only and synced storage transparently.
 *
 * userId is the Clerk user ID — Clerk is the source of truth for
 * identity. We don't store passwords or PII.
 */
import {
  pgTable,
  text,
  jsonb,
  timestamp,
  primaryKey,
  index,
} from "drizzle-orm/pg-core";

/* ─────────────────────────── Voice profiles (Brand Kits) ─────────────────────────── */

export const voiceProfiles = pgTable(
  "voice_profiles",
  {
    userId: text("user_id").notNull(),
    id: text("id").notNull(), // matches the client-generated id
    name: text("name").notNull(),
    instructions: text("instructions").notNull().default(""),
    samples: jsonb("samples").$type<string[]>().notNull().default([]),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.id] }), index("vp_user_idx").on(t.userId)]
);

/* ─────────────────────────── Active profile pointer ─────────────────────────── */

export const userSettings = pgTable("user_settings", {
  userId: text("user_id").primaryKey(),
  activeProfileId: text("active_profile_id"),
  byokKey: text("byok_key"), // optionally synced (encrypted at rest by Neon)
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/* ─────────────────────────── Custom formats ─────────────────────────── */

export const customFormats = pgTable(
  "custom_formats",
  {
    userId: text("user_id").notNull(),
    id: text("id").notNull(),
    label: text("label").notNull(),
    description: text("description").notNull().default(""),
    systemPrompt: text("system_prompt").notNull(),
    color: text("color").notNull(),
    icon: text("icon").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.id] }),
    index("cf_user_idx").on(t.userId),
  ]
);

/* ─────────────────────────── History entries ─────────────────────────── */

interface HistoryResult {
  formatId: string;
  ok: boolean;
  text?: string;
  error?: string;
  usage?: { input: number; output: number };
}

export const historyEntries = pgTable(
  "history_entries",
  {
    userId: text("user_id").notNull(),
    id: text("id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    sourcePreview: text("source_preview").notNull(),
    sourceFull: text("source_full").notNull(),
    formats: jsonb("formats").$type<string[]>().notNull(),
    results: jsonb("results").$type<HistoryResult[]>().notNull(),
    voiceProfileUsed: jsonb("voice_profile_used")
      .$type<boolean>()
      .notNull()
      .default(false),
    voiceProfileName: text("voice_profile_name"),
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.id] }),
    index("he_user_idx").on(t.userId),
    index("he_created_idx").on(t.createdAt),
  ]
);

/* ─────────────────────────── Pro subscriptions ─────────────────────────── */

export const proSubscriptions = pgTable(
  "pro_subscriptions",
  {
    userId: text("user_id").notNull(),
    id: text("id").notNull(), // provider-side id (NOWPayments invoice id or Stripe sub id)
    provider: text("provider").notNull(), // "nowpayments" | "stripe"
    orderId: text("order_id"), // our generated order id
    status: text("status").notNull(), // raw provider status
    validUntil: timestamp("valid_until", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.id] }),
    index("ps_user_idx").on(t.userId),
    index("ps_valid_until_idx").on(t.validUntil),
  ]
);

export type VoiceProfileRow = typeof voiceProfiles.$inferSelect;
export type CustomFormatRow = typeof customFormats.$inferSelect;
export type HistoryRow = typeof historyEntries.$inferSelect;
export type ProSubRow = typeof proSubscriptions.$inferSelect;
