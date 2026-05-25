import Anthropic from "@anthropic-ai/sdk";

let _client: Anthropic | null = null;

/**
 * Whether the server has its own Anthropic key. In zero-cost mode
 * (production deploy without ANTHROPIC_API_KEY), this is false — every
 * generation must come with a user-supplied BYOK key.
 */
export function hasServerKey(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

/** Throws if the server has no key — caller must check hasServerKey() first. */
export function getAnthropic(): Anthropic {
  if (_client) return _client;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Server has no ANTHROPIC_API_KEY. Users must bring their own key."
    );
  }
  _client = new Anthropic({ apiKey });
  return _client;
}

// Default model. Sonnet hits the sweet spot for creative writing quality vs cost.
export const DEFAULT_MODEL = "claude-sonnet-4-5";
export const MAX_OUTPUT_TOKENS = 2048;

// Pricing helpers moved to `@/lib/pricing` so they can be imported in
// client components without dragging the Anthropic SDK along.
export {
  MODEL_PRICING_USD_PER_MTOK as PRICING_USD_PER_MTOK,
  estimateCostUsd,
} from "./pricing";
