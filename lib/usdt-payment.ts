/**
 * Direct USDT payments — user sends exact amount to a fixed wallet,
 * submits tx hash, we verify on-chain and grant Pro.
 */

export type UsdtNetwork = "trc20" | "erc20";

const USDT_TRC20_CONTRACT = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t";
const USDT_ERC20_CONTRACT = "0xdac17f958d2ee523a2206206994597c13d831ec7";
const TRANSFER_TOPIC =
  "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
const MAX_AGE_MS = 24 * 60 * 60 * 1000;

export function isDirectUsdtEnabledServer(): boolean {
  return Boolean(
    process.env.USDT_TRC20_ADDRESS?.trim() &&
      process.env.USDT_ERC20_ADDRESS?.trim()
  );
}

export function getUsdtPaymentConfig() {
  const amountUsd = Number(
    process.env.USDT_PRO_AMOUNT_USD ?? process.env.PRO_PLAN_USD ?? "9"
  );
  const amountLabel = Number.isInteger(amountUsd)
    ? `$${amountUsd}`
    : `$${amountUsd.toFixed(2)}`;
  return {
    amountUsd,
    amountLabel,
    trc20Address: process.env.USDT_TRC20_ADDRESS?.trim() ?? "",
    erc20Address: process.env.USDT_ERC20_ADDRESS?.trim() ?? "",
    maxAgeHours: 24,
    planDays: Number(process.env.PRO_PLAN_DAYS ?? "30"),
  };
}

/** USDT uses 6 decimals on both TRON and Ethereum. */
function usdtAmountToMicro(units: number): bigint {
  return BigInt(Math.round(units * 1_000_000));
}

function normalizeEthAddress(addr: string): string {
  return addr.toLowerCase().replace(/^0x/, "");
}

function normalizeTronAddress(addr: string): string {
  return addr.trim();
}

function isRecent(timestampMs: number): boolean {
  return Date.now() - timestampMs <= MAX_AGE_MS;
}

export interface VerifiedUsdtPayment {
  network: UsdtNetwork;
  txHash: string;
  amountMicro: bigint;
  timestampMs: number;
  toAddress: string;
}

async function verifyTrc20(txHash: string): Promise<VerifiedUsdtPayment> {
  const config = getUsdtPaymentConfig();
  const expectedTo = normalizeTronAddress(config.trc20Address);
  const expectedAmount = usdtAmountToMicro(config.amountUsd);

  const res = await fetch(
    `https://apilist.tronscanapi.com/api/transaction-info?hash=${encodeURIComponent(txHash)}`,
    { headers: { Accept: "application/json" }, next: { revalidate: 0 } }
  );
  if (!res.ok) {
    throw new Error("Could not fetch TRON transaction. Check the hash and try again.");
  }

  const data = (await res.json()) as {
    hash?: string;
    timestamp?: number;
    contractRet?: string;
    trc20TransferInfo?: Array<{
      to_address?: string;
      contract_address?: string;
      symbol?: string;
      amount_str?: string;
      decimals?: number;
    }>;
  };

  if (data.contractRet && data.contractRet !== "SUCCESS") {
    throw new Error("Transaction failed on-chain.");
  }

  const transfers = data.trc20TransferInfo ?? [];
  const match = transfers.find((t) => {
    const to = normalizeTronAddress(t.to_address ?? "");
    const contract = normalizeTronAddress(t.contract_address ?? "");
    const symbol = (t.symbol ?? "").toUpperCase();
    if (to !== expectedTo) return false;
    if (contract !== normalizeTronAddress(USDT_TRC20_CONTRACT)) return false;
    if (symbol !== "USDT") return false;
    const amountStr = t.amount_str ?? "0";
    const micro = BigInt(Math.round(parseFloat(amountStr) * 1_000_000));
    return micro === expectedAmount;
  });

  if (!match) {
    throw new Error(
      `No matching USDT transfer of exactly ${config.amountLabel} to your TRC-20 address in this transaction.`
    );
  }

  const ts = (data.timestamp ?? 0) * (data.timestamp && data.timestamp < 1e12 ? 1000 : 1);
  if (!ts || !isRecent(ts)) {
    throw new Error("Payment must be within the last 24 hours.");
  }

  return {
    network: "trc20",
    txHash,
    amountMicro: expectedAmount,
    timestampMs: ts,
    toAddress: expectedTo,
  };
}

async function rpcEth<T>(method: string, params: unknown[]): Promise<T> {
  const res = await fetch("https://eth.llamarpc.com", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
  const json = (await res.json()) as { result?: T; error?: { message: string } };
  if (json.error) throw new Error(json.error.message);
  if (json.result === undefined) throw new Error("Empty RPC response");
  return json.result;
}

async function verifyErc20(txHash: string): Promise<VerifiedUsdtPayment> {
  const config = getUsdtPaymentConfig();
  const expectedTo = normalizeEthAddress(config.erc20Address);
  const expectedAmount = usdtAmountToMicro(config.amountUsd);
  const hash = txHash.startsWith("0x") ? txHash : `0x${txHash}`;

  const receipt = await rpcEth<{
    status?: string;
    blockNumber?: string;
    logs?: Array<{
      address?: string;
      topics?: string[];
      data?: string;
    }>;
  } | null>("eth_getTransactionReceipt", [hash]);

  if (!receipt || receipt.status !== "0x1") {
    throw new Error("Transaction not found or failed on Ethereum.");
  }

  let matched = false;
  for (const log of receipt.logs ?? []) {
    if (normalizeEthAddress(log.address ?? "") !== normalizeEthAddress(USDT_ERC20_CONTRACT)) {
      continue;
    }
    if ((log.topics?.[0] ?? "").toLowerCase() !== TRANSFER_TOPIC) continue;
    const toTopic = log.topics?.[2];
    if (!toTopic) continue;
    const to = normalizeEthAddress(toTopic.slice(-40));
    if (to !== expectedTo) continue;
    const amount = BigInt(log.data ?? "0x0");
    if (amount !== expectedAmount) continue;
    matched = true;
    break;
  }

  if (!matched) {
    throw new Error(
      `No matching USDT transfer of exactly ${config.amountLabel} to your ERC-20 address in this transaction.`
    );
  }

  const block = await rpcEth<{ timestamp?: string }>(
    "eth_getBlockByNumber",
    [receipt.blockNumber, false]
  );
  const ts = parseInt(block.timestamp ?? "0", 16) * 1000;
  if (!ts || !isRecent(ts)) {
    throw new Error("Payment must be within the last 24 hours.");
  }

  return {
    network: "erc20",
    txHash: hash,
    amountMicro: expectedAmount,
    timestampMs: ts,
    toAddress: config.erc20Address,
  };
}

export async function verifyUsdtPayment(
  network: UsdtNetwork,
  txHash: string
): Promise<VerifiedUsdtPayment> {
  const cleaned = txHash.trim();
  if (!cleaned || cleaned.length < 16) {
    throw new Error("Invalid transaction hash.");
  }

  if (network === "trc20") {
    return verifyTrc20(cleaned);
  }
  return verifyErc20(cleaned);
}