import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { randomBytes, randomUUID } from "node:crypto";
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
const prompt = "00000000-0000-4000-8000-000000000603";
const init = (email = "buyer@example.invalid", selectedPack = pack, reference = "r".repeat(32), key = "k".repeat(32)) =>
  `select * from public.create_processing_purchase('${email}', '${selectedPack}', 'demo', '${reference}', '${key}', decode(repeat('ab', 32), 'hex'), now() + interval '15 minutes');`;
const setup = `create temporary table buyer_fixture as
  select purchase_id as id from public.create_processing_purchase('buyer@example.invalid','${pack}','demo',repeat('r',32),repeat('k',32),decode(repeat('ab',32),'hex'),now()+interval '15 minutes');`;
const setupAttempt = `${setup} create temporary table attempt_fixture as
  select id, purchase_id from public.payment_attempts where purchase_id in (select id from buyer_fixture);`;

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

test("trusted checkout initialization snapshots published Prompt Pack terms atomically", () => {
  const rows = sql(`
    select count(*) from public.purchases;
    select * from public.create_processing_purchase('buyer@example.invalid', '${pack}', 'demo', repeat('r', 32), repeat('k', 32), decode(repeat('ab', 32), 'hex'), now() + interval '15 minutes');
    select p.buyer_email_normalized || '|' || p.pack_title_snapshot || '|' || p.amount_minor || '|' || p.currency || '|' || a.amount_minor || '|' || a.currency || '|' || encode(a.checkout_claim_hash, 'hex')
      from public.purchases p join public.payment_attempts a on a.purchase_id = p.id;
    select count(*) from public.purchases;
  `);
  assert.match(rows, /0\n/);
  assert.match(rows, /buyer@example.invalid\|.*\|[0-9]+\|[A-Z]{3}\|[0-9]+\|[A-Z]{3}\|(?:ab){32}/);
  assert.match(rows, /\n1\n/);
});

test("purchase and attempt terms cannot be changed after checkout", () => {
  rejects(`${setup} update public.purchases set amount_minor = 1 where id in (select id from buyer_fixture);`, /Purchase terms are immutable/);
  rejects(`${setupAttempt} update public.payment_attempts set currency = 'USD' where id in (select id from attempt_fixture);`, /Payment attempt terms are immutable/);
  rejects(`${setup} update public.purchases set payment_status = 'PAID' where id in (select id from buyer_fixture);`, /purchases_paid_at_check/);
  rejects(`${setup} update public.purchases set payment_status = 'PAID', paid_at = now() where id in (select id from buyer_fixture);
    update public.purchases set payment_status = 'PROCESSING', paid_at = null where id in (select id from buyer_fixture);`, /Paid purchase cannot regress/);
});

test("invalid Prompt Pack or duplicate claim leaves no processing purchase", () => {
  rejects(init("buyer@example.invalid", "00000000-0000-4000-8000-000000000903"), /Prompt Pack unavailable/);
  rejects(`${init()} ${init("other@example.invalid", pack, "s".repeat(32), "l".repeat(32))}`, /duplicate key value/);
  rejects(init(" Buyer@Example.Invalid "), /Invalid checkout initialization/);
});

