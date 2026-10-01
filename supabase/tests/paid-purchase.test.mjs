import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { createRequire } from "node:module";
import { test } from "node:test";

import { createClient } from "@supabase/supabase-js";

const require = createRequire(import.meta.url);
const bin = require.resolve("supabase/dist/supabase.js");
const {
  API_URL: url,
  PUBLISHABLE_KEY: publishable,
  SERVICE_ROLE_KEY: serviceKey,
} = JSON.parse(
  execFileSync(process.execPath, [bin, "status", "--output", "json"], {
    encoding: "utf8",
  }),
);
const trusted = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const pack = "00000000-0000-4000-8000-000000000901";
const setup = `create temporary table purchase_fixture as
  select purchase_id as id, payment_attempt_id as attempt_id from public.create_processing_purchase(
    'paid-test@example.invalid', '${pack}', 'demo', repeat('r',32), repeat('k',32),
    decode(repeat('ab',32),'hex'), now() + interval '15 minutes');
  update public.payment_attempts set provider_attempt_id = 'attempt-one'
    where id in (select attempt_id from purchase_fixture);`;
const complete = (event = "event-one", hash = "cd") =>
  completeWith({ event, hash });

function completeWith({
  provider = "demo",
  event = "event-one",
  attempt = "attempt-one",
  type = "payment.succeeded",
  status = "SUCCEEDED",
  product = pack,
  amount = 59000,
  currency = "IDR",
  hash = "cd",
} = {}) {
  return `select purchase_id || '|' || newly_completed from public.complete_paid_purchase(
    '${provider}','${event}','${attempt}','${type}','${status}','${product}',${amount},'${currency}',decode(repeat('${hash}',32),'hex'));`;
}

function sql(statement) {
  return execFileSync(
    "docker",
    [
      "exec",
      "-i",
      "supabase_db_renderbank",
      "psql",
      "-X",
      "-A",
      "-t",
      "-v",
      "ON_ERROR_STOP=1",
      "-U",
      "postgres",
      "-d",
      "postgres",
    ],
    {
      input: `begin;\n${statement}\nset constraints all immediate;\nrollback;\n`,
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"],
    },
  );
}

function rejects(statement, expected) {
  assert.throws(
    () => sql(statement),
    (error) => {
      assert.match(error.stderr.toString(), expected);
      return true;
    },
  );
}

test("verified payment completes one purchase with a Prompt Pack snapshot and token hash", () => {
  const rows = sql(`${setup}
    set local role service_role;
    ${complete()}
    reset role;
    select p.payment_status || '|' || a.status || '|' || e.processing_status || '|' ||
      (select count(*) from public.purchase_entitlements where purchase_id = p.id) || '|' ||
      (select count(*) from public.access_tokens where purchase_id = p.id) || '|' ||
      encode(t.token_hash,'hex')
    from public.purchases p join public.payment_attempts a on a.purchase_id = p.id
    join public.payment_events e on e.payment_attempt_id = a.id
    join public.access_tokens t on t.purchase_id = p.id
    where p.id in (select id from purchase_fixture);`);
  assert.match(rows, /[0-9a-f-]{36}\|t/);
  assert.match(
    rows,
    new RegExp(`PAID\\|SUCCEEDED\\|PROCESSED\\|2\\|1\\|${"cd".repeat(32)}`),
  );
});

test("matching provider event replay does not change the entitlement or token", () => {
  const rows = sql(`${setup}
    ${complete()}
    ${complete("event-one", "ef")}
    select (select count(*) from public.payment_events) || '|' ||
      (select count(*) from public.purchase_entitlements) || '|' ||
      (select count(*) from public.access_tokens) || '|' ||
      (select count(*) from public.access_tokens where token_hash = decode(repeat('cd',32),'hex')) || '|' ||
      (select count(*) from public.access_tokens where token_hash = decode(repeat('ef',32),'hex'));`);
  assert.match(
    rows,
    /[0-9a-f-]{36}\|true\n[0-9a-f-]{36}\|false\n1\|2\|1\|1\|0/,
  );
});

test("mismatched verified facts and invalid state cannot complete a purchase", () => {
  for (const facts of [
    { provider: "other" },
    { attempt: "missing" },
    { product: "00000000-0000-4000-8000-000000000902" },
    { amount: 59001 },
    { currency: "USD" },
    { status: "FAILED" },
  ])
    rejects(
      `${setup} ${completeWith(facts)}`,
      /Invalid verified payment facts|Payment attempt not found|Verified payment does not match purchase/,
    );
  for (const state of ["FAILED", "CANCELLED", "EXPIRED", "SUCCEEDED"]) {
    rejects(
      `${setup} update public.payment_attempts set status = '${state}' where id in (select attempt_id from purchase_fixture); ${complete()}`,
      /Invalid payment transition/,
    );
  }
  for (const state of ["FAILED", "CANCELLED"]) {
    rejects(
      `${setup} update public.purchases set payment_status = '${state}' where id in (select id from purchase_fixture); ${complete()}`,
      /Invalid payment transition/,
    );
  }
  rejects(
    `${setup} ${complete()} ${complete("another-event")}`,
    /Invalid payment transition/,
  );
});

