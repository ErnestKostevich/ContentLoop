/**
 * Pricing constants, client-safe (no SDK imports).
 * Update when Anthropic changes their published prices.
 * Source: https://www.anthropic.com/pricing
 */

export const MODEL_PRICING_USD_PER_MTOK = {
  // Claude Sonnet 4.5 (default model we use)
  input: 3.0,
  output: 15.0,
} as const;

export function estimateCostUsd(
  inputTokens: number,
  outputTokens: number
): number {
  return (
    (inputTokens / 1_000_000) * MODEL_PRICING_USD_PER_MTOK.input +
    (outputTokens / 1_000_000) * MODEL_PRICING_USD_PER_MTOK.output
  );
}

export function formatUsd(value: number): string {
  if (value < 0.01) {
    return `$${value.toFixed(4)}`;
  }
  if (value < 1) {
    return `$${value.toFixed(3)}`;
  }
  return `$${value.toFixed(2)}`;
}
