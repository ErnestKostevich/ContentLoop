#!/usr/bin/env node
/**
 * Add Clerk production DNS records for contentloop.fun on Porkbun.
 *
 *   $env:PORKBUN_API_KEY="pk1_..."
 *   $env:PORKBUN_SECRET_API_KEY="sk1_..."
 *   node scripts/setup-clerk-dns.mjs
 */
import "dotenv/config";

const DOMAIN = "contentloop.fun";

/** Update these if Clerk dashboard shows different DKIM targets. */
const CLERK_CNAME = [
  { name: "clerk", content: "frontend-api.clerk.services" },
  { name: "accounts", content: "accounts.clerk.services" },
  { name: "clkmail", content: "mail.t12lpjgfawgj.clerk.services" },
  { name: "clk._domainkey", content: "dkim1.t12lpjgfawgj.clerk.services" },
  { name: "clk2._domainkey", content: "dkim2.t12lpjgfawgj.clerk.services" },
];

const apiKey = process.env.PORKBUN_API_KEY;
const secretApiKey = process.env.PORKBUN_SECRET_API_KEY;

if (!apiKey || !secretApiKey) {
  console.error("Missing PORKBUN_API_KEY or PORKBUN_SECRET_API_KEY");
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

async function createCname(name, content) {
  await porkbun(`/dns/create/${DOMAIN}`, {
    name,
    type: "CNAME",
    content,
    ttl: "600",
  });
}

async function ensureCname(name, content) {
  const records = await listRecords();
  const existing = records.filter(
    (r) =>
      r.type === "CNAME" &&
      r.name === name &&
      r.content.replace(/\.$/, "") === content.replace(/\.$/, "")
  );
  if (existing.length > 0) {
    console.log(`✓ CNAME ${name || "@"} → ${content}`);
    return;
  }
  for (const r of records) {
    if (r.name === name && ["CNAME", "ALIAS"].includes(r.type)) {
      console.log(`  removing old ${r.type} ${r.name} → ${r.content}`);
      await deleteRecord(r.id);
    }
  }
  await createCname(name, content);
  console.log(`✓ created CNAME ${name} → ${content}`);
}

console.log(`Adding Clerk DNS for ${DOMAIN}…\n`);
for (const { name, content } of CLERK_CNAME) {
  await ensureCname(name, content);
}
console.log("\nDone. Re-run verification in Clerk dashboard → Domains.");