test("a provider event is idempotent only for matching facts and its original attempt", () => {
  for (const facts of [
    { type: "other.event" },
    { product: "00000000-0000-4000-8000-000000000902" },
    { amount: 1 },
    { currency: "USD" },
    { status: "FAILED" },
  ])
    rejects(
      `${setup} ${complete()} ${completeWith(facts)}`,
      /Conflicting payment event|Verified payment does not match purchase|Invalid verified payment facts/,
    );
  rejects(
    `${setup} ${complete()} update public.payment_attempts set provider_attempt_id = 'another-attempt'
    where id in (select attempt_id from purchase_fixture); ${completeWith({ attempt: "another-attempt" })}`,
    /Payment attempt terms are immutable/,
  );
  rejects(
    `${setup} ${complete()} create temporary table second_attempt as
    select purchase_id as id, payment_attempt_id as attempt_id from public.create_processing_purchase(
      'other@example.invalid', '${pack}', 'demo', repeat('s',32), repeat('l',32), decode(repeat('bc',32),'hex'), now() + interval '15 minutes');
    update public.payment_attempts set provider_attempt_id = 'attempt-two' where id in (select attempt_id from second_attempt);
    ${completeWith({ attempt: "attempt-two" })}`,
    /Conflicting payment event/,
  );
  rejects(
    `${setup} insert into public.payment_events(provider,provider_event_id,payment_attempt_id,event_type)
    select 'demo','event-one',attempt_id,'payment.succeeded' from purchase_fixture;
    ${complete()}`,
    /Conflicting payment event/,
  );
});

test("a late token collision rolls back event and paid state", () => {
  const rows = sql(`${setup}
    savepoint before_completion;
    insert into public.access_tokens(purchase_id,token_hash)
      select id,decode(repeat('cd',32),'hex') from purchase_fixture;
    savepoint before_call;
    do $$begin perform * from public.complete_paid_purchase('demo','event-one','attempt-one','payment.succeeded',
      'SUCCEEDED','${pack}',59000,'IDR',decode(repeat('cd',32),'hex'));
      exception when unique_violation then null; end$$;
    select payment_status || '|' || (paid_at is null) from public.purchases where id in (select id from purchase_fixture);
    select status from public.payment_attempts where id in (select attempt_id from purchase_fixture);
    select count(*) from public.payment_events;
    select count(*) from public.purchase_entitlements;`);
  assert.match(rows, /PROCESSING\|true\nCREATED\n0\n0/);
});

