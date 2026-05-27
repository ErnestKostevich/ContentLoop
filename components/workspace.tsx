"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
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
  Sparkles,
  Loader2,
  Copy,
  Check,
  AlertCircle,
  Zap,
  Link as LinkIcon,
  Wand2,
  History as HistoryIcon,
  Settings,
  X,
  KeyRound,
  Trash2,
  Plus,
  type LucideIcon,
} from "lucide-react";
import { FORMATS, FORMAT_MAP } from "@/lib/formats";
import { cn } from "@/lib/utils";
import {
  loadVoiceProfile,
  loadHistory,
  appendHistory,
  deleteHistoryEntry,
  clearHistory,
  loadByokKey,
  saveByokKey,
  clearByokKey,
  loadCustomFormats,
  loadProfiles,
  newId,
  type HistoryEntry,
  type VoiceProfile,
  type CustomFormat,
} from "@/lib/storage";
import { estimateCostUsd, formatUsd } from "@/lib/pricing";
import { extendPro, setProValidUntil } from "@/lib/pro";

const justUpgraded = (): boolean => {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("upgraded") === "1";
};

async function syncProFromServer(): Promise<string | null> {
  try {
    const r = await fetch("/api/me");
    if (!r.ok) return null;
    const data = (await r.json()) as {
      signedIn?: boolean;
      proValidUntil?: string | null;
    };
    if (data.signedIn && data.proValidUntil) {
      setProValidUntil(data.proValidUntil);
      return data.proValidUntil;
    }
    return null;
  } catch {
    return null;
  }
}
import { OnboardingModal } from "@/components/onboarding-modal";
import { ExportResults } from "@/components/export-results";

const ICONS: Record<string, LucideIcon> = {
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
  Sparkles,
};

interface GenResult {
  formatId: string;
  ok: boolean;
  text?: string;
  error?: string;
  usage?: { input: number; output: number };
}

interface RateLimit {
  remaining: number | null;
  limit: number | null;
  resetAtUtc: string;
  byok?: boolean;
}

interface ApiResponse {
  results?: GenResult[];
  rateLimit?: RateLimit;
  error?: string;
  upgrade?: boolean;
  byokRequired?: boolean;
}

const SAMPLE_TEXT = `The hardest part of building a product company isn't writing the code. It's the cold, repeated work of putting that product in front of strangers and watching most of them shrug.

For two years I worked on a niche developer tool. I shipped fast. Wrote great docs. Got nice DMs. Made roughly $0.

The thing that finally moved the needle wasn't a better product. It was committing to write one short technical post every single day for ninety days. Not threads. Not "ultimate guides." Just one specific, useful observation per day, on the platform where my buyers actually hang out.

By day 60, three companies had emailed me asking for a contract. By day 90, I had enough revenue to quit my job. The product hadn't really changed. The distribution had.

The lesson I should have learned five years sooner: in a market where everyone can build, the moat is the audience you patiently earn before you need them.`;

