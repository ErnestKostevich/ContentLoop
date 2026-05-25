import Anthropic from "@anthropic-ai/sdk";

let _client: Anthropic | null = null;

export function getAnthropic(): Anthropic {
  if (_client) return _client;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY is not set. Add it to .env.local (see .env.example)."
    );
  }
  _client = new Anthropic({ apiKey });
  return _client;
}

// Default model. Sonnet hits the sweet spot for creative writing quality vs cost.
export const DEFAULT_MODEL = "claude-sonnet-4-5";
export const MAX_OUTPUT_TOKENS = 2048;
