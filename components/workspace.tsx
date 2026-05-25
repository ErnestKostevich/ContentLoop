"use client";

import { useMemo, useState } from "react";
import {
  Hash,
  Briefcase,
  Camera,
  Mail,
  Video,
  Sparkles,
  Loader2,
  Copy,
  Check,
  AlertCircle,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { FORMATS, type FormatId, FORMAT_MAP } from "@/lib/formats";
import { cn } from "@/lib/utils";

const ICONS: Record<string, LucideIcon> = {
  Hash,
  Briefcase,
  Camera,
  Mail,
  Video,
};

interface GenResult {
  formatId: FormatId;
  ok: boolean;
  text?: string;
  error?: string;
}

interface RateLimit {
  remaining: number;
  limit: number;
  resetAtUtc: string;
}

interface ApiResponse {
  results?: GenResult[];
  rateLimit?: RateLimit;
  error?: string;
  upgrade?: boolean;
}

const SAMPLE_TEXT = `The hardest part of building a product company isn't writing the code. It's the cold, repeated work of putting that product in front of strangers and watching most of them shrug.

For two years I worked on a niche developer tool. I shipped fast. Wrote great docs. Got nice DMs. Made roughly $0.

The thing that finally moved the needle wasn't a better product. It was committing to write one short technical post every single day for ninety days. Not threads. Not "ultimate guides." Just one specific, useful observation per day, on the platform where my buyers actually hang out.

By day 60, three companies had emailed me asking for a contract. By day 90, I had enough revenue to quit my job. The product hadn't really changed. The distribution had.

The lesson I should have learned five years sooner: in a market where everyone can build, the moat is the audience you patiently earn before you need them.`;

export function Workspace() {
  const [source, setSource] = useState("");
  const [selected, setSelected] = useState<Set<FormatId>>(
    new Set(["twitter_thread", "linkedin_post"])
  );
  const [extra, setExtra] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<GenResult[] | null>(null);
  const [activeTab, setActiveTab] = useState<FormatId | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [upgrade, setUpgrade] = useState(false);
  const [rateLimit, setRateLimit] = useState<RateLimit | null>(null);

  const charCount = source.length;
  const charsOk = charCount >= 120 && charCount <= 30_000;
  const canGenerate = !loading && charsOk && selected.size > 0;

  function toggle(id: FormatId) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function generate() {
    setLoading(true);
    setError(null);
    setUpgrade(false);
    setResults(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          source,
          formats: Array.from(selected),
          extraInstructions: extra || undefined,
        }),
      });
      const data = (await res.json()) as ApiResponse;
      if (!res.ok || data.error) {
        setError(data.error ?? "Generation failed.");
        if (data.upgrade) setUpgrade(true);
        if (data.rateLimit) setRateLimit(data.rateLimit);
      } else if (data.results) {
        setResults(data.results);
        if (data.rateLimit) setRateLimit(data.rateLimit);
        setActiveTab(data.results[0]?.formatId ?? null);
      }
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Network error — please retry."
      );
    } finally {
      setLoading(false);
    }
  }

  const activeResult = useMemo(
    () => results?.find((r) => r.formatId === activeTab) ?? null,
    [results, activeTab]
  );

  return (
    <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1.05fr_1fr]">
      {/* ─────────────────────────── INPUT PANEL ─────────────────────────── */}
      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">1. Your source</h2>
          <button
            onClick={() => setSource(SAMPLE_TEXT)}
            className="text-xs text-neutral-400 underline-offset-4 hover:text-white hover:underline"
            type="button"
          >
            Load sample
          </button>
        </div>
        <p className="mt-1 text-sm text-neutral-400">
          Paste an article, transcript, or essay. 200+ words works best.
        </p>

        <textarea
          value={source}
          onChange={(e) => setSource(e.target.value)}
          placeholder="Paste here…"
          className="mt-4 h-72 w-full resize-y rounded-xl border border-white/10 bg-neutral-950/60 p-4 font-mono text-sm text-neutral-100 outline-none placeholder:text-neutral-600 focus:border-fuchsia-400/40 focus:ring-2 focus:ring-fuchsia-400/10"
        />
        <div className="mt-2 flex items-center justify-between text-xs">
          <span
            className={cn(
              "text-neutral-500",
              !charsOk && charCount > 0 && "text-amber-400"
            )}
          >
            {charCount.toLocaleString()} / 30,000 chars
            {charCount > 0 && charCount < 120
              ? ` — need ${120 - charCount} more`
              : ""}
          </span>
          {rateLimit && (
            <span className="text-neutral-500">
              {rateLimit.remaining}/{rateLimit.limit} free today
            </span>
          )}
        </div>

        <h2 className="mt-8 text-lg font-semibold">2. Output formats</h2>
        <p className="mt-1 text-sm text-neutral-400">
          Pick one or many. Each runs in parallel.
        </p>

        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {FORMATS.map((f) => {
            const Icon = ICONS[f.icon] ?? Sparkles;
            const isOn = selected.has(f.id);
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => toggle(f.id)}
                className={cn(
                  "lift group relative overflow-hidden rounded-xl border p-3 text-left transition",
                  isOn
                    ? "border-fuchsia-400/40 bg-fuchsia-500/[0.08]"
                    : "border-white/10 bg-white/[0.02] hover:bg-white/[0.05]"
                )}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "inline-flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br text-white",
                      f.color
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-sm font-medium text-neutral-100">
                    {f.label}
                  </span>
                </div>
                <p className="mt-2 text-xs text-neutral-400">
                  {f.description}
                </p>
                <span
                  className={cn(
                    "absolute right-2 top-2 h-2 w-2 rounded-full transition",
                    isOn ? "bg-fuchsia-400" : "bg-transparent"
                  )}
                />
              </button>
            );
          })}
        </div>

        <details className="mt-5 group">
          <summary className="cursor-pointer text-xs text-neutral-400 hover:text-white">
            + Add custom voice / brand instructions (optional)
          </summary>
          <textarea
            value={extra}
            onChange={(e) => setExtra(e.target.value)}
            placeholder='e.g. "I write in lowercase, no emojis, target indie hackers."'
            className="mt-3 h-20 w-full resize-y rounded-lg border border-white/10 bg-neutral-950/60 p-3 text-sm text-neutral-100 outline-none placeholder:text-neutral-600 focus:border-fuchsia-400/40"
          />
        </details>

        <div className="mt-6 flex items-center justify-end gap-3">
          {selected.size > 0 && (
            <span className="text-xs text-neutral-500">
              {selected.size} format{selected.size === 1 ? "" : "s"} selected
            </span>
          )}
          <button
            type="button"
            onClick={generate}
            disabled={!canGenerate}
            className={cn(
              "inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold transition",
              canGenerate
                ? "bg-white text-neutral-950 shadow-lg shadow-black/30 hover:bg-neutral-200"
                : "cursor-not-allowed bg-neutral-800 text-neutral-500"
            )}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating…
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate
              </>
            )}
          </button>
        </div>
      </section>

      {/* ─────────────────────────── RESULTS PANEL ─────────────────────────── */}
      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">3. Your results</h2>
          {results && (
            <span className="text-xs text-neutral-500">
              {results.length} ready
            </span>
          )}
        </div>

        {/* Idle */}
        {!loading && !results && !error && (
          <EmptyState />
        )}

        {/* Loading */}
        {loading && <LoadingState selectedCount={selected.size} />}

        {/* Error */}
        {error && (
          <div className="mt-6 rounded-xl border border-amber-400/30 bg-amber-500/[0.06] p-5">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 flex-none text-amber-400" />
              <div>
                <p className="text-sm font-medium text-amber-100">{error}</p>
                {upgrade && (
                  <p className="mt-2 text-xs text-amber-200/80">
                    Free plan is capped at 3 generations/day. Upgrade to
                    Pro (coming soon) for unlimited runs, or wait until
                    UTC midnight for a reset.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {results && results.length > 0 && (
          <div className="mt-5">
            <div className="flex flex-wrap gap-2">
              {results.map((r) => {
                const f = FORMAT_MAP[r.formatId];
                const isActive = r.formatId === activeTab;
                return (
                  <button
                    key={r.formatId}
                    type="button"
                    onClick={() => setActiveTab(r.formatId)}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition",
                      isActive
                        ? "border-white/20 bg-white text-neutral-950"
                        : "border-white/10 bg-white/5 text-neutral-300 hover:bg-white/10"
                    )}
                  >
                    <span
                      className={cn(
                        "h-2 w-2 rounded-full",
                        r.ok ? "bg-emerald-400" : "bg-rose-400"
                      )}
                    />
                    {f.label}
                  </button>
                );
              })}
            </div>

            {activeResult && (
              <ResultBlock
                result={activeResult}
                title={FORMAT_MAP[activeResult.formatId].label}
              />
            )}
          </div>
        )}
      </section>
    </div>
  );
}

