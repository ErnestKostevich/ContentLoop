"use client";

import { useState } from "react";
import { Download, FileJson, FileText, Check } from "lucide-react";

interface ResultLike {
  formatId: string;
  ok: boolean;
  text?: string;
  error?: string;
}

function download(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function tsForFilename(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}`;
}

function toMarkdown(
  results: ResultLike[],
  labelFor: (id: string) => string,
  source: string
): string {
  const head = [
    "# ContentLoop export",
    "",
    `_Generated ${new Date().toLocaleString()}_`,
    "",
    "## Source",
    "",
    "```",
    source.trim(),
    "```",
    "",
    "---",
    "",
  ].join("\n");

  const body = results
    .map((r) => {
      const label = labelFor(r.formatId);
      if (!r.ok) {
        return `## ${label}\n\n> ⚠ Failed: ${r.error ?? "unknown error"}\n`;
      }
      return `## ${label}\n\n${r.text ?? ""}\n`;
    })
    .join("\n---\n\n");

  return head + body;
}

function toJson(
  results: ResultLike[],
  labelFor: (id: string) => string,
  source: string
): string {
  return JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      tool: "ContentLoop",
      source,
      results: results.map((r) => ({ ...r, label: labelFor(r.formatId) })),
    },
    null,
    2
  );
}

export function ExportResults({
  results,
  source,
  labelFor,
}: {
  results: ResultLike[];
  source: string;
  labelFor: (id: string) => string;
}) {
  const [open, setOpen] = useState(false);
  const [justDone, setJustDone] = useState<"md" | "json" | null>(null);

  if (!results || results.length === 0) return null;

  const exportMd = () => {
    download(
      `contentloop-${tsForFilename()}.md`,
      toMarkdown(results, labelFor, source),
      "text/markdown;charset=utf-8"
    );
    setJustDone("md");
    setTimeout(() => setJustDone(null), 1500);
    setOpen(false);
  };
  const exportJson = () => {
    download(
      `contentloop-${tsForFilename()}.json`,
      toJson(results, labelFor, source),
      "application/json"
    );
    setJustDone("json");
    setTimeout(() => setJustDone(null), 1500);
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs text-neutral-200 hover:bg-white/10 transition"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {justDone ? (
          <>
            <Check className="h-3 w-3 text-emerald-400" />
            Saved
          </>
        ) : (
          <>
            <Download className="h-3 w-3" />
            Export
          </>
        )}
      </button>
      {open && (
        <>
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-30"
          />
          <div
            role="menu"
            className="absolute right-0 z-40 mt-2 w-48 overflow-hidden rounded-xl border border-white/10 bg-neutral-950 shadow-2xl"
          >
            <button
              type="button"
              role="menuitem"
              onClick={exportMd}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-neutral-200 hover:bg-white/5 transition"
            >
              <FileText className="h-3.5 w-3.5 text-fuchsia-300" />
              <div>
                <div className="font-medium">Markdown</div>
                <div className="text-[10px] text-neutral-500">
                  Human-readable .md
                </div>
              </div>
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={exportJson}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-neutral-200 hover:bg-white/5 transition"
            >
              <FileJson className="h-3.5 w-3.5 text-indigo-300" />
              <div>
                <div className="font-medium">JSON</div>
                <div className="text-[10px] text-neutral-500">
                  Machine-readable .json
                </div>
              </div>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
