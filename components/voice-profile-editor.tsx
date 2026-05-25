"use client";

import { useEffect, useState } from "react";
import {
  Save,
  Trash2,
  Wand2,
  Plus,
  X,
  Check,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import {
  loadVoiceProfile,
  saveVoiceProfile,
  clearVoiceProfile,
  type VoiceProfile,
} from "@/lib/storage";

const MAX_SAMPLES = 5;
const MAX_SAMPLE_LEN = 4_000;
const MAX_INSTRUCTIONS_LEN = 1_500;

export function VoiceProfileEditor() {
  const [instructions, setInstructions] = useState("");
  const [samples, setSamples] = useState<string[]>([""]);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const profile = loadVoiceProfile();
    if (profile) {
      setInstructions(profile.instructions ?? "");
      setSamples(profile.samples?.length ? profile.samples : [""]);
      setSavedAt(profile.updatedAt);
    }
    setHydrated(true);
  }, []);

  const filledSamples = samples.filter((s) => s.trim().length > 0);
  const hasContent =
    instructions.trim().length > 0 || filledSamples.length > 0;

  function addSample() {
    if (samples.length >= MAX_SAMPLES) return;
    setSamples((s) => [...s, ""]);
  }
  function removeSample(idx: number) {
    setSamples((s) => s.filter((_, i) => i !== idx));
  }
  function updateSample(idx: number, value: string) {
    setSamples((s) => s.map((v, i) => (i === idx ? value : v)));
  }

  function save() {
    const profile: VoiceProfile = {
      instructions: instructions.trim(),
      samples: filledSamples,
      updatedAt: new Date().toISOString(),
    };
    saveVoiceProfile(profile);
    setSavedAt(profile.updatedAt);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 1500);
  }

  function reset() {
    if (
      !confirm(
        "Delete your voice profile? This can't be undone (without re-typing it)."
      )
    )
      return;
    clearVoiceProfile();
    setInstructions("");
    setSamples([""]);
    setSavedAt(null);
  }

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 text-neutral-500">
        Loading…
      </div>
    );
  }

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
          <h1 className="text-2xl font-semibold tracking-tight">
            Voice profile
          </h1>
          <p className="mt-1 text-sm text-neutral-400">
            Teach ContentLoop how <em>you</em> write. Apply it to every
            generation automatically.
          </p>
        </div>
      </div>

      {savedAt && (
        <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-200">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          Active — last saved {new Date(savedAt).toLocaleString()}
        </div>
      )}

      <section className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
        <h2 className="text-base font-semibold">Style rules</h2>
        <p className="mt-1 text-sm text-neutral-400">
          Plain-English instructions about how you write. Concrete &gt; abstract.
        </p>
        <textarea
          value={instructions}
          onChange={(e) =>
            setInstructions(e.target.value.slice(0, MAX_INSTRUCTIONS_LEN))
          }
          placeholder={`e.g.
- Lowercase only.
- No emojis except 🔥 for emphasis.
- Hooks start with a number or a counter-intuitive claim.
- I write to indie founders. Never sales-y.`}
          className="mt-3 h-44 w-full resize-y rounded-xl border border-white/10 bg-neutral-950/60 p-4 font-mono text-sm text-neutral-100 outline-none placeholder:text-neutral-600 focus:border-fuchsia-400/40 focus:ring-2 focus:ring-fuchsia-400/10"
        />
        <div className="mt-1 text-right text-xs text-neutral-500">
          {instructions.length} / {MAX_INSTRUCTIONS_LEN}
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Past-post samples</h2>
          <span className="text-xs text-neutral-500">
            {filledSamples.length} / {MAX_SAMPLES}
          </span>
        </div>
        <p className="mt-1 text-sm text-neutral-400">
          Paste 2–5 of your best past posts (any platform). We&apos;ll mirror
          rhythm, length, emoji habits — without copying phrases.
        </p>

        <div className="mt-4 space-y-3">
          {samples.map((s, i) => (
            <div
              key={i}
              className="relative rounded-xl border border-white/10 bg-neutral-950/60"
            >
              <div className="flex items-center justify-between border-b border-white/5 px-3 py-2">
                <span className="text-xs font-medium text-neutral-400">
                  Sample {i + 1}
                </span>
                {samples.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSample(i)}
                    className="text-neutral-500 hover:text-rose-400 transition"
                    aria-label="Remove sample"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <textarea
                value={s}
                onChange={(e) =>
                  updateSample(i, e.target.value.slice(0, MAX_SAMPLE_LEN))
                }
                placeholder="Paste one of your past posts here…"
                className="h-32 w-full resize-y bg-transparent p-3 text-sm text-neutral-100 outline-none placeholder:text-neutral-600"
              />
              <div className="border-t border-white/5 px-3 py-1.5 text-right text-[10px] text-neutral-500">
                {s.length} / {MAX_SAMPLE_LEN}
              </div>
            </div>
          ))}
        </div>

        {samples.length < MAX_SAMPLES && (
          <button
            type="button"
            onClick={addSample}
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-neutral-200 hover:bg-white/[0.07] transition"
          >
            <Plus className="h-3.5 w-3.5" />
            Add another sample
          </button>
        )}
      </section>

      {!hasContent && (
        <div className="mt-6 flex items-start gap-2 rounded-xl border border-amber-400/20 bg-amber-500/[0.05] p-4 text-sm text-amber-100">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-none text-amber-300" />
          <p>
            Add style rules <span className="text-amber-300">or</span> at
            least one sample to save a profile.
          </p>
        </div>
      )}

      <div className="mt-7 flex items-center justify-between">
        <button
          type="button"
          onClick={reset}
          disabled={!savedAt && !hasContent}
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-neutral-300 hover:bg-white/[0.07] transition disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Trash2 className="h-4 w-4" />
          Clear profile
        </button>
        <button
          type="button"
          onClick={save}
          disabled={!hasContent}
          className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2 text-sm font-semibold text-neutral-950 shadow-lg shadow-black/30 hover:bg-neutral-200 transition disabled:cursor-not-allowed disabled:bg-neutral-800 disabled:text-neutral-500 disabled:shadow-none"
        >
          {justSaved ? (
            <>
              <Check className="h-4 w-4 text-emerald-500" />
              Saved
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save profile
            </>
          )}
        </button>
      </div>

      <p className="mt-6 text-xs text-neutral-500">
        Your voice profile lives in this browser only — never sent to our
        servers until you generate. When auth ships, you&apos;ll be able to
        sync across devices.
      </p>
    </div>
  );
}
