import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { createRequire } from "node:module";
import { test } from "node:test";

import { createClient } from "@supabase/supabase-js";

const require = createRequire(import.meta.url);
const bin = require.resolve("supabase/dist/supabase.js");
const { API_URL: url, PUBLISHABLE_KEY: publishable, SERVICE_ROLE_KEY: serviceKey } = JSON.parse(
  execFileSync(process.execPath, [bin, "status", "--output", "json"], { encoding: "utf8" }),
);
const trusted = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
const visitor = createClient(url, publishable, { auth: { persistSession: false } });
const pack = "00000000-0000-4000-8000-000000000901";
const digest = "ab".repeat(32);

// A midtrans attempt with a known provider order id (as bind_provider_attempt
// would leave it). Two statements: an RPC's inserts are invisible to scans in
// the same statement.
const attemptKey = randomUUID();
const orderId = "r-" + "r".repeat(32);
const setup = `create temporary table purchase_fixture as
  select purchase_id as id, payment_attempt_id as attempt_id from public.create_processing_purchase(
    'unpaid-test@example.invalid', '${pack}', 'midtrans', repeat('r',32), '${attemptKey}',
    decode(repeat('ab',32),'hex'), now() + interval '15 minutes');
  update public.payment_attempts set provider_attempt_id = '${orderId}'
    where id in (select attempt_id from purchase_fixture);`;
const record = (provider_event_id = "evt-1", type = "payment.failed", outcome = "FAILED", oid = orderId) =>
  `select public.record_unpaid_payment_event('midtrans','${provider_event_id}','${oid}','${type}','${outcome}','${digest}');`;

function sql(statement) {
  return execFileSync("docker", ["exec", "-i", "supabase_db_renderbank", "psql", "-X", "-A", "-t", "-v", "ON_ERROR_STOP=1", "-U", "postgres", "-d", "postgres"], {
    input: `begin;\n${statement}\nset constraints all immediate;\nrollback;\n`, encoding: "utf8", stdio: ["pipe", "pipe", "pipe"],
  });
}

function rejects(statement, expected) {
  assert.throws(() => sql(statement), (error) => {
    assert.match(error.stderr.toString(), expected);
    return true;
  });
}

test("a verified failed event fails the live attempt and its processing purchase once", () => {
  const rows = sql(`${setup}
    ${record()}
    select p.payment_status || '|' || a.status::text || '|' || e.processing_status || '|' || e.event_type
      from public.purchases p join public.payment_attempts a on a.purchase_id = p.id
      join public.payment_events e on e.payment_attempt_id = a.id
      where p.id in (select id from purchase_fixture);`);
  assert.match(rows, /FAILED\|FAILED\|PROCESSED\|payment\.failed/);
});

test("expire transitions attempt to EXPIRED and purchase to CANCELLED", () => {
  const rows = sql(`${setup}
    ${record("evt-exp", "payment.expire", "EXPIRED")}
    select p.payment_status || '/' || a.status::text from public.purchases p
      join public.payment_attempts a on a.purchase_id = p.id
      where p.id in (select id from purchase_fixture);`);
  assert.match(rows, /CANCELLED\/EXPIRED/);
});

test("cancel maps to attempt/purchase FAILED per the ADR lifecycle table", () => {
  const rows = sql(`${setup}
    ${record("evt-cxl", "payment.cancel", "FAILED")}
    select p.payment_status || '/' || a.status::text from public.purchases p
      join public.payment_attempts a on a.purchase_id = p.id
      where p.id in (select id from purchase_fixture);`);
  assert.match(rows, /FAILED\/FAILED/);
});

test("replaying the same event is a mutation-free no-op", () => {
  const rows = sql(`${setup}
    ${record()}
    ${record()}
    ${record("evt-1", "payment.cancel", "CANCELLED")}
    select count(*) || '|' || count(distinct event_type) from public.payment_events
      where provider_event_id = 'evt-1';`);
  assert.match(rows, /\n1\|1/);
});

