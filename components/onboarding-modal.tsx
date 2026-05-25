"use client";

import { useState } from "react";
import { ExternalLink, KeyRound, Sparkles, X, Check } from "lucide-react";

export function OnboardingModal({
  onSave,
  onClose,
}: {
  onSave: (key: string) => void;
  onClose?: () => void;
}) {
  const [key, setKey] = useState("");
  const [error, setError] = useState<string | null>(null);

  function save() {
    const trimmed = key.trim();
    if (!trimmed) {
      setError("Paste your key first.");
      return;
    }
    if (!trimmed.startsWith("sk-ant-")) {
      setError("That doesn't look like an Anthropic key. They start with sk-ant-.");
      return;
    }
    onSave(trimmed);
  }

  return (
    <>
      {onClose && (
        <button
          type="button"
          aria-label="Close onboarding"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
        />
      )}
      <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto px-4 py-8">
        <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-neutral-950 p-6 shadow-2xl">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white shadow-lg shadow-fuchsia-500/20">
                <Sparkles className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-lg font-semibold">
                  One-time setup, ~30 seconds
                </h2>
                <p className="mt-0.5 text-sm text-neutral-400">
                  ContentLoop uses your own Anthropic account. You pay only
                  Anthropic — never us.
                </p>
              </div>
            </div>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-neutral-500 hover:text-white hover:bg-white/5 transition"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <ol className="mt-6 space-y-4">
            <Step
              n={1}
              title="Grab a free Anthropic API key"
              body={
                <>
                  <p className="text-sm text-neutral-400">
                    Anthropic gives every new account ~$5 of free credit —
                    enough for hundreds of generations on ContentLoop.
                  </p>
                  <a
                    href="https://console.anthropic.com/settings/keys"
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-neutral-950 hover:bg-neutral-200 transition"
                  >
                    Open console.anthropic.com
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </>
              }
            />
            <Step
              n={2}
              title="Create a key and copy it"
              body={
                <p className="text-sm text-neutral-400">
                  In the dashboard click <em>Create Key</em>, give it any
                  name (e.g. &quot;ContentLoop&quot;), and copy the value.
                  It starts with{" "}
                  <code className="rounded bg-white/5 px-1 py-0.5 text-xs text-neutral-200">
                    sk-ant-
                  </code>
                  .
                </p>
              }
            />
            <Step
              n={3}
              title="Paste it here"
              body={
                <div>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-500" />
                    <input
                      type="password"
                      value={key}
                      onChange={(e) => {
                        setKey(e.target.value);
                        setError(null);
                      }}
                      placeholder="sk-ant-..."
                      className="w-full rounded-lg border border-white/10 bg-neutral-900 px-3 py-2 pl-9 font-mono text-sm text-neutral-100 outline-none placeholder:text-neutral-600 focus:border-fuchsia-400/40"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") save();
                      }}
                    />
                  </div>
                  {error && (
                    <p className="mt-2 text-xs text-amber-300">{error}</p>
                  )}
                  <p className="mt-2 text-[11px] text-neutral-500">
                    Stored only in this browser&apos;s localStorage. We never
                    see it. We never log it. Clearing your browser clears it.
                  </p>
                </div>
              }
            />
          </ol>

          <div className="mt-7 flex items-center justify-end gap-2">
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-10 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] px-4 text-sm text-neutral-200 hover:bg-white/[0.07] transition"
              >
                Later
              </button>
            )}
            <button
              type="button"
              onClick={save}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-white px-5 text-sm font-semibold text-neutral-950 shadow-lg shadow-black/30 hover:bg-neutral-200 transition"
            >
              <Check className="h-4 w-4" />
              Save & start
            </button>
          </div>

          <div className="mt-5 rounded-xl border border-emerald-400/20 bg-emerald-500/[0.05] p-3">
            <p className="text-xs text-emerald-200">
              <strong>Why BYOK?</strong> ContentLoop is open about cost. You
              pay Anthropic directly — typically{" "}
              <strong>$0.005 to $0.02 per generation</strong>. No surprise
              bills, no markup, full transparency.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

function Step({
  n,
  title,
  body,
}: {
  n: number;
  title: string;
  body: React.ReactNode;
}) {
  return (
    <li className="flex gap-3">
      <span className="mt-0.5 inline-flex h-6 w-6 flex-none items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-xs font-semibold text-neutral-200">
        {n}
      </span>
      <div className="flex-1">
        <h3 className="text-sm font-semibold text-neutral-100">{title}</h3>
        <div className="mt-2">{body}</div>
      </div>
    </li>
  );
}