test("hash-only credentials, provider identities and entitlement pairs remain unique", () => {
  rejects(`${setupAttempt} insert into public.payment_attempts (purchase_id,provider,idempotency_key,checkout_claim_hash,amount_minor,currency)
    select id,'demo','another-key',decode(repeat('ab',32),'hex'),59000,'IDR' from buyer_fixture;`, /duplicate key value/);
  rejects(`${setup} insert into public.access_tokens(purchase_id,token_hash) select id,decode('ab','hex') from buyer_fixture;`, /violates check constraint/);
  rejects(`${setup} insert into public.access_sessions(purchase_id,session_hash,expires_at) select id,decode('ab','hex'),now()+interval '1 hour' from buyer_fixture;`, /violates check constraint/);
  rejects(`${setup} insert into public.purchase_entitlements(purchase_id,prompt_id) select id,'${prompt}' from buyer_fixture;
    insert into public.purchase_entitlements(purchase_id,prompt_id) select id,'${prompt}' from buyer_fixture;`, /duplicate key value/);
  rejects(`${setupAttempt} insert into public.payment_events(provider,provider_event_id,payment_attempt_id,event_type)
    select 'demo','event-one',id,'success' from attempt_fixture;
    insert into public.payment_events(provider,provider_event_id,payment_attempt_id,event_type)
    select 'demo','event-one',id,'success' from attempt_fixture;`, /duplicate key value/);
  rejects(`${setupAttempt} insert into public.payment_attempts(purchase_id,provider,provider_attempt_id,idempotency_key,checkout_claim_hash,amount_minor,currency)
    select purchase_id,'demo','provider-one','another-key',decode(repeat('bc',32),'hex'),59000,'IDR' from attempt_fixture;
    update public.payment_attempts set provider_attempt_id = 'provider-one' where id in (select id from attempt_fixture);`, /duplicate key value/);
  const columns = sql(`select table_name || ':' || column_name from information_schema.columns where table_schema = 'public'
    and table_name in ('access_tokens','access_sessions','payment_attempts') and column_name like '%token%' or table_schema = 'public' and table_name in ('access_tokens','access_sessions','payment_attempts') and column_name like '%session%' or table_schema = 'public' and table_name in ('access_tokens','access_sessions','payment_attempts') and column_name like '%claim%' order by 1;`);
  assert.match(columns, /access_tokens:token_hash/);
  assert.match(columns, /access_sessions:session_hash/);
  assert.match(columns, /payment_attempts:checkout_claim_hash/);
  assert.doesNotMatch(columns, /:token$|:session$|:checkout_claim$/m);
});

test("Buyer sessions and token rotation cannot cross purchases sharing an email", () => {
  const twoPurchases = `${setup} create temporary table other_buyer as
    select purchase_id as id from public.create_processing_purchase('buyer@example.invalid','${pack}','demo',repeat('s',32),repeat('l',32),decode(repeat('bc',32),'hex'),now()+interval '15 minutes');`;
  const state = sql(`${twoPurchases}
    insert into public.access_sessions(purchase_id,session_hash,expires_at) select id,decode(repeat('cd',32),'hex'),now()+interval '1 hour' from buyer_fixture;
    select count(*) || '|' || count(distinct buyer_email_normalized) from public.purchases;
    select count(*) from public.access_sessions s join buyer_fixture b on b.id = s.purchase_id;`);
  assert.match(state, /2\|1/);
  assert.match(state, /\n1\n/);
  rejects(`${twoPurchases}
    insert into public.access_tokens(purchase_id,token_hash)
      select id,decode(repeat('de',32),'hex') from buyer_fixture;
    insert into public.access_tokens(purchase_id,token_hash,rotated_from_token_id)
      select b.id,decode(repeat('ef',32),'hex'),t.id from other_buyer b cross join public.access_tokens t;`, /access_tokens_rotated_from_token_id_purchase_id_fkey/);
});

test("service role initializes checkout through the API with authoritative Prompt Pack terms", async () => {
  const reference = randomBytes(32).toString("base64url");
  const { data, error } = await trusted.rpc("create_processing_purchase", {
    buyer_email: "buyer@example.invalid", selected_pack_id: pack, payment_provider: "demo",
    reference, attempt_key: randomUUID(), claim_hash: `\\x${"ab".repeat(32)}`,
    claim_expires_at: new Date(Date.now() + 15 * 60_000).toISOString(),
  });
  assert.ifError(error);
  assert.equal(data.length, 1);
  try {
    assert.equal(data[0].pack_title, "Demo Content: Product Pack");
    assert.equal(data[0].amount_minor, 59000);
    assert.equal(data[0].currency, "IDR");
  } finally {
    assert.ifError((await trusted.from("payment_attempts").delete().eq("purchase_id", data[0].purchase_id)).error);
    assert.ifError((await trusted.from("purchases").delete().eq("id", data[0].purchase_id)).error);
  }
});

