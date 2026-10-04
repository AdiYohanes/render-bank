import assert from "node:assert/strict";
import { test } from "node:test";

import {
  midtransConfig,
  midtransCreateCheckout,
  midtransOrderId,
  midtransSignature,
  midtransVerifyWebhook,
} from "../lib/payment/midtrans.mjs";
import { createCheckout, __setCreateCheckoutForTests } from "../lib/payment/gateway.mjs";

// Stable fake server key used ONLY as a test vector — never a real credential.
const TEST_SERVER_KEY = "SB-Mid-server-fake-test-vector-key-never-real";

function fakeEnv(overrides = {}) {
  return { MIDTRANS_SERVER_KEY: TEST_SERVER_KEY, MIDTRANS_IS_PRODUCTION: undefined, ...overrides };
}

const terms = {
  publicReference: "D38q6r9nyNvHLtbKXnJy3q2vGfPHkMqcVV7mZ4YgSUV",
  buyerEmail: "buyer@example.com",
  amountMinor: 59000,
  currency: "IDR",
  attemptKey: "6f9619ff-8b86-4d01-b42d-00cf4fc964ff",
};

function okFetch(redirectUrl = "https://app.sandbox.midtrans.com/snap/v2/vtweb/fake-token") {
  const calls = [];
  return {
    calls,
    fetchImpl: async (url, init) => {
      calls.push({ url, init });
      return new Response(JSON.stringify({ token: "fake-token", redirect_url: redirectUrl }), { status: 201 });
    },
  };
}

// Webhook fixture: the raw body must be signed exactly as received.
function webhookBody(extra = {}) {
  return JSON.stringify({
    order_id: `r-${terms.publicReference}`,
    status_code: "200",
    gross_amount: "59000.00",
    transaction_status: "settlement",
    payment_type: "credit_card",
    transaction_id: "tx-1",
    ...extra,
  });
}

function signedHeaders(body, key = TEST_SERVER_KEY) {
  const parsed = JSON.parse(body);
  const signature = midtransSignature(parsed.order_id, parsed.status_code, parsed.gross_amount, key);
  return { "x-callback-signature": signature, "content-type": "application/json" };
}

test("order id and signature formulas match the locked contract", () => {
  assert.equal(midtransOrderId(terms.publicReference), `r-${terms.publicReference}`);
  assert.ok(midtransOrderId(terms.publicReference).length <= 50);
  assert.equal(
    midtransSignature("order-1", "200", "59000", TEST_SERVER_KEY),
    // independently computed: sha512 of the literal concat "order-1" + "200" + "59000" + TEST_SERVER_KEY
    "810868b6939412feb0215f408876060305a87d0dd4947d8f191bf5288cc685793d34345004aa5a4f7d9494578671e9abc2f919338970092b558feeef0cdf68c7",
  );
});

test("sandbox resolves from unset env and production from MIDTRANS_IS_PRODUCTION; missing key fails closed", () => {
  assert.equal(midtransConfig(fakeEnv()).base, "https://app.sandbox.midtrans.com");
  assert.equal(midtransConfig(fakeEnv({ MIDTRANS_IS_PRODUCTION: "true" })).base, "https://app.midtrans.com");
  for (const broken of [undefined, "", "   ", "replace-with-server-key"]) {
    assert.throws(() => midtransConfig(fakeEnv({ MIDTRANS_SERVER_KEY: broken })), /Payment provider is unavailable/, JSON.stringify(broken ?? "undefined"));
  }
});

test("createCheckout posts authoritative terms and binds before handoff", async () => {
  const { calls, fetchImpl } = okFetch();
  const binds = [];
  const deps = { bindAttempt: async (attemptKey, provider, orderId) => binds.push({ attemptKey, provider, orderId }), fetchImpl, env: fakeEnv() };
  const result = await midtransCreateCheckout(terms, deps);

  assert.equal(calls.length, 1);
  assert.match(calls[0].url, /^https:\/\/app\.sandbox\.midtrans\.com\/snap\/v1\/transactions$/);
  const body = JSON.parse(calls[0].init.body);
  assert.deepEqual(body.transaction_details, { order_id: `r-${terms.publicReference}`, gross_amount: 59000 });
  assert.deepEqual(body.customer_details, { email: terms.buyerEmail });
  assert.equal(body.credit_card.secure, true);
  assert.equal(body.item_details, undefined, "money match stays database-enforced, not provider-payload-enforced");
  assert.match(body.callbacks.finish, /^\/payment\/success\?ref=/);
  assert.match(body.callbacks.unfinish, /^\/payment\/pending\?ref=/);
  assert.match(body.callbacks.error, /^\/payment\/failed\?ref=/);
  // authorization never leaks into the returned shape
  assert.deepEqual(Object.keys(result).sort(), ["orderId", "redirectUrl"]);
  assert.equal(result.redirectUrl.startsWith("https://"), true);
  // binding persisted with the exact order id before handoff
  assert.deepEqual(binds, [{ attemptKey: terms.attemptKey, provider: "midtrans", orderId: `r-${terms.publicReference}` }]);
});

