"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Save,
  Trash2,
  Wand2,
  Plus,
  X,
  Check,
  AlertCircle,
  ArrowLeft,
  Lock,
  Sparkles,
} from "lucide-react";
import {
  loadProfiles,
  saveProfile,
  deleteProfile,
  getActiveProfileId,
  setActiveProfileId,
  newId,
  type VoiceProfile,
  MAX_PROFILES,
} from "@/lib/storage";
import { canUseProFeatures, isPaymentsEnabledClient } from "@/lib/pro";
import { cn } from "@/lib/utils";

const MAX_SAMPLES = 5;
const MAX_SAMPLE_LEN = 4_000;
const MAX_INSTRUCTIONS_LEN = 1_500;

interface Draft {
  id: string;
  name: string;
  instructions: string;
  samples: string[];
}

const blankDraft = (existingCount: number): Draft => ({
  id: newId(),
  name:
    existingCount === 0 ? "Default" : `Profile ${existingCount + 1}`,
  instructions: "",
  samples: [""],
});

export function VoiceProfileEditor() {
  const [hydrated, setHydrated] = useState(false);
  const [profiles, setProfiles] = useState<VoiceProfile[]>([]);
  const [activeId, setActiveIdState] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState(false);
  const [proAvailable, setProAvailable] = useState(true);
  const [paymentsLive, setPaymentsLive] = useState(false);

  useEffect(() => {
    setProfiles(loadProfiles());
    setActiveIdState(getActiveProfileId());
    setProAvailable(canUseProFeatures());
    setPaymentsLive(isPaymentsEnabledClient());
    setHydrated(true);
  }, []);

  function startEdit(p: VoiceProfile) {
    setDraft({
      id: p.id,
      name: p.name,
      instructions: p.instructions,
      samples: p.samples.length ? p.samples : [""],
    });
    setError(null);
  }

  function startNew() {
    setDraft(blankDraft(profiles.length));
    setError(null);
  }

  function cancel() {
    setDraft(null);
    setError(null);
  }

  function save() {
    if (!draft) return;
    const filledSamples = draft.samples.filter((s) => s.trim().length > 0);
    const instructions = draft.instructions.trim();
    if (instructions.length === 0 && filledSamples.length === 0) {
      setError(
        "Add style rules or at least one sample before saving the profile."
      );
      return;
    }
    if (draft.name.trim().length === 0) {
      setError("Give the profile a name.");
      return;
    }
    const full: VoiceProfile = {
      id: draft.id,
      name: draft.name.trim(),
      instructions,
      samples: filledSamples,
      updatedAt: new Date().toISOString(),
    };
    try {
      const next = saveProfile(full);
      setProfiles(next);
      // Auto-activate if there's no active profile yet
      if (!activeId) {
        setActiveProfileId(full.id);
        setActiveIdState(full.id);
      }
      setDraft(null);
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 1500);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save.");
    }
  }

  function remove(id: string) {
    const p = profiles.find((x) => x.id === id);
    if (!p) return;
    if (!confirm(`Delete profile "${p.name}"? This can't be undone.`)) return;
    const next = deleteProfile(id);
    setProfiles(next);
    if (activeId === id) {
      setActiveIdState(null);
    }
    if (draft?.id === id) setDraft(null);
  }

  function activate(id: string) {
    setActiveProfileId(id);
    setActiveIdState(id);
  }

  function clearActive() {
    setActiveProfileId(null);
    setActiveIdState(null);
  }

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 text-neutral-500">
        Loading…
      </div>
    );
  }

  const lockedForNew =
    !proAvailable && profiles.length >= 1; // Free tier = 1 profile only

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Link
        href="/app"
        className="inline-flex items-center gap-1.5 text-sm text-neutral-400 hover:text-white transition"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to workspace
      </Link>

      <div className="mt-6 flex items-start gap-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white shadow-lg shadow-fuchsia-500/20">
          <Wand2 className="h-5 w-5" />
        </span>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              Voice profiles
            </h1>
            {profiles.length > 1 && (
              <span className="rounded-full border border-fuchsia-400/30 bg-fuchsia-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-fuchsia-300">
                Brand Kits · Pro
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-neutral-400">
            Teach ContentLoop how <em>you</em> write — and switch between
            voices for different brands or clients.
          </p>
        </div>
      </div>

      {justSaved && (
        <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-200">
          <Check className="h-3 w-3" />
          Saved
        </div>
      )}

      {/* Profile list */}
      <section className="mt-8 space-y-3">
        {profiles.length === 0 && !draft && (
          <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center">
            <p className="text-sm text-neutral-400">
              No profiles yet. Create your first one.
            </p>
          </div>
        )}

        {profiles.map((p) => {
          const isActive = activeId === p.id;
          return (
            <div
              key={p.id}
              className={cn(
                "rounded-2xl border p-5 transition",
                isActive
                  ? "border-emerald-400/30 bg-emerald-500/[0.04]"
                  : "border-white/10 bg-white/[0.03]"
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-neutral-100">
                      {p.name}
                    </h3>
                    {isActive && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-1.5 text-[10px] font-medium text-emerald-200">
                        <span className="h-1 w-1 rounded-full bg-emerald-400" />
                        active
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-neutral-500">
                    {p.samples.length} sample
                    {p.samples.length === 1 ? "" : "s"}
                    {p.instructions ? ` · ${p.instructions.length} chars of rules` : ""}
                  </p>
                  {p.instructions && (
                    <p className="mt-2 line-clamp-2 text-[11px] text-neutral-500">
                      {p.instructions}
                    </p>
                  )}
                </div>
                <div className="flex flex-none items-center gap-1">
                  {!isActive ? (
                    <button
                      type="button"
                      onClick={() => activate(p.id)}
                      className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs text-neutral-200 hover:bg-white/10 transition"
                    >
                      Activate
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={clearActive}
                      className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs text-neutral-400 hover:text-white hover:bg-white/10 transition"
                    >
                      Deactivate
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => startEdit(p)}
                    className="rounded-md px-2 py-1 text-xs text-neutral-300 hover:bg-white/5 hover:text-white transition"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(p.id)}
                    className="rounded-md p-1 text-neutral-500 hover:text-rose-400 transition"
                    aria-label="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* Pro gate for additional profiles */}
      {lockedForNew && !draft && paymentsLive && (
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-fuchsia-500/30 bg-gradient-to-b from-fuchsia-500/[0.06] to-transparent p-5">
          <Lock className="mt-0.5 h-5 w-5 flex-none text-fuchsia-300" />
          <div className="flex-1">
            <p className="text-sm font-medium text-neutral-100">
              Multiple voice profiles is a Pro feature.
            </p>
            <p className="mt-1 text-sm text-neutral-400">
              Free tier has one profile. Pro unlocks unlimited{" "}
              <strong>Brand Kits</strong> — separate voices for your
              personal brand, each client, each newsletter.
            </p>
            <Link
              href="/#pricing"
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-neutral-950 hover:bg-neutral-200 transition"
            >
              See Pro plan
            </Link>
          </div>
        </div>
      )}

      {/* Create button */}
      {!draft && profiles.length < MAX_PROFILES && (
        <button
          type="button"
          onClick={startNew}
          disabled={lockedForNew}
          className={cn(
            "mt-6 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition",
            lockedForNew
              ? "cursor-not-allowed bg-neutral-800 text-neutral-500"
              : "bg-white text-neutral-950 shadow-lg shadow-black/30 hover:bg-neutral-200"
          )}
        >
          {lockedForNew ? (
            <>
              <Lock className="h-4 w-4" />
              Pro to add more profiles
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" />
              {profiles.length === 0 ? "Create first profile" : "New profile"}
            </>
          )}
        </button>
      )}

      {/* Editor */}
      {draft && (
        <DraftEditor
          draft={draft}
          setDraft={setDraft}
          onSave={save}
          onCancel={cancel}
          error={error}
        />
      )}

      <p className="mt-8 text-xs text-neutral-500">
        Profiles live in this browser only — when sync ships (v0.4) they
        move to your account.
      </p>
    </div>
  );
}

/* ─────────────────────────── Editor sub-component ─────────────────────────── */

function DraftEditor({
  draft,
  setDraft,
  onSave,
  onCancel,
  error,
}: {
  draft: Draft;
  setDraft: (d: Draft) => void;
  onSave: () => void;
  onCancel: () => void;
  error: string | null;
}) {
  const filledSamples = draft.samples.filter((s) => s.trim().length > 0);

  function addSample() {
    if (draft.samples.length >= MAX_SAMPLES) return;
    setDraft({ ...draft, samples: [...draft.samples, ""] });
  }
  function removeSample(idx: number) {
    setDraft({
      ...draft,
      samples: draft.samples.filter((_, i) => i !== idx),
    });
  }
  function updateSample(idx: number, value: string) {
    setDraft({
      ...draft,
      samples: draft.samples.map((v, i) => (i === idx ? value : v)),
    });
  }

  return (
    <section className="mt-6 rounded-2xl border border-fuchsia-400/30 bg-fuchsia-500/[0.03] p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">Edit profile</h2>
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition"
          aria-label="Cancel"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-5">
        <label className="text-xs font-medium text-neutral-300">
          Profile name
        </label>
        <input
          type="text"
          value={draft.name}
          maxLength={40}
          onChange={(e) => setDraft({ ...draft, name: e.target.value })}
          placeholder="e.g. Personal, Client A, Newsletter"
          className="mt-2 w-full rounded-lg border border-white/10 bg-neutral-950/60 px-3 py-2 text-sm text-neutral-100 outline-none placeholder:text-neutral-600 focus:border-fuchsia-400/40"
        />
      </div>

      <div className="mt-5">
        <label className="text-xs font-medium text-neutral-300">
          Style rules
        </label>
        <p className="mt-1 text-xs text-neutral-500">
          Plain-English instructions about how you write. Concrete &gt; abstract.
        </p>
        <textarea
          value={draft.instructions}
          onChange={(e) =>
            setDraft({
              ...draft,
              instructions: e.target.value.slice(0, MAX_INSTRUCTIONS_LEN),
            })
          }
          placeholder={`e.g.
- Lowercase only.
- No emojis except 🔥 for emphasis.
- Hooks start with a number or counter-intuitive claim.`}
          className="mt-2 h-36 w-full resize-y rounded-lg border border-white/10 bg-neutral-950/60 p-3 font-mono text-sm text-neutral-100 outline-none placeholder:text-neutral-600 focus:border-fuchsia-400/40"
        />
        <div className="mt-1 text-right text-[10px] text-neutral-500">
          {draft.instructions.length} / {MAX_INSTRUCTIONS_LEN}
        </div>
      </div>

      <div className="mt-5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-neutral-300">
            Past-post samples
          </label>
          <span className="text-[10px] text-neutral-500">
            {filledSamples.length} / {MAX_SAMPLES}
          </span>
        </div>

        <div className="mt-2 space-y-2">
          {draft.samples.map((s, i) => (
            <div
              key={i}
              className="relative rounded-lg border border-white/10 bg-neutral-950/60"
            >
              <div className="flex items-center justify-between border-b border-white/5 px-3 py-1.5">
                <span className="text-[10px] font-medium text-neutral-500">
                  Sample {i + 1}
                </span>
                {draft.samples.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSample(i)}
                    className="text-neutral-500 hover:text-rose-400 transition"
                    aria-label="Remove sample"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
              <textarea
                value={s}
                onChange={(e) =>
                  updateSample(i, e.target.value.slice(0, MAX_SAMPLE_LEN))
                }
                placeholder="Paste one of your past posts here…"
                className="h-24 w-full resize-y bg-transparent p-2.5 text-xs text-neutral-100 outline-none placeholder:text-neutral-600"
              />
            </div>
          ))}
        </div>

        {draft.samples.length < MAX_SAMPLES && (
          <button
            type="button"
            onClick={addSample}
            className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] text-neutral-200 hover:bg-white/[0.07] transition"
          >
            <Plus className="h-3 w-3" />
            Add sample
          </button>
        )}
      </div>

      {error && (
        <div className="mt-4 flex items-start gap-2 rounded-lg border border-amber-400/20 bg-amber-500/[0.06] p-3 text-xs text-amber-100">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-none text-amber-300" />
          <p>{error}</p>
        </div>
      )}

      <div className="mt-5 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex h-10 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] px-4 text-sm text-neutral-200 hover:bg-white/[0.07] transition"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onSave}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-white px-5 text-sm font-semibold text-neutral-950 shadow-lg shadow-black/30 hover:bg-neutral-200 transition"
        >
          <Save className="h-4 w-4" />
          Save profile
        </button>
      </div>
    </section>
  );
}