test("a purchased entitlement remains after Prompt Pack edits, and email failure leaves it intact", () => {
  const result = sql(`${setup}
    insert into public.purchase_entitlements(purchase_id,prompt_id) select id,'${prompt}' from buyer_fixture;
    insert into public.email_deliveries(purchase_id,recipient_email_normalized,provider)
      select id,'buyer@example.invalid','demo' from buyer_fixture;
    update public.email_deliveries set status = 'FAILED', failed_at = now() where purchase_id in (select id from buyer_fixture);
    update public.packs set title = 'Renamed for future Buyers', price_minor = 123 where id = '${pack}';
    select p.pack_title_snapshot || '|' || p.amount_minor || '|' || d.status || '|' || count(e.id)
      from public.purchases p join public.email_deliveries d on d.purchase_id = p.id
      join public.purchase_entitlements e on e.purchase_id = p.id
      where p.id in (select id from buyer_fixture)
      group by p.pack_title_snapshot,p.amount_minor,d.status;`);
  assert.match(result, /Demo Content: Product Pack\|59000\|FAILED\|1/);
  rejects(`${setup} insert into public.purchase_entitlements(purchase_id,prompt_id) select id,'${prompt}' from buyer_fixture;
    delete from public.prompts where id = '${prompt}';`, /violates foreign key constraint|Published Pack is missing/);
  rejects(`${setupAttempt} delete from public.purchases where id in (select id from buyer_fixture);`, /violates foreign key constraint/);
  rejects(`${setup} delete from public.packs where id = '${pack}';`, /violates foreign key constraint/);
});

test("Visitor, ordinary Auth users and active Admins cannot read or mutate Buyer records", async () => {
  const email = `buyer-boundary-${randomUUID()}@example.invalid`;
  const password = `RlsTest-${randomUUID()}!`;
  const { data: created, error: createError } = await trusted.auth.admin.createUser({ email, password, email_confirm: true });
  assert.ifError(createError);
  const signedIn = createClient(url, publishable, { auth: { persistSession: false, autoRefreshToken: false } });
  assert.ifError((await signedIn.auth.signInWithPassword({ email, password })).error);
  const input = { buyer_email: "buyer@example.invalid", selected_pack_id: pack, payment_provider: "demo",
    reference: "r".repeat(32), attempt_key: "k".repeat(32), claim_hash: `\\x${"ab".repeat(32)}`,
    claim_expires_at: new Date(Date.now() + 15 * 60_000).toISOString() };
  try {
    for (const actor of [visitor, signedIn]) {
      for (const table of ["purchases", "payment_attempts", "payment_events", "purchase_entitlements", "access_tokens", "access_sessions", "email_deliveries"]) {
        assert.ok((await actor.from(table).select("*")).error, `${table}: no browser read grant`);
        assert.ok((await actor.from(table).insert({})).error, `${table}: no browser write grant`);
      }
      assert.ok((await actor.rpc("create_processing_purchase", input)).error, "browser role cannot initialize a purchase");
    }
    assert.ifError((await trusted.from("admin_profiles").insert({ user_id: created.user.id })).error);
    assert.ok((await signedIn.from("purchases").select("*")).error, "active Admin still cannot read Buyer email");
    assert.ok((await signedIn.from("email_deliveries").insert({})).error, "active Admin cannot mutate delivery records");
    assert.ok((await signedIn.rpc("create_processing_purchase", input)).error, "active Admin cannot initialize a purchase");
  } finally {
    assert.ifError((await trusted.from("admin_profiles").delete().eq("user_id", created.user.id)).error);
    assert.ifError((await trusted.auth.admin.deleteUser(created.user.id)).error);
  }
});
