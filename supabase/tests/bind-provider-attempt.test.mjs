import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { createRequire } from "node:module";
import { test } from "node:test";

import { createClient } from "@supabase/supabase-js";

const require = createRequire(import.meta.url);
const bin = require.resolve("supabase/dist/supabase.js");
const { API_URL: url, PUBLISHABLE_KEY: publishable } = JSON.parse(
  execFileSync(process.execPath, [bin, "status", "--output", "json"], { encoding: "utf8" }),
);
const visitor = createClient(url, publishable, { auth: { persistSession: false } });
const pack = "00000000-0000-4000-8000-000000000901";

// A midtrans-provider attempt with a stable idempotency key ("attempt key").
// Two statements: an RPC's inserts are invisible to scans in the same statement.
const attemptKey = randomUUID();
const orderId = "r-" + "r".repeat(32);
const setup = `create temporary table purchase_fixture as
  select purchase_id as id from public.create_processing_purchase('buyer@example.invalid','${pack}','midtrans',
    repeat('r',32),'${attemptKey}',decode(repeat('ab',32),'hex'),now()+interval '15 minutes');
  create temporary table attempt_fixture as
  select id, purchase_id, provider_attempt_id, status from public.payment_attempts where purchase_id in (select id from purchase_fixture);`;
const bind = `select public.bind_provider_attempt('${attemptKey}', 'midtrans', '${orderId}');`;

function sql(statement) {
  return execFileSync("docker", ["exec", "-i", "supabase_db_renderbank", "psql", "-X", "-A", "-t", "-v", "ON_ERROR_STOP=1", "-U", "postgres", "-d", "postgres"], {
    input: `begin;\n${statement}\nrollback;\n`, encoding: "utf8", stdio: ["pipe", "pipe", "pipe"],
  });
}

function rejects(statement, expected) {
  assert.throws(() => sql(statement), (error) => {
    assert.match(error.stderr.toString(), expected);
    return true;
  });
}

test("binding stores the provider order id once, then rebinds idempotently", () => {
  const rows = sql(`${setup}
    ${bind}
    select provider_attempt_id || '|' || status::text from public.payment_attempts where idempotency_key = '${attemptKey}';
    ${bind}
    select provider_attempt_id from public.payment_attempts where idempotency_key = '${attemptKey}';`);
  // void rpc calls print blank lines in psql output; assert both reads separately.
  assert.ok(rows.includes(`${orderId}|CREATED`), rows);
  assert.ok(rows.includes(`\n${orderId}\nROLLBACK`), rows);
});

test("a second provider order id, terminal attempt, or unknown key raises", () => {
  rejects(`${setup} ${bind} select public.bind_provider_attempt('${attemptKey}', 'midtrans', 'r-other-order');`,
    /Payment attempt already bound to another provider order/);
  rejects(`${setup} insert into public.payment_attempts (purchase_id,provider,idempotency_key,checkout_claim_hash,amount_minor,currency,status)
    select purchase_id,'midtrans','${'x'.repeat(32)}',decode(repeat('ac',32),'hex'),59000,'IDR','FAILED' from attempt_fixture;
    select public.bind_provider_attempt('${'x'.repeat(32)}', 'midtrans', '${orderId}');`, /Payment attempt is terminal/);
  rejects(`${setup} select public.bind_provider_attempt('${randomUUID()}-extra', 'midtrans', '${orderId}');`, /Payment attempt not found/);
  // a known key under a different provider is also an unknown attempt
  rejects(`${setup} select public.bind_provider_attempt('${attemptKey}', 'demo', '${orderId}');`, /Payment attempt not found/);
});

test("binding input is validated before it touches any attempt", () => {
  for (const bad of [
    `'', 'midtrans', 'r-order-one'`,
    `'${attemptKey}', 'Mid', '${orderId}'`,
    `'${attemptKey}', 'midtrans', 'no!'`,
  ]) {
    rejects(`select public.bind_provider_attempt(${bad});`, /Invalid provider attempt binding/, bad);
  }
});

test("binding is service-role only", async () => {
  const { error } = await visitor.rpc("bind_provider_attempt", { p_attempt_key: attemptKey, p_provider: "midtrans", p_order_id: orderId });
  assert.ok(error, "browser roles cannot bind provider attempts");
  assert.match(error.message, /permission denied/i);
});