test("provider failures never leak error bodies; requester gets actionable failures only", async () => {
  for (const [status, expected] of [
    [500, "Payment provider rejected the checkout"],
    [403, "Payment provider rejected the checkout"],
  ]) {
    const fetchImpl = async () => new Response(JSON.stringify({ error: "raw provider message with key " + TEST_SERVER_KEY }), { status });
    await assert.rejects(
      midtransCreateCheckout(terms, { bindAttempt: async () => {}, fetchImpl, env: fakeEnv() }),
      (error) => error.message === expected && !error.message.includes(TEST_SERVER_KEY),
      `status ${status}`,
    );
  }
  // network failure → generic unavailability
  const fetchImpl = async () => { throw new Error("ECONNREFUSED raw"); };
  await assert.rejects(
    midtransCreateCheckout(terms, { bindAttempt: async () => {}, fetchImpl, env: fakeEnv() }),
    (error) => error.message === "Payment provider is unavailable" && !error.message.includes("ECONNREFUSED"),
  );
  // malformed/missing redirect_url is rejected
  const badFetch = async () => new Response(JSON.stringify({ token: "t" }), { status: 201 });
  await assert.rejects(midtransCreateCheckout(terms, { bindAttempt: async () => {}, fetchImpl: badFetch, env: fakeEnv() }), /invalid checkout response/);
});

test("binding failure fails the checkout: no buyer leaves without a stored binding", async () => {
  const { fetchImpl } = okFetch();
  await assert.rejects(
    midtransCreateCheckout(terms, {
      bindAttempt: async () => { throw new Error("Provider attempt binding failed"); },
      fetchImpl,
      env: fakeEnv(),
    }),
    /Provider attempt binding failed/,
  );
});

test("the seam fails closed before any mutation when no adapter is registered", async () => {
  __setCreateCheckoutForTests(null);
  await assert.rejects(() => createCheckout(terms), /Payment provider is unavailable/);
});

test("a registered fake gateway serves the domain seam verbatim", async () => {
  const seen = [];
  __setCreateCheckoutForTests(async (input) => { seen.push(input); return { redirectUrl: "https://fake.test/pay" }; });
  const result = await createCheckout(terms);
  assert.deepEqual(result, { redirectUrl: "https://fake.test/pay" });
  assert.deepEqual(seen, [terms]);
  __setCreateCheckoutForTests(null);
});

test("a correctly signed webhook verifies and normalizes to the lifecycle allowlist", () => {
  const body = webhookBody();
  const event = midtransVerifyWebhook(body, signedHeaders(body), fakeEnv());
  // deterministic event identity = status:transaction (replay stays equal)
  assert.deepEqual(event, {
    outcome: "success",
    providerEventId: "settlement:tx-1",
    providerAttemptId: `r-${terms.publicReference}`,
    eventType: "tx-1",
  });
});

test("lifecycle mapping follows the ADR table: first verified fact wins", () => {
  for (const [status, extra, outcome] of [
    ["settlement", {}, "success"],
    ["capture", { fraud_status: "accept" }, "success"],
    ["capture", { fraud_status: "pending" }, null], // recorded only → not actionable
    ["pending", {}, null],
    ["refund", {}, null],
    ["partial_refund", {}, null],
    ["cancel", {}, "failed"],
    ["deny", {}, "failed"],
    ["expire", {}, "expired"],
    ["mystery_status", {}, null],
  ]) {
    const body = webhookBody({ transaction_status: status, ...extra });
    const event = midtransVerifyWebhook(body, signedHeaders(body), fakeEnv());
    assert.equal(event?.outcome ?? null, outcome, `${status} + ${JSON.stringify(extra)}`);
    if (event) assert.equal(event.providerAttemptId, `r-${terms.publicReference}`);
  }
});

test("tampered bodies, bad signatures, and malformed payload fail closed", () => {
  const body = webhookBody();
  // tampered body (signature stays over the original) must be rejected
  const tampered = webhookBody({ gross_amount: "999999.00" });
  const goodHeaders = signedHeaders(body);
  assert.throws(() => midtransVerifyWebhook(tampered, goodHeaders, fakeEnv()), /Invalid webhook signature/);
  // wrong key signs a signature that does not verify
  assert.throws(() => midtransVerifyWebhook(body, signedHeaders(body, "SB-Mid-server-attacker"), fakeEnv()), /Invalid webhook signature/);
  // missing signature header
  assert.throws(() => midtransVerifyWebhook(body, {}, fakeEnv()), /Malformed webhook payload/);
  // not JSON at all
  assert.throws(() => midtransVerifyWebhook("not json {", signedHeaders(body), fakeEnv()), /Malformed webhook payload/);
  // missing facts
  const partial = JSON.stringify({ order_id: `r-${terms.publicReference}`, status_code: "200" });
  assert.throws(() => midtransVerifyWebhook(partial, signedHeaders(body), fakeEnv()), /Malformed webhook payload/);
  // order id outside the merchant formula is never acted on
  const foreign = webhookBody({ order_id: "not-mine" });
  assert.throws(() => midtransVerifyWebhook(foreign, signedHeaders(foreign), fakeEnv()), /Malformed webhook payload/);
  // pretty-printed JSON verifies identically: Midtrans signs field values,
  // not raw bytes — the signature is over (order_id + status_code + gross_amount + key).
  const pretty = JSON.stringify(JSON.parse(body), null, 2);
  assert.deepEqual(midtransVerifyWebhook(pretty, signedHeaders(body), fakeEnv()),
    midtransVerifyWebhook(body, signedHeaders(body), fakeEnv()));
});

test("normalization exposes no raw payload fields beyond the allowlist", () => {
  const body = webhookBody({
    transaction_status: "cancel",
    payment_type: "credit_card",
    masked_card: "481111-1114",
    buyer_email: "victim@example.invalid",
    raw_transaction: { secret: "do-not-leak" },
  });
  const event = midtransVerifyWebhook(body, signedHeaders(body), fakeEnv());
  assert.deepEqual(Object.keys(event ?? {}).sort(), ["eventType", "outcome", "providerAttemptId", "providerEventId"]);
  assert.equal(JSON.stringify(event).includes("victim@example.invalid"), false);
  assert.equal(JSON.stringify(event).includes("481111"), false);
});
