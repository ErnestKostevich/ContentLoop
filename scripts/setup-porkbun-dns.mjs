#!/usr/bin/env node
/**
 * Configure Porkbun DNS for contentloop.fun → Vercel.
 *
 * Create API keys at https://porkbun.com/account/api
 * Then run:
 *   $env:PORKBUN_API_KEY="pk1_..."
 *   $env:PORKBUN_SECRET_API_KEY="sk1_..."
 *   node scripts/setup-porkbun-dns.mjs
 */
import "dotenv/config";

const DOMAIN = "contentloop.fun";
const VERCEL_A = "76.76.21.21";

const apiKey = process.env.PORKBUN_API_KEY;
const secretApiKey = process.env.PORKBUN_SECRET_API_KEY;

if (!apiKey || !secretApiKey) {
  console.error(
    "Missing PORKBUN_API_KEY or PORKBUN_SECRET_API_KEY.\n" +
      "Create keys at https://porkbun.com/account/api"
  );
  process.exit(1);
}

const base = `https://api.porkbun.com/api/json/v3`;
const auth = { apikey: apiKey, secretapikey: secretApiKey };

async function porkbun(path, body = {}) {
  const res = await fetch(`${base}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...auth, ...body }),
  });
  const data = await res.json();
  if (data.status !== "SUCCESS") {
    throw new Error(`${path}: ${data.message ?? JSON.stringify(data)}`);
  }
  return data;
}

async function listRecords() {
  const data = await porkbun(`/dns/retrieve/${DOMAIN}`);
  return data.records ?? [];
}

async function deleteRecord(id) {
  await porkbun(`/dns/delete/${DOMAIN}/${id}`);
}

async function createRecord(name, type, content) {
  await porkbun(`/dns/create/${DOMAIN}`, { name, type, content, ttl: "600" });
}

async function ensureA(name, ip) {
  const records = await listRecords();
  const existing = records.filter(
    (r) => r.type === "A" && r.name === name && r.content === ip
  );
  if (existing.length > 0) {
    console.log(`✓ A ${name || "@"} → ${ip} already exists`);
    return;
  }

  // Remove conflicting A/ALIAS/CNAME on same host
  for (const r of records) {
    if (r.name === name && ["A", "ALIAS", "CNAME"].includes(r.type)) {
      console.log(`  removing old ${r.type} ${r.name || "@"} → ${r.content}`);
      await deleteRecord(r.id);
    }
  }

  await createRecord(name, "A", ip);
  console.log(`✓ created A ${name || "@"} → ${ip}`);
}

console.log(`Configuring DNS for ${DOMAIN} → Vercel (${VERCEL_A})…\n`);
await ensureA("", VERCEL_A);
await ensureA("www", VERCEL_A);
console.log("\nDone. DNS may take up to 48h to propagate (usually < 1h).");
console.log("Verify: vercel domains inspect contentloop.fun");