test("only service_role can call paid purchase completion", async () => {
  const visitor = createClient(url, publishable, {
    auth: { persistSession: false },
  });
  const args = {
    p_provider: "demo",
    p_provider_event_id: "event-one",
    p_provider_attempt_id: "attempt-one",
    p_event_type: "payment.succeeded",
    p_verified_status: "SUCCEEDED",
    p_expected_pack_id: pack,
    p_amount_minor: 59000,
    p_currency: "IDR",
    p_token_hash: `\\x${"cd".repeat(32)}`,
  };
  assert.equal(
    (await visitor.rpc("complete_paid_purchase", args)).error?.code,
    "42501",
  );
  const email = `paid-test-${randomUUID()}@example.invalid`;
  const password = `RlsTest-${randomUUID()}!`;
  const { data: created, error } = await trusted.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  assert.ifError(error);
  const signedIn = createClient(url, publishable, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  try {
    assert.ifError(
      (await signedIn.auth.signInWithPassword({ email, password })).error,
    );
    assert.equal(
      (await signedIn.rpc("complete_paid_purchase", args)).error?.code,
      "42501",
    );
    assert.ifError(
      (
        await trusted
          .from("admin_profiles")
          .insert({ user_id: created.user.id })
      ).error,
    );
    assert.equal(
      (await signedIn.rpc("complete_paid_purchase", args)).error?.code,
      "42501",
    );
  } finally {
    await trusted
      .from("admin_profiles")
      .delete()
      .eq("user_id", created.user.id);
    assert.ifError(
      (await trusted.auth.admin.deleteUser(created.user.id)).error,
    );
  }
  const role = sql(`select has_function_privilege('service_role',
    'public.complete_paid_purchase(text,text,text,text,text,uuid,bigint,text,bytea)', 'EXECUTE') || '|' ||
    has_function_privilege('anon',
    'public.complete_paid_purchase(text,text,text,text,text,uuid,bigint,text,bytea)', 'EXECUTE');`);
  assert.match(role, /true\|false/);
});

test("concurrent verified deliveries complete one purchase exactly once", async () => {
  for (const sameEvent of [true, false]) {
    const packId = randomUUID();
    const attemptId = `attempt-${randomUUID()}`;
    let purchaseId;
    let paymentAttemptId;
    try {
      const { data: draft, error: packError } = await trusted
        .from("packs")
        .insert({
          id: packId,
          slug: `race-${packId}`,
          title: "Test Pack",
          description: "Concurrent completion test",
          price_minor: 1,
          currency: "IDR",
        })
        .select("id")
        .single();
      assert.ifError(packError);
      assert.equal(draft.id, packId);
      const { data: purchase, error: purchaseError } = await trusted
        .from("purchases")
        .insert({
          public_reference: randomUUID(),
          buyer_email_normalized: "race@example.invalid",
          pack_id: packId,
          pack_title_snapshot: "Test Pack",
          amount_minor: 1,
          currency: "IDR",
        })
        .select("id")
        .single();
      assert.ifError(purchaseError);
      purchaseId = purchase.id;
      const { data: attempt, error: attemptError } = await trusted
        .from("payment_attempts")
        .insert({
          purchase_id: purchaseId,
          provider: "demo",
          provider_attempt_id: attemptId,
          idempotency_key: randomUUID(),
          checkout_claim_hash: `\\x${randomUUID().replaceAll("-", "").repeat(2)}`,
          amount_minor: 1,
          currency: "IDR",
        })
        .select("id")
        .single();
      assert.ifError(attemptError);
      paymentAttemptId = attempt.id;
      const eventId = `event-${randomUUID()}`;
      const args = {
        p_provider: "demo",
        p_provider_attempt_id: attemptId,
        p_event_type: "payment.succeeded",
        p_verified_status: "SUCCEEDED",
        p_expected_pack_id: packId,
        p_amount_minor: 1,
        p_currency: "IDR",
      };
      const results = await Promise.all([
        trusted.rpc("complete_paid_purchase", {
          ...args,
          p_provider_event_id: eventId,
          p_token_hash: `\\x${"cd".repeat(32)}`,
        }),
        trusted.rpc("complete_paid_purchase", {
          ...args,
          p_provider_event_id: sameEvent ? eventId : `other-${eventId}`,
          p_token_hash: `\\x${"ef".repeat(32)}`,
        }),
      ]);
      assert.equal(
        results.filter(({ data }) => data?.[0]?.newly_completed).length,
        1,
      );
      if (sameEvent) {
        assert.equal(
          results.filter(({ data }) => data?.[0]?.newly_completed === false)
            .length,
          1,
        );
      } else {
        assert.equal(
          results.filter(({ error }) =>
            error?.message.includes("Invalid payment transition"),
          ).length,
          1,
        );
      }
      for (const table of ["payment_events", "access_tokens"]) {
        const column =
          table === "payment_events" ? "payment_attempt_id" : "purchase_id";
        const value =
          table === "payment_events" ? paymentAttemptId : purchaseId;
        const { count, error } = await trusted
          .from(table)
          .select("id", { count: "exact", head: true })
          .eq(column, value);
        assert.ifError(error);
        assert.equal(count, 1);
      }
    } finally {
      if (paymentAttemptId)
        assert.ifError(
          (
            await trusted
              .from("payment_events")
              .delete()
              .eq("payment_attempt_id", paymentAttemptId)
          ).error,
        );
      if (purchaseId)
        assert.ifError(
          (
            await trusted
              .from("access_tokens")
              .delete()
              .eq("purchase_id", purchaseId)
          ).error,
        );
      if (paymentAttemptId)
        assert.ifError(
          (
            await trusted
              .from("payment_attempts")
              .delete()
              .eq("id", paymentAttemptId)
          ).error,
        );
      if (purchaseId)
        assert.ifError(
          (await trusted.from("purchases").delete().eq("id", purchaseId)).error,
        );
      assert.ifError(
        (await trusted.from("packs").delete().eq("id", packId)).error,
      );
    }
  }
});

test("later Prompt Pack edits cannot change an existing purchase entitlement snapshot", () => {
  const rows = sql(`${setup} ${complete()}
    update public.prompts set status = 'UNLISTED' where id = '00000000-0000-4000-8000-000000000604';
    delete from public.pack_prompts where pack_id = '${pack}' and prompt_id = '00000000-0000-4000-8000-000000000604';
    select (select count(*) from public.pack_prompts where pack_id = '${pack}') || '|' ||
      (select count(*) from public.purchase_entitlements where purchase_id in (select id from purchase_fixture));`);
  assert.match(rows, /\n1\|2\n/);
});
