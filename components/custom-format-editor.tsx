"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  X,
  Sparkles,
  Lock,
  Hash,
  Briefcase,
  Camera,
  Mail,
  Video,
  Layers,
  Flame,
  BookOpen,
  FileText,
  MessageSquare,
  Globe,
  Lightbulb,
  Code,
  Music,
  Mic,
  Newspaper,
  Megaphone,
  type LucideIcon,
} from "lucide-react";
import {
  loadCustomFormats,
  saveCustomFormat,
  deleteCustomFormat,
  newId,
  type CustomFormat,
  MAX_CUSTOM_FORMATS,
} from "@/lib/storage";
import { canUseProFeatures, isPaymentsEnabledClient } from "@/lib/pro";
import { cn } from "@/lib/utils";

const ICONS: { id: string; component: LucideIcon }[] = [
  { id: "Hash", component: Hash },
  { id: "Briefcase", component: Briefcase },
  { id: "Camera", component: Camera },
  { id: "Mail", component: Mail },
  { id: "Video", component: Video },
  { id: "Layers", component: Layers },
  { id: "Flame", component: Flame },
  { id: "BookOpen", component: BookOpen },
  { id: "FileText", component: FileText },
  { id: "MessageSquare", component: MessageSquare },
  { id: "Globe", component: Globe },
  { id: "Lightbulb", component: Lightbulb },
  { id: "Code", component: Code },
  { id: "Music", component: Music },
  { id: "Mic", component: Mic },
  { id: "Newspaper", component: Newspaper },
  { id: "Megaphone", component: Megaphone },
];
const ICON_MAP: Record<string, LucideIcon> = Object.fromEntries(
  ICONS.map((i) => [i.id, i.component])
);

const COLORS = [
  "from-sky-400 to-blue-600",
  "from-emerald-400 to-teal-600",
  "from-amber-400 to-orange-600",
  "from-rose-500 to-red-600",
  "from-pink-500 via-fuchsia-500 to-orange-400",
  "from-blue-500 to-indigo-700",
  "from-purple-500 to-fuchsia-500",
  "from-cyan-400 to-blue-600",
  "from-yellow-400 to-orange-500",
  "from-green-400 to-emerald-600",
  "from-violet-500 to-purple-700",
  "from-fuchsia-500 to-pink-600",
] as const;

const TEMPLATE_PROMPT = `Produce a single <FORMAT NAME>.

Format:
- <length / structure rules>
- <hook rules>
- <line-by-line rules>
- <closing / CTA rules>

Style:
- <voice / tone rules>
- <emoji / hashtag policy>
- <forbidden phrases or patterns>

Output ONLY the content itself. No preamble, no meta commentary.`;

interface DraftFormat {
  id: string;
  label: string;
  description: string;
  systemPrompt: string;
  color: string;
  icon: string;
}

const blankDraft = (): DraftFormat => ({
  id: newId(),
  label: "",
  description: "",
  systemPrompt: TEMPLATE_PROMPT,
  color: COLORS[0],
  icon: "Sparkles",
});