test("an event against a decided attempt or paid purchase is recorded IGNORED, never regressed", () => {
  // paid purchase first (completion path), then a failed event arrives late:
  const rows = sql(`${setup}
    update public.payment_attempts set status = 'SUCCEEDED' where id in (select attempt_id from purchase_fixture);
    update public.purchases set payment_status = 'PAID', paid_at = now() where id in (select id from purchase_fixture);
    ${record("evt-late")}
    select p.payment_status || '|' || a.status::text || '|' || e.processing_status
      from public.purchases p join public.payment_attempts a on a.purchase_id = p.id
      join public.payment_events e on e.payment_attempt_id = a.id
      where p.id in (select id from purchase_fixture);`);
  assert.match(rows, /PAID\|SUCCEEDED\|IGNORED/);
});

test("IGNORED outcomes (pending, capture-pending, refunds) write the event row only", () => {
  const rows = sql(`${setup}
    ${record("evt-pend", "payment.pending", "IGNORED")}
    select e.processing_status || '/' || p.payment_status || '/' || a.status::text
      from public.purchases p join public.payment_attempts a on a.purchase_id = p.id
      join public.payment_events e on e.payment_attempt_id = a.id
      where p.id in (select id from purchase_fixture);`);
  assert.match(rows, /IGNORED\/PROCESSING\/CREATED/);
});

test("unknown provider order ids raise; no event row is created", () => {
  rejects(`${setup} ${record("evt-x", "payment.failed", "FAILED", "r-unknown-order")}`, /Payment attempt not found/);
});

test("malformed verified facts raise before touching anything", () => {
  rejects(`${setup} ${record("evt-bad", "Payment.Failed", "FAILED")}`, /Invalid verified payment facts/);
  rejects(`${setup} ${record("evt-bad", "payment.failed", "PAID")}`, /Invalid verified payment facts/);
  rejects(`${setup} select public.record_unpaid_payment_event('midtrans','evt-bad','${orderId}','payment.failed','FAILED','not-a-digest');`,
    /Invalid verified payment facts/);
  rejects(`${setup} ${record("", "payment.failed", "FAILED")}`, /Invalid verified payment facts/);
});

test("recording is service-role only and can never mint credentials", async () => {
  const { error } = await visitor.rpc("record_unpaid_payment_event", {
    p_provider: "midtrans", p_provider_event_id: "evt-x", p_provider_attempt_id: orderId,
    p_event_type: "payment.failed", p_event_outcome: "FAILED", p_provider_payload_digest: digest,
  });
  assert.ok(error, "browser roles cannot record paid-complement events");
  assert.match(error.message, /permission denied/i);
});

test("service role records through the API boundary", async () => {
  const attemptKeyApi = randomUUID();
  const created = await trusted.rpc("create_processing_purchase", {
    buyer_email: "unpaid-api@example.invalid", selected_pack_id: pack, payment_provider: "midtrans",
    reference: randomUUID().replaceAll("-", ""), attempt_key: attemptKeyApi,
    claim_hash: `\\x${"bc".repeat(32)}`, claim_expires_at: new Date(Date.now() + 15 * 60_000).toISOString(),
  });
  assert.ifError(created.error);
  try {
    const attemptId = created.data[0].payment_attempt_id;
    assert.ifError((await trusted.from("payment_attempts").update({ provider_attempt_id: "r-api-order" }).eq("id", attemptId)).error);
    const rpc = await trusted.rpc("record_unpaid_payment_event", {
      p_provider: "midtrans", p_provider_event_id: "evt-api", p_provider_attempt_id: "r-api-order",
      p_event_type: "payment.expire", p_event_outcome: "EXPIRED", p_provider_payload_digest: digest,
    });
    assert.ifError(rpc.error);
    const { data: attempt } = await trusted.from("payment_attempts").select("status").eq("id", attemptId).maybeSingle();
    assert.equal(attempt?.status ?? null, "EXPIRED");
  } finally {
    assert.ifError((await trusted.from("payment_events").delete().eq("provider_event_id", "evt-api")).error);
    assert.ifError((await trusted.from("payment_attempts").delete().eq("purchase_id", created.data[0].purchase_id)).error);
    assert.ifError((await trusted.from("purchases").delete().eq("id", created.data[0].purchase_id)).error);
  }
});