export function Workspace() {
  // ─── input state
  const [source, setSource] = useState("");
  const [selected, setSelected] = useState<Set<string>>(
    new Set(["twitter_thread", "linkedin_post"])
  );
  const [extra, setExtra] = useState("");

  // ─── URL import state
  const [showUrlBar, setShowUrlBar] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [urlLoading, setUrlLoading] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);

  // ─── generation state
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<GenResult[] | null>(null);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [upgrade, setUpgrade] = useState(false);
  const [rateLimit, setRateLimit] = useState<RateLimit | null>(null);

  // ─── client-only persisted state
  const [voiceProfile, setVoiceProfile] = useState<VoiceProfile | null>(null);
  const [voiceProfileCount, setVoiceProfileCount] = useState(0);
  const [useVoiceProfile, setUseVoiceProfile] = useState(true);
  const [customFormats, setCustomFormats] = useState<CustomFormat[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [byokKey, setByokKey] = useState("");
  const [hydrated, setHydrated] = useState(false);

  // ─── server status (BYOK required?)
  const [serverHasKey, setServerHasKey] = useState<boolean | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    setVoiceProfile(loadVoiceProfile());
    setVoiceProfileCount(loadProfiles().length);
    setCustomFormats(loadCustomFormats());
    setHistory(loadHistory());
    const storedKey = loadByokKey() ?? "";
    setByokKey(storedKey);
    setHydrated(true);

    // Handle payment provider success_url callback: ?upgraded=1
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get("upgraded") === "1") {
        // Optimistically extend Pro by 30 days. The provider's webhook
        // is the source of truth (will replace this when DB lands).
        extendPro(30);
        params.delete("upgraded");
        params.delete("session_id");
        params.delete("order_id");
        const url = new URL(window.location.href);
        url.search = params.toString();
        window.history.replaceState({}, "", url.toString());
      }
    } catch {
      /* ignore */
    }

    // Probe server for its capability set
    fetch("/api/status")
      .then((r) => r.json())
      .then((s: { serverKey?: boolean }) => {
        const has = Boolean(s.serverKey);
        setServerHasKey(has);
        // First-visit onboarding: only if user has no key AND server has no key
        if (!has && !storedKey) {
          setShowOnboarding(true);
        }
      })
      .catch(() => setServerHasKey(false));

    // Server-side Pro recovery: if user is signed in (Clerk), trust the DB
    // over localStorage. Survives browser clears + new devices.
    syncProFromServer();

    // After ?upgraded=1, the webhook may take a few seconds to land — poll
    // /api/me up to 6 times (~12s) so the UI flips to Pro without a reload.
    if (justUpgraded()) {
      let attempts = 0;
      const tick = () => {
        attempts += 1;
        syncProFromServer().then((until) => {
          if (until || attempts >= 6) return;
          setTimeout(tick, 2000);
        });
      };
      setTimeout(tick, 2000);
    }
  }, []);

  const charCount = source.length;
  const charsOk = charCount >= 120 && charCount <= 30_000;
  const usingByok = byokKey.trim().startsWith("sk-ant-");
  const needsByok = serverHasKey === false && !usingByok;
  const canGenerate =
    !loading && charsOk && selected.size > 0 && !needsByok;

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function importFromUrl() {
    setUrlError(null);
    setUrlLoading(true);
    try {
      const res = await fetch("/api/fetch-url", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url: urlInput.trim() }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setUrlError(data.error ?? "Failed to import.");
      } else {
        setSource(data.text);
        setShowUrlBar(false);
        setUrlInput("");
      }
    } catch (e) {
      setUrlError(
        e instanceof Error ? e.message : "Network error — please retry."
      );
    } finally {
      setUrlLoading(false);
    }
  }

  async function generate() {
    setLoading(true);
    setError(null);
    setUpgrade(false);
    setResults(null);
    try {
      // Only send custom format definitions that are actually selected
      const selectedCustom = customFormats.filter((f) => selected.has(f.id));
      const customFormatsPayload = selectedCustom.map((f) => ({
        id: f.id,
        label: f.label,
        systemPrompt: f.systemPrompt,
      }));

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          source,
          formats: Array.from(selected),
          customFormats:
            customFormatsPayload.length > 0 ? customFormatsPayload : undefined,
          extraInstructions: extra || undefined,
          voiceProfile:
            useVoiceProfile && voiceProfile
              ? {
                  instructions: voiceProfile.instructions,
                  samples: voiceProfile.samples,
                }
              : undefined,
          apiKey: usingByok ? byokKey.trim() : undefined,
        }),
      });
      const data = (await res.json()) as ApiResponse;
      if (!res.ok || data.error) {
        setError(data.error ?? "Generation failed.");
        if (data.upgrade) setUpgrade(true);
        if (data.rateLimit) setRateLimit(data.rateLimit);
        if (data.byokRequired) setShowOnboarding(true);
      } else if (data.results) {
        setResults(data.results);
        if (data.rateLimit) setRateLimit(data.rateLimit);
        setActiveTab(data.results[0]?.formatId ?? null);
        // Save to history
        const entry: HistoryEntry = {
          id: newId(),
          createdAt: new Date().toISOString(),
          sourcePreview: source.slice(0, 140).trim() + (source.length > 140 ? "…" : ""),
          sourceFull: source,
          formats: Array.from(selected),
          results: data.results,
          voiceProfileUsed: useVoiceProfile && Boolean(voiceProfile),
          voiceProfileName: voiceProfile?.name,
        };
        setHistory(appendHistory(entry));
      }
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Network error — please retry."
      );
    } finally {
      setLoading(false);
    }
  }

  function restoreFromHistory(entry: HistoryEntry) {
    setSource(entry.sourceFull);
    setSelected(new Set(entry.formats));
    setResults(entry.results);
    setActiveTab(entry.results[0]?.formatId ?? null);
    setShowHistory(false);
    setError(null);
  }

  function deleteHistory(id: string) {
    setHistory(deleteHistoryEntry(id));
  }

  function saveSettings() {
    const trimmed = byokKey.trim();
    if (!trimmed) {
      clearByokKey();
    } else {
      saveByokKey(trimmed);
    }
    setShowSettings(false);
  }

  const activeResult = useMemo(
    () => results?.find((r) => r.formatId === activeTab) ?? null,
    [results, activeTab]
  );

  // Resolve a format ID (built-in OR custom) to display data.
  const resolveFormat = useMemo(() => {
    return (id: string): { label: string; isCustom: boolean } => {
      const built = (FORMAT_MAP as Record<string, { label: string }>)[id];
      if (built) return { label: built.label, isCustom: false };
      const c = customFormats.find((f) => f.id === id);
      if (c) return { label: c.label, isCustom: true };
      return { label: id, isCustom: false };
    };
  }, [customFormats]);

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 text-neutral-500 sm:px-6">
        Loading workspace…
      </div>
    );
  }

  return (
    <div className="relative">
      {/* ─────────── Top action bar ─────────── */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-wrap items-center gap-2 border-b border-white/5 pb-4 pt-2">
          <button
            type="button"
            onClick={() => setSource(SAMPLE_TEXT)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-neutral-200 hover:bg-white/[0.07] transition"
          >
            <FileText className="h-3.5 w-3.5" />
            Load sample
          </button>
          <button
            type="button"
            onClick={() => setShowUrlBar((v) => !v)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs transition",
              showUrlBar
                ? "border-fuchsia-400/40 bg-fuchsia-500/10 text-fuchsia-200"
                : "border-white/10 bg-white/[0.03] text-neutral-200 hover:bg-white/[0.07]"
            )}
          >
            <LinkIcon className="h-3.5 w-3.5" />
            Import from URL
          </button>

          <Link
            href="/voice"
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs transition",
              voiceProfile
                ? "border-emerald-400/30 bg-emerald-500/[0.07] text-emerald-200"
                : "border-white/10 bg-white/[0.03] text-neutral-200 hover:bg-white/[0.07]"
            )}
          >
            <Wand2 className="h-3.5 w-3.5" />
            {voiceProfile
              ? `Voice: ${voiceProfile.name}${voiceProfileCount > 1 ? ` · ${voiceProfileCount}` : ""}`
              : "Train voice profile"}
          </Link>

          {voiceProfile && (
            <label className="ml-1 inline-flex cursor-pointer items-center gap-1.5 text-xs text-neutral-400">
              <input
                type="checkbox"
                checked={useVoiceProfile}
                onChange={(e) => setUseVoiceProfile(e.target.checked)}
                className="h-3.5 w-3.5 accent-fuchsia-500"
              />
              Apply
            </label>
          )}

          <div className="ml-auto flex items-center gap-2">
            {usingByok && (
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-400/30 bg-indigo-500/[0.08] px-2.5 py-1 text-xs text-indigo-200">
                <KeyRound className="h-3 w-3" />
                BYOK active
              </span>
            )}
            <button
              type="button"
              onClick={() => setShowHistory(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-neutral-200 hover:bg-white/[0.07] transition"
            >
              <HistoryIcon className="h-3.5 w-3.5" />
              History
              {history.length > 0 && (
                <span className="ml-0.5 rounded-full bg-white/10 px-1.5 text-[10px] text-neutral-300">
                  {history.length}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setShowSettings(true)}
              className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-neutral-300 hover:bg-white/[0.07] transition"
              aria-label="Settings"
            >
              <Settings className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {showUrlBar && (
          <div className="mt-3 flex flex-col gap-2 rounded-xl border border-fuchsia-400/20 bg-fuchsia-500/[0.04] p-3 sm:flex-row sm:items-center">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://example.com/great-article"
              className="flex-1 rounded-lg border border-white/10 bg-neutral-950/60 px-3 py-2 text-sm text-neutral-100 outline-none placeholder:text-neutral-600 focus:border-fuchsia-400/40"
              onKeyDown={(e) => {
                if (e.key === "Enter") importFromUrl();
              }}
            />
            <button
              type="button"
              onClick={importFromUrl}
              disabled={!urlInput.trim() || urlLoading}
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-white px-4 text-sm font-medium text-neutral-950 hover:bg-neutral-200 transition disabled:cursor-not-allowed disabled:bg-neutral-800 disabled:text-neutral-500"
            >
              {urlLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LinkIcon className="h-4 w-4" />
              )}
              Fetch
            </button>
            <button
              type="button"
              onClick={() => {
                setShowUrlBar(false);
                setUrlError(null);
              }}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition sm:h-9"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        {urlError && (
          <p className="mt-2 text-xs text-amber-300">{urlError}</p>
        )}
      </div>

      {/* ─────────── Main two-pane workspace ─────────── */}
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[1.05fr_1fr]">
        {/* INPUT */}
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
          <h2 className="text-lg font-semibold">1. Your source</h2>
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
            {usingByok && (
              <span className="text-indigo-300">∞ via your key</span>
            )}
            {!usingByok && rateLimit && !rateLimit.byok && rateLimit.remaining !== null && rateLimit.limit !== null && (
              <span className="text-neutral-500">
                {rateLimit.remaining}/{rateLimit.limit} free today
              </span>
            )}
            {!usingByok && needsByok && (
              <button
                type="button"
                onClick={() => setShowOnboarding(true)}
                className="text-fuchsia-300 hover:text-fuchsia-200 transition"
              >
                Add API key →
              </button>
            )}
          </div>

          <div className="mt-8 flex items-center justify-between">
            <h2 className="text-lg font-semibold">2. Output formats</h2>
            <Link
              href="/formats"
              className="inline-flex items-center gap-1 text-xs text-neutral-400 hover:text-white transition"
            >
              <Plus className="h-3 w-3" />
              Custom format
            </Link>
          </div>
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

            {customFormats.map((f) => {
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
                    {f.description || "Custom format"}
                  </p>
                  <span className="absolute right-2 top-2 rounded-full border border-amber-400/30 bg-amber-500/10 px-1.5 text-[9px] uppercase tracking-wide text-amber-200">
                    custom
                  </span>
                </button>
              );
            })}
          </div>

          <details className="mt-5 group">
            <summary className="cursor-pointer text-xs text-neutral-400 hover:text-white">
              + Add one-off instructions for this run (optional)
            </summary>
            <textarea
              value={extra}
              onChange={(e) => setExtra(e.target.value)}
              placeholder='e.g. "make the LinkedIn post about Series A founders specifically"'
              className="mt-3 h-20 w-full resize-y rounded-lg border border-white/10 bg-neutral-950/60 p-3 text-sm text-neutral-100 outline-none placeholder:text-neutral-600 focus:border-fuchsia-400/40"
            />
          </details>

          <div className="mt-6 flex items-center justify-end gap-3">
            {selected.size > 0 && (
              <span className="text-xs text-neutral-500">
                {selected.size} format{selected.size === 1 ? "" : "s"} selected
              </span>
            )}
            {needsByok ? (
              <button
                type="button"
                onClick={() => setShowOnboarding(true)}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 px-5 text-sm font-semibold text-white shadow-lg shadow-fuchsia-500/20 hover:opacity-95 transition"
              >
                <KeyRound className="h-4 w-4" />
                Add your API key to generate
              </button>
            ) : (
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
            )}
          </div>
        </section>

        {/* RESULTS */}
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">3. Your results</h2>
            <div className="flex items-center gap-3">
              {results && <CostSummary results={results} />}
              {results && (
                <ExportResults
                  results={results}
                  source={source}
                  labelFor={(id) => resolveFormat(id).label}
                />
              )}
            </div>
          </div>

          {!loading && !results && !error && <EmptyState />}
          {loading && <LoadingState selectedCount={selected.size} />}
          {error && (
            <div className="mt-6 rounded-xl border border-amber-400/30 bg-amber-500/[0.06] p-5">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-5 w-5 flex-none text-amber-400" />
                <div>
                  <p className="text-sm font-medium text-amber-100">
                    {error}
                  </p>
                  {upgrade && (
                    <p className="mt-2 text-xs text-amber-200/80">
                      Free quota is 3 generations/day. Add your own Anthropic
                      key in Settings for unlimited runs at your own (very
                      small) cost.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {results && results.length > 0 && (
            <div className="mt-5">
              <div className="flex flex-wrap gap-2">
                {results.map((r) => {
                  const f = resolveFormat(r.formatId);
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
                      {f.isCustom && (
                        <span className="ml-0.5 rounded-full bg-amber-500/20 px-1 text-[9px] text-amber-200">
                          custom
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {activeResult && (
                <ResultBlock
                  result={activeResult}
                  title={resolveFormat(activeResult.formatId).label}
                />
              )}
            </div>
          )}
        </section>
      </div>

      {/* ─────────── History drawer ─────────── */}
      {showHistory && (
        <HistoryDrawer
          history={history}
          onClose={() => setShowHistory(false)}
          onRestore={restoreFromHistory}
          onDelete={deleteHistory}
          onClearAll={() => {
            if (confirm("Delete all history? This can't be undone.")) {
              clearHistory();
              setHistory([]);
            }
          }}
        />
      )}

      {/* ─────────── Settings modal (BYOK) ─────────── */}
      {showSettings && (
        <SettingsModal
          byokKey={byokKey}
          setByokKey={setByokKey}
          onSave={saveSettings}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* ─────────── First-visit onboarding ─────────── */}
      {showOnboarding && (
        <OnboardingModal
          onSave={(key) => {
            setByokKey(key);
            saveByokKey(key);
            setShowOnboarding(false);
            setError(null);
          }}
          onClose={
            // Allow close only if there's a way to proceed — server key
            // is set OR user already has a key stored.
            serverHasKey || usingByok
              ? () => setShowOnboarding(false)
              : undefined
          }
        />
      )}
    </div>
  );
}

/* ──────────────────────── sub-components ──────────────────────── */

function CostSummary({ results }: { results: GenResult[] }) {
  const totals = results.reduce(
    (acc, r) => {
      if (r.usage) {
        acc.input += r.usage.input;
        acc.output += r.usage.output;
      }
      return acc;
    },
    { input: 0, output: 0 }
  );
  if (totals.input === 0 && totals.output === 0) {
    return (
      <span className="text-xs text-neutral-500">{results.length} ready</span>
    );
  }
  const cost = estimateCostUsd(totals.input, totals.output);
  return (
    <span
      className="text-xs text-neutral-500"
      title={`${totals.input.toLocaleString()} input + ${totals.output.toLocaleString()} output tokens`}
    >
      {results.length} ready · {formatUsd(cost)}
    </span>
  );
}

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
      // noop
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

function HistoryDrawer({
  history,
  onClose,
  onRestore,
  onDelete,
  onClearAll,
}: {
  history: HistoryEntry[];
  onClose: () => void;
  onRestore: (e: HistoryEntry) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
}) {
  return (
    <>
      <button
        type="button"
        aria-label="Close history"
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
      />
      <aside className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-white/10 bg-neutral-950 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
          <h3 className="text-base font-semibold">History</h3>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {history.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center px-6 text-center text-sm text-neutral-500">
              <HistoryIcon className="h-6 w-6 text-neutral-600" />
              <p className="mt-3">No generations yet.</p>
              <p className="mt-1 text-xs text-neutral-600">
                Past runs show up here for quick restore.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-white/5">
              {history.map((e) => (
                <li key={e.id} className="px-5 py-4 hover:bg-white/[0.02]">
                  <div className="flex items-start justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => onRestore(e)}
                      className="flex-1 text-left"
                    >
                      <p className="text-xs text-neutral-500">
                        {new Date(e.createdAt).toLocaleString()}
                        {e.voiceProfileUsed && (
                          <span className="ml-2 inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-1.5 text-[10px] text-emerald-200">
                            <Wand2 className="h-2.5 w-2.5" />
                            voice
                          </span>
                        )}
                      </p>
                      <p className="mt-1 line-clamp-2 text-sm text-neutral-200">
                        {e.sourcePreview}
                      </p>
                      <p className="mt-1.5 text-[11px] text-neutral-500">
                        {e.formats
                          .map(
                            (f) =>
                              (FORMAT_MAP as Record<string, { label: string }>)[
                                f
                              ]?.label ?? f
                          )
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(e.id)}
                      className="text-neutral-500 hover:text-rose-400 transition"
                      aria-label="Delete entry"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        {history.length > 0 && (
          <div className="border-t border-white/5 px-5 py-3">
            <button
              type="button"
              onClick={onClearAll}
              className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-rose-400 transition"
            >
              <Trash2 className="h-3 w-3" />
              Clear all
            </button>
          </div>
        )}
      </aside>
    </>
  );
}

function SettingsModal({
  byokKey,
  setByokKey,
  onSave,
  onClose,
}: {
  byokKey: string;
  setByokKey: (k: string) => void;
  onSave: () => void;
  onClose: () => void;
}) {
  return (
    <>
      <button
        type="button"
        aria-label="Close settings"
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-neutral-950 p-6 shadow-2xl">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-base font-semibold">Settings</h3>
              <p className="mt-0.5 text-xs text-neutral-500">
                Your power-user options.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-5">
            <label className="text-sm font-medium text-neutral-100">
              Bring your own Anthropic key
            </label>
            <p className="mt-1 text-xs text-neutral-500">
              Paste your <code className="text-neutral-300">sk-ant-…</code>{" "}
              key to bypass the daily free limit. Key is stored locally in
              this browser only.
            </p>
            <input
              type="password"
              value={byokKey}
              onChange={(e) => setByokKey(e.target.value)}
              placeholder="sk-ant-…"
              className="mt-3 w-full rounded-lg border border-white/10 bg-neutral-900 px-3 py-2 font-mono text-sm text-neutral-100 outline-none placeholder:text-neutral-600 focus:border-fuchsia-400/40"
            />
            <p className="mt-2 text-[10px] text-neutral-500">
              Get a key at{" "}
              <a
                href="https://console.anthropic.com"
                target="_blank"
                rel="noreferrer"
                className="underline hover:text-neutral-300"
              >
                console.anthropic.com
              </a>
              .
            </p>
          </div>

          <div className="mt-6 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] px-4 text-sm text-neutral-200 hover:bg-white/[0.07] transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onSave}
              className="inline-flex h-9 items-center justify-center rounded-lg bg-white px-4 text-sm font-semibold text-neutral-950 hover:bg-neutral-200 transition"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