export function CustomFormatEditor() {
  const [hydrated, setHydrated] = useState(false);
  const [formats, setFormats] = useState<CustomFormat[]>([]);
  const [draft, setDraft] = useState<DraftFormat | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [proAvailable, setProAvailable] = useState(true);
  const [paymentsLive, setPaymentsLive] = useState(false);

  useEffect(() => {
    setFormats(loadCustomFormats());
    setProAvailable(canUseProFeatures());
    setPaymentsLive(isPaymentsEnabledClient());
    setHydrated(true);
  }, []);

  function startNew() {
    setDraft(blankDraft());
    setError(null);
  }

  function startEdit(f: CustomFormat) {
    setDraft({
      id: f.id,
      label: f.label,
      description: f.description,
      systemPrompt: f.systemPrompt,
      color: f.color,
      icon: f.icon,
    });
    setError(null);
  }

  function cancel() {
    setDraft(null);
    setError(null);
  }

  function save() {
    if (!draft) return;
    const label = draft.label.trim();
    const systemPrompt = draft.systemPrompt.trim();
    if (label.length < 2) {
      setError("Give your format a name (at least 2 chars).");
      return;
    }
    if (systemPrompt.length < 60) {
      setError(
        "System prompt is too short. Tell the model the structure, voice, and rules."
      );
      return;
    }
    const full: CustomFormat = {
      id: draft.id,
      label,
      description: draft.description.trim(),
      systemPrompt,
      color: draft.color,
      icon: draft.icon,
      createdAt: new Date().toISOString(),
    };
    try {
      const next = saveCustomFormat(full);
      setFormats(next);
      setDraft(null);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save.");
    }
  }

  function remove(id: string) {
    if (!confirm("Delete this format?")) return;
    setFormats(deleteCustomFormat(id));
  }

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 text-neutral-500">
        Loading…
      </div>
    );
  }

  const locked = !proAvailable;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Link
        href="/app"
        className="inline-flex items-center gap-1.5 text-sm text-neutral-400 hover:text-white transition"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to workspace
      </Link>

      <div className="mt-6 flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 text-white shadow-lg shadow-amber-500/20">
            <Sparkles className="h-5 w-5" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight">
                Custom formats
              </h1>
              <span className="rounded-full border border-fuchsia-400/30 bg-fuchsia-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-fuchsia-300">
                Pro
              </span>
            </div>
            <p className="mt-1 text-sm text-neutral-400">
              Define your own platform-specific formats. Use any prompt — the
              model follows it as if it were built in.
            </p>
          </div>
        </div>
      </div>

      {locked && paymentsLive && (
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-fuchsia-500/30 bg-gradient-to-b from-fuchsia-500/[0.06] to-transparent p-5">
          <Lock className="mt-0.5 h-5 w-5 flex-none text-fuchsia-300" />
          <div className="flex-1">
            <p className="text-sm font-medium text-neutral-100">
              Custom formats are a Pro feature.
            </p>
            <p className="mt-1 text-sm text-neutral-400">
              Upgrade to Pro ($9/mo) to create unlimited custom formats with
              your own prompt rules. You can browse here, but creation is
              gated.
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

      {/* Existing formats */}
      <section className="mt-8 space-y-3">
        {formats.length === 0 && !draft && (
          <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center">
            <p className="text-sm text-neutral-400">
              No custom formats yet. Build your first one.
            </p>
          </div>
        )}

        {formats.map((f) => {
          const Icon = ICON_MAP[f.icon] ?? Sparkles;
          return (
            <div
              key={f.id}
              className="flex items-start justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5"
            >
              <div className="flex items-start gap-3">
                <span
                  className={cn(
                    "inline-flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-gradient-to-br text-white",
                    f.color
                  )}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-neutral-100">
                      {f.label}
                    </h3>
                    <span className="rounded-full border border-amber-400/20 bg-amber-500/10 px-1.5 text-[10px] text-amber-200">
                      custom
                    </span>
                  </div>
                  {f.description && (
                    <p className="mt-0.5 text-xs text-neutral-400">
                      {f.description}
                    </p>
                  )}
                  <p className="mt-2 line-clamp-2 max-w-prose text-[11px] text-neutral-500">
                    {f.systemPrompt}
                  </p>
                </div>
              </div>
              <div className="flex flex-none items-center gap-1">
                <button
                  type="button"
                  onClick={() => startEdit(f)}
                  className="rounded-md px-2 py-1 text-xs text-neutral-300 hover:bg-white/5 hover:text-white transition"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => remove(f.id)}
                  className="rounded-md p-1 text-neutral-500 hover:text-rose-400 transition"
                  aria-label="Delete"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </section>

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

      {/* Create button */}
      {!draft && formats.length < MAX_CUSTOM_FORMATS && (
        <button
          type="button"
          onClick={startNew}
          disabled={locked}
          className={cn(
            "mt-6 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition",
            locked
              ? "cursor-not-allowed bg-neutral-800 text-neutral-500"
              : "bg-white text-neutral-950 shadow-lg shadow-black/30 hover:bg-neutral-200"
          )}
        >
          {locked ? (
            <>
              <Lock className="h-4 w-4" />
              Locked — Pro only
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" />
              Create custom format
            </>
          )}
        </button>
      )}

      {!draft && formats.length >= MAX_CUSTOM_FORMATS && (
        <p className="mt-6 text-xs text-amber-300">
          Max {MAX_CUSTOM_FORMATS} custom formats reached. Delete one to add
          a new one.
        </p>
      )}

      <p className="mt-8 text-xs text-neutral-500">
        Custom formats live in this browser only — when sync ships (v0.4)
        they&apos;ll move to your account.
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
  draft: DraftFormat;
  setDraft: (d: DraftFormat) => void;
  onSave: () => void;
  onCancel: () => void;
  error: string | null;
}) {
  return (
    <section className="mt-6 rounded-2xl border border-fuchsia-400/30 bg-fuchsia-500/[0.03] p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">Edit format</h2>
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition"
          aria-label="Cancel"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Field label="Name">
          <input
            type="text"
            value={draft.label}
            maxLength={40}
            onChange={(e) =>
              setDraft({ ...draft, label: e.target.value })
            }
            placeholder="e.g. Hacker News post"
            className="w-full rounded-lg border border-white/10 bg-neutral-950/60 px-3 py-2 text-sm text-neutral-100 outline-none placeholder:text-neutral-600 focus:border-fuchsia-400/40"
          />
        </Field>
        <Field label="Description (optional)">
          <input
            type="text"
            value={draft.description}
            maxLength={80}
            onChange={(e) =>
              setDraft({ ...draft, description: e.target.value })
            }
            placeholder="e.g. Title + comment for r/programming"
            className="w-full rounded-lg border border-white/10 bg-neutral-950/60 px-3 py-2 text-sm text-neutral-100 outline-none placeholder:text-neutral-600 focus:border-fuchsia-400/40"
          />
        </Field>
      </div>

      <Field label="Color">
        <div className="mt-2 flex flex-wrap gap-2">
          {COLORS.map((c) => {
            const isOn = c === draft.color;
            return (
              <button
                key={c}
                type="button"
                onClick={() => setDraft({ ...draft, color: c })}
                className={cn(
                  "h-7 w-7 rounded-lg bg-gradient-to-br transition",
                  c,
                  isOn
                    ? "ring-2 ring-white ring-offset-2 ring-offset-neutral-950"
                    : "opacity-80 hover:opacity-100"
                )}
                aria-label={`Color ${c}`}
              />
            );
          })}
        </div>
      </Field>

      <Field label="Icon">
        <div className="mt-2 grid grid-cols-9 gap-2 sm:grid-cols-12">
          {ICONS.map(({ id, component: Icon }) => {
            const isOn = id === draft.icon;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setDraft({ ...draft, icon: id })}
                className={cn(
                  "inline-flex h-8 w-8 items-center justify-center rounded-lg border transition",
                  isOn
                    ? "border-fuchsia-400/60 bg-fuchsia-500/10 text-fuchsia-200"
                    : "border-white/10 bg-white/[0.03] text-neutral-400 hover:bg-white/[0.07] hover:text-neutral-100"
                )}
                aria-label={id}
              >
                <Icon className="h-3.5 w-3.5" />
              </button>
            );
          })}
        </div>
      </Field>

      <Field label="System prompt — tell the model what to produce">
        <textarea
          value={draft.systemPrompt}
          onChange={(e) =>
            setDraft({ ...draft, systemPrompt: e.target.value })
          }
          rows={14}
          className="w-full resize-y rounded-lg border border-white/10 bg-neutral-950/60 p-4 font-mono text-xs text-neutral-100 outline-none placeholder:text-neutral-600 focus:border-fuchsia-400/40"
        />
        <p className="mt-2 text-[11px] text-neutral-500">
          Tip: be specific about length, hook style, and forbidden phrases.
          The model will follow this instead of any built-in rules.
        </p>
      </Field>

      {error && <p className="mt-3 text-xs text-amber-300">{error}</p>}

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
          Save format
        </button>
      </div>
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-4">
      <label className="text-xs font-medium text-neutral-300">{label}</label>
      {children}
    </div>
  );
}
