/**
 * localStorage-backed persistence for client-only features.
 * Used by workspace + /voice for VoiceProfile, generation history, BYOK key.
 *
 * All keys are namespaced under "contentloop:".
 * No DB needed for MVP — when we wire Clerk + Postgres we'll mirror the same shapes.
 */

import type { FormatId } from "./formats";

const NS = "contentloop:";
const KEY_VOICE = NS + "voice-profile";
const KEY_HISTORY = NS + "history";
const KEY_BYOK = NS + "byok";

const MAX_HISTORY = 30;

export interface VoiceProfile {
  /** Raw user-provided style instructions, used as-is. */
  instructions: string;
  /** Optional past-post samples the user pasted in. */
  samples: string[];
  updatedAt: string; // ISO
}

export interface HistoryEntry {
  id: string;
  createdAt: string;
  sourcePreview: string; // first ~120 chars of source
  sourceFull: string;
  formats: FormatId[];
  results: { formatId: FormatId; ok: boolean; text?: string; error?: string }[];
  voiceProfileUsed: boolean;
}

function safeWindow(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

/* ─────────────────────────── Voice profile ─────────────────────────── */

export function loadVoiceProfile(): VoiceProfile | null {
  const ls = safeWindow();
  if (!ls) return null;
  const raw = ls.getItem(KEY_VOICE);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as VoiceProfile;
    if (typeof parsed.instructions !== "string") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveVoiceProfile(profile: VoiceProfile): void {
  const ls = safeWindow();
  if (!ls) return;
  ls.setItem(KEY_VOICE, JSON.stringify(profile));
}

export function clearVoiceProfile(): void {
  const ls = safeWindow();
  if (!ls) return;
  ls.removeItem(KEY_VOICE);
}

/* ─────────────────────────── History ─────────────────────────── */

export function loadHistory(): HistoryEntry[] {
  const ls = safeWindow();
  if (!ls) return [];
  const raw = ls.getItem(KEY_HISTORY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as HistoryEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function appendHistory(entry: HistoryEntry): HistoryEntry[] {
  const existing = loadHistory();
  const next = [entry, ...existing].slice(0, MAX_HISTORY);
  const ls = safeWindow();
  if (ls) ls.setItem(KEY_HISTORY, JSON.stringify(next));
  return next;
}

export function deleteHistoryEntry(id: string): HistoryEntry[] {
  const next = loadHistory().filter((e) => e.id !== id);
  const ls = safeWindow();
  if (ls) ls.setItem(KEY_HISTORY, JSON.stringify(next));
  return next;
}

export function clearHistory(): void {
  const ls = safeWindow();
  if (ls) ls.removeItem(KEY_HISTORY);
}

/* ─────────────────────────── BYOK (bring your own key) ─────────────────────────── */

export function loadByokKey(): string | null {
  const ls = safeWindow();
  if (!ls) return null;
  return ls.getItem(KEY_BYOK);
}

export function saveByokKey(key: string): void {
  const ls = safeWindow();
  if (!ls) return;
  if (!key) ls.removeItem(KEY_BYOK);
  else ls.setItem(KEY_BYOK, key);
}

export function clearByokKey(): void {
  const ls = safeWindow();
  if (ls) ls.removeItem(KEY_BYOK);
}

/* ─────────────────────────── Misc ─────────────────────────── */

export function newId(): string {
  // good enough for client-only history; not a security token
  return (
    Date.now().toString(36) +
    "-" +
    Math.random().toString(36).slice(2, 8)
  );
}
