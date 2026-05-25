import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";

export const runtime = "nodejs";
export const maxDuration = 30;

const MAX_BYTES = 2_000_000; // 2 MB hard cap on fetched page
const MAX_TEXT_CHARS = 30_000;
const TIMEOUT_MS = 12_000;

function isHttpUrl(input: string): URL | null {
  try {
    const url = new URL(input);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url;
  } catch {
    return null;
  }
}

function isPrivateHost(host: string): boolean {
  const h = host.toLowerCase();
  return (
    h === "localhost" ||
    h.endsWith(".local") ||
    h.startsWith("127.") ||
    h.startsWith("10.") ||
    h.startsWith("192.168.") ||
    /^169\.254\./.test(h) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(h) ||
    h === "::1"
  );
}

function cleanText(t: string): string {
  return t
    .replace(/ /g, " ") // nbsp
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export async function POST(req: NextRequest) {
  let body: { url?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const url = isHttpUrl((body.url ?? "").trim());
  if (!url) {
    return NextResponse.json(
      { error: "Provide a valid http(s) URL." },
      { status: 400 }
    );
  }
  if (isPrivateHost(url.hostname)) {
    return NextResponse.json(
      { error: "Local / private addresses are not allowed." },
      { status: 400 }
    );
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let html: string;
  try {
    const res = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "user-agent":
          "Mozilla/5.0 (compatible; ContentLoopBot/1.0; +https://contentloop.app)",
        accept: "text/html,application/xhtml+xml",
      },
      signal: controller.signal,
      redirect: "follow",
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Source returned ${res.status}.` },
        { status: 400 }
      );
    }

    const ct = res.headers.get("content-type") ?? "";
    if (!ct.includes("text/html") && !ct.includes("application/xhtml")) {
      return NextResponse.json(
        { error: `Only HTML pages are supported (got: ${ct || "unknown"}).` },
        { status: 400 }
      );
    }

    const reader = res.body?.getReader();
    if (!reader) {
      return NextResponse.json(
        { error: "Empty response body." },
        { status: 400 }
      );
    }

    let received = 0;
    const chunks: Uint8Array[] = [];
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      received += value.byteLength;
      if (received > MAX_BYTES) {
        try {
          await reader.cancel();
        } catch {
          /* ignore */
        }
        return NextResponse.json(
          { error: "Page is too large to import (>2 MB)." },
          { status: 400 }
        );
      }
      chunks.push(value);
    }
    html = new TextDecoder("utf-8", { fatal: false }).decode(
      Buffer.concat(chunks.map((c) => Buffer.from(c)))
    );
  } catch (e) {
    const msg =
      e instanceof Error && e.name === "AbortError"
        ? "Source timed out."
        : e instanceof Error
          ? e.message
          : "Failed to fetch URL.";
    return NextResponse.json({ error: msg }, { status: 400 });
  } finally {
    clearTimeout(timeout);
  }

  // Parse + extract main content
  let text = "";
  let title: string | null = null;
  try {
    const $ = cheerio.load(html);

    title =
      $("meta[property='og:title']").attr("content")?.trim() ||
      $("title").first().text().trim() ||
      null;

    // Strip obvious noise
    $(
      "script, style, noscript, nav, header, footer, form, aside, iframe, button, svg, .ad, .ads, .advert, .promo, [aria-hidden='true']"
    ).remove();

    // Choose a content root: prefer <article>, fall back to <main>, then <body>
    const candidates = ["article", "main", "[role='main']", "body"];
    let rootSel = "body";
    for (const sel of candidates) {
      const t = $(sel).first().text().trim();
      if (t.length > 200) {
        rootSel = sel;
        break;
      }
    }

    const blocks: string[] = [];
    $(rootSel)
      .first()
      .find("h1, h2, h3, h4, p, li, blockquote, pre")
      .each((_, el) => {
        const piece = $(el).text().trim();
        if (piece.length > 0) blocks.push(piece);
      });

    text = cleanText(blocks.join("\n\n"));
    if (text.length > MAX_TEXT_CHARS) {
      text = text.slice(0, MAX_TEXT_CHARS).trimEnd();
    }
  } catch {
    return NextResponse.json(
      { error: "Failed to parse the page." },
      { status: 500 }
    );
  }

  if (text.length < 120) {
    return NextResponse.json(
      {
        error:
          "Couldn't extract enough text from this page. Try pasting the article body manually.",
      },
      { status: 400 }
    );
  }

  return NextResponse.json({
    text,
    title,
    sourceUrl: url.toString(),
    chars: text.length,
  });
}
