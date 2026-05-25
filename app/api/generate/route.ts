import { NextRequest, NextResponse } from "next/server";
import { getAnthropic, DEFAULT_MODEL, MAX_OUTPUT_TOKENS } from "@/lib/anthropic";
import { buildSystemPrompt, buildUserPrompt } from "@/lib/prompts";
import { FORMAT_MAP, type FormatId } from "@/lib/formats";
import { checkAndConsume } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 60;

interface GenerateBody {
  source: string;
  formats: FormatId[];
  extraInstructions?: string;
}

const MIN_SOURCE_CHARS = 120;
const MAX_SOURCE_CHARS = 30_000;
const MAX_FORMATS = 5;

function getClientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real.trim();
  return "anonymous";
}

export async function POST(req: NextRequest) {
  let body: GenerateBody;
  try {
    body = (await req.json()) as GenerateBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const source = (body.source ?? "").trim();
  const formats = (body.formats ?? []).filter(
    (f): f is FormatId => typeof f === "string" && f in FORMAT_MAP
  );
  const extra = body.extraInstructions?.trim();

  if (source.length < MIN_SOURCE_CHARS) {
    return NextResponse.json(
      {
        error: `Source must be at least ${MIN_SOURCE_CHARS} characters. Give the AI something to work with.`,
      },
      { status: 400 }
    );
  }
  if (source.length > MAX_SOURCE_CHARS) {
    return NextResponse.json(
      { error: `Source is too long. Maximum ${MAX_SOURCE_CHARS} characters.` },
      { status: 400 }
    );
  }
  if (formats.length === 0) {
    return NextResponse.json(
      { error: "Pick at least one output format." },
      { status: 400 }
    );
  }
  if (formats.length > MAX_FORMATS) {
    return NextResponse.json(
      { error: `Maximum ${MAX_FORMATS} formats per request.` },
      { status: 400 }
    );
  }

  // Rate limit (one request consumes one slot, regardless of how many formats)
  const ip = getClientIp(req);
  const rl = checkAndConsume(ip);
  if (!rl.allowed) {
    return NextResponse.json(
      {
        error: "Daily free limit reached.",
        upgrade: true,
        rateLimit: rl,
      },
      { status: 429 }
    );
  }

  let client;
  try {
    client = getAnthropic();
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Server misconfiguration";
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  // Run all formats in parallel for snappy UX.
  const results = await Promise.all(
    formats.map(async (formatId) => {
      try {
        const message = await client.messages.create({
          model: DEFAULT_MODEL,
          max_tokens: MAX_OUTPUT_TOKENS,
          system: buildSystemPrompt(formatId),
          messages: [
            {
              role: "user",
              content: buildUserPrompt(source, extra),
            },
          ],
        });

        const text = message.content
          .map((b) => (b.type === "text" ? b.text : ""))
          .join("\n")
          .trim();

        return {
          formatId,
          ok: true as const,
          text,
          usage: {
            input: message.usage?.input_tokens ?? 0,
            output: message.usage?.output_tokens ?? 0,
          },
        };
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Unknown generation error";
        return { formatId, ok: false as const, error: msg };
      }
    })
  );

  return NextResponse.json({
    results,
    rateLimit: rl,
  });
}

export async function GET() {
  return NextResponse.json({
    name: "ContentLoop /api/generate",
    method: "POST",
    body: {
      source: "string (120–30000 chars)",
      formats: Object.keys(FORMAT_MAP),
      extraInstructions: "optional string",
    },
  });
}
