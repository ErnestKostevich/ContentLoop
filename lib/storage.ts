/**
 * localStorage-backed persistence for client-only features.
 * Used by workspace + /voice + /formats for VoiceProfile (Brand Kits),
 * CustomFormat library, generation history, BYOK key.
 *
 * All keys are namespaced under "contentloop:".
 * When we wire Clerk + Postgres in v0.4, the same shapes mirror to the DB.
 */

import type { FormatId } from "./formats";

const NS = "contentloop:";
const KEY_VOICE_LEGACY = NS + "voice-profile"; // single profile (pre-v0.3)
const KEY_PROFILES = NS + "voice-profiles"; // brand kits (array)
const KEY_ACTIVE_PROFILE = NS + "voice-active";
const KEY_CUSTOM_FORMATS = NS + "custom-formats";
const KEY_HISTORY = NS + "history";
const KEY_BYOK = NS + "byok";

const MAX_HISTORY = 30;
const MAX_CUSTOM_FORMATS = 12;
const MAX_PROFILES = 8;

/* ─────────────────────────── Types ─────────────────────────── */

export interface VoiceProfile {
  id: string;
  name: string;
  /** Raw user-provided style instructions, used as-is. */
  instructions: string;
  /** Optional past-post samples the user pasted in. */
  samples: string[];
  updatedAt: string; // ISO
}

export interface CustomFormat {
  id: string;
  label: string;
  description: string;
  /** Full system-prompt body for this format. Used in place of built-in. */
  systemPrompt: string;
  /** Tailwind gradient classes (e.g. "from-amber-400 to-orange-600"). */
  color: string;
  /** Lucide icon name (mapped in workspace ICONS). */
  icon: string;
  createdAt: string;
}

export interface HistoryEntry {
  id: string;
  createdAt: string;
  sourcePreview: string;
  sourceFull: string;
  formats: string[]; // FormatId | customFormat.id
  results: {
    formatId: string;
    ok: boolean;
    text?: string;
    error?: string;
    usage?: { input: number; output: number };
  }[];
  voiceProfileUsed: boolean;
  voiceProfileName?: string;
}

function safeWindow(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

/* ─────────────────────────── Voice profile (Brand Kits) ─────────────────────────── */

export function loadProfiles(): VoiceProfile[] {
  const ls = safeWindow();
  if (!ls) return [];
  const raw = ls.getItem(KEY_PROFILES);
  if (!raw) {
    // One-time migration from legacy single profile
    const legacy = ls.getItem(KEY_VOICE_LEGACY);
    if (legacy) {
      try {
        const parsed = JSON.parse(legacy) as {
          instructions?: string;
          samples?: string[];
          updatedAt?: string;
        };
        if (parsed && typeof parsed.instructions === "string") {
          const migrated: VoiceProfile = {
            id: "default",
            name: "Default",
            instructions: parsed.instructions,
            samples: parsed.samples ?? [],
            updatedAt: parsed.updatedAt ?? new Date().toISOString(),
          };
          ls.setItem(KEY_PROFILES, JSON.stringify([migrated]));
          ls.setItem(KEY_ACTIVE_PROFILE, "default");
          ls.removeItem(KEY_VOICE_LEGACY);
          return [migrated];
        }
      } catch {
        /* ignore */
      }
    }
    return [];
  }
  try {
    const parsed = JSON.parse(raw) as VoiceProfile[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveProfile(profile: VoiceProfile): VoiceProfile[] {
  const ls = safeWindow();
  const existing = loadProfiles();
  const idx = existing.findIndex((p) => p.id === profile.id);
  let next: VoiceProfile[];
  if (idx >= 0) {
    next = [...existing];
    next[idx] = profile;
  } else {
    if (existing.length >= MAX_PROFILES) {
      throw new Error(
        `Maximum ${MAX_PROFILES} voice profiles. Delete one before creating a new one.`
      );
    }
    next = [...existing, profile];
  }
  if (ls) ls.setItem(KEY_PROFILES, JSON.stringify(next));
  return next;
}

export function deleteProfile(id: string): VoiceProfile[] {
  const next = loadProfiles().filter((p) => p.id !== id);
  const ls = safeWindow();
  if (ls) {
    ls.setItem(KEY_PROFILES, JSON.stringify(next));
    if (getActiveProfileId() === id) {
      ls.removeItem(KEY_ACTIVE_PROFILE);
    }
  }
  return next;
}

export function getActiveProfileId(): string | null {
  const ls = safeWindow();
  if (!ls) return null;
  return ls.getItem(KEY_ACTIVE_PROFILE);
}

export function setActiveProfileId(id: string | null): void {
  const ls = safeWindow();
  if (!ls) return;
  if (id) ls.setItem(KEY_ACTIVE_PROFILE, id);
  else ls.removeItem(KEY_ACTIVE_PROFILE);
}

export function getActiveProfile(): VoiceProfile | null {
  const id = getActiveProfileId();
  if (!id) {
    // If exactly one profile exists, treat it as active automatically.
    const all = loadProfiles();
    if (all.length === 1) return all[0]!;
    return null;
  }
  return loadProfiles().find((p) => p.id === id) ?? null;
}

// ─── Legacy single-profile shims (kept for older call sites) ───
export function loadVoiceProfile(): VoiceProfile | null {
  return getActiveProfile();
}
export function saveVoiceProfile(
  profile: Omit<VoiceProfile, "id" | "name"> & {
    id?: string;
    name?: string;
  }
): void {
  const full: VoiceProfile = {
    id: profile.id ?? "default",
    name: profile.name ?? "Default",
    instructions: profile.instructions,
    samples: profile.samples,
    updatedAt: profile.updatedAt,
  };
  saveProfile(full);
  if (!getActiveProfileId()) setActiveProfileId(full.id);
}
export function clearVoiceProfile(): void {
  const ls = safeWindow();
  if (!ls) return;
  ls.removeItem(KEY_PROFILES);
  ls.removeItem(KEY_ACTIVE_PROFILE);
}

/* ─────────────────────────── Custom Formats ─────────────────────────── */

export function loadCustomFormats(): CustomFormat[] {
  const ls = safeWindow();
  if (!ls) return [];
  const raw = ls.getItem(KEY_CUSTOM_FORMATS);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as CustomFormat[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCustomFormat(format: CustomFormat): CustomFormat[] {
  const existing = loadCustomFormats();
  const idx = existing.findIndex((f) => f.id === format.id);
  let next: CustomFormat[];
  if (idx >= 0) {
    next = [...existing];
    next[idx] = format;
  } else {
    if (existing.length >= MAX_CUSTOM_FORMATS) {
      throw new Error(
        `Maximum ${MAX_CUSTOM_FORMATS} custom formats. Delete one to add a new one.`
      );
    }
    next = [...existing, format];
  }
  const ls = safeWindow();
  if (ls) ls.setItem(KEY_CUSTOM_FORMATS, JSON.stringify(next));
  return next;
}

export function deleteCustomFormat(id: string): CustomFormat[] {
  const next = loadCustomFormats().filter((f) => f.id !== id);
  const ls = safeWindow();
  if (ls) ls.setItem(KEY_CUSTOM_FORMATS, JSON.stringify(next));
  return next;
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

/* ─────────────────────────── BYOK ─────────────────────────── */

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
  return (
    Date.now().toString(36) +
    "-" +
    Math.random().toString(36).slice(2, 8)
  );
}

export { MAX_CUSTOM_FORMATS, MAX_PROFILES };
