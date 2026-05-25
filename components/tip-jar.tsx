"use client";

import { Coffee } from "lucide-react";

/**
 * Voluntary tip jar — links to whatever URL the operator sets in
 * NEXT_PUBLIC_TIP_JAR_URL (ko-fi, BMC, etc).
 * Renders nothing if no URL is set, so the site stays clean.
 */
export function TipJar({
  variant = "footer",
}: {
  variant?: "footer" | "inline";
}) {
  const url = process.env.NEXT_PUBLIC_TIP_JAR_URL;
  if (!url) return null;

  if (variant === "inline") {
    return (
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1.5 rounded-lg border border-amber-400/20 bg-amber-500/[0.06] px-3 py-1.5 text-xs text-amber-100 hover:bg-amber-500/[0.10] transition"
      >
        <Coffee className="h-3.5 w-3.5" />
        Buy the maker a coffee
      </a>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-amber-300 transition"
    >
      <Coffee className="h-3 w-3" />
      Like ContentLoop? Tip the maker
    </a>
  );
}