/* ─────────────────────────── SUB-COMPONENTS ─────────────────────────── */

function EmptyState() {
  return (
    <div className="mt-6 flex h-72 flex-col items-center justify-center rounded-xl border border-dashed border-white/10 text-center">
      <Zap className="h-6 w-6 text-neutral-600" />
      <p className="mt-3 text-sm text-neutral-400">
        Your generated content will land here.
      </p>
      <p className="mt-1 text-xs text-neutral-600">
        Tip: start with the sample to see what good output looks like.
      </p>
    </div>
  );
}

function LoadingState({ selectedCount }: { selectedCount: number }) {
  return (
    <div className="mt-6 space-y-3">
      <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-4">
        <Loader2 className="h-4 w-4 animate-spin text-fuchsia-400" />
        <p className="text-sm text-neutral-300">
          Generating {selectedCount} format
          {selectedCount === 1 ? "" : "s"} in parallel…
        </p>
      </div>
      {Array.from({ length: Math.min(selectedCount, 3) }).map((_, i) => (
        <div
          key={i}
          className="h-20 animate-pulse rounded-xl border border-white/5 bg-white/[0.02]"
        />
      ))}
    </div>
  );
}

function ResultBlock({
  result,
  title,
}: {
  result: GenResult;
  title: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    if (!result.text) return;
    try {
      await navigator.clipboard.writeText(result.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // noop — older browsers
    }
  }

  if (!result.ok) {
    return (
      <div className="mt-5 rounded-xl border border-rose-400/30 bg-rose-500/[0.06] p-5">
        <p className="text-sm font-medium text-rose-100">
          {title} failed to generate.
        </p>
        <p className="mt-1 text-xs text-rose-200/80">{result.error}</p>
      </div>
    );
  }

  return (
    <div className="mt-5 rounded-xl border border-white/10 bg-neutral-950/60">
      <div className="flex items-center justify-between border-b border-white/5 px-4 py-2.5">
        <span className="text-xs font-medium text-neutral-400">{title}</span>
        <button
          type="button"
          onClick={copy}
          className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs text-neutral-200 hover:bg-white/10 transition"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 text-emerald-400" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              Copy
            </>
          )}
        </button>
      </div>
      <pre className="max-h-[36rem] overflow-y-auto whitespace-pre-wrap break-words p-5 font-sans text-sm leading-relaxed text-neutral-100">
        {result.text}
      </pre>
    </div>
  );
}
