import assert from "node:assert/strict";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import { test } from "node:test";

import { createProcessingPurchaseWithClient } from "../lib/checkout/create-processing-purchase.mjs";

const packId = "00000000-0000-4000-8000-000000000901";

test("trusted checkout initializes one attempt with a hash-only claim and authoritative terms", async () => {
  let submitted;
  const client = { rpc: async (name, input) => {
    assert.equal(name, "create_processing_purchase");
    submitted = input;
    return { data: [{ purchase_id: "purchase-id", payment_attempt_id: "attempt-id", pack_title: "Authoritative Pack", amount_minor: 59000, currency: "IDR", saved_claim_expires_at: input.claim_expires_at }], error: null };
  } };
  const attemptKey = randomUUID();
  const checkoutClaim = randomBytes(32).toString("base64url");
  const result = await createProcessingPurchaseWithClient(client, { buyerEmail: " Buyer@Example.Invalid ", packId, provider: "demo", attemptKey, checkoutClaim });
  assert.equal(submitted.buyer_email, "buyer@example.invalid");
  assert.equal(submitted.selected_pack_id, packId);
  assert.equal(submitted.payment_provider, "demo");
  assert.equal(submitted.amount_minor, undefined);
  assert.equal(submitted.currency, undefined);
  assert.equal(result.amountMinor, 59000);
  assert.equal(result.currency, "IDR");
  assert.equal(result.packTitle, "Authoritative Pack");
  assert.equal(result.purchaseId, "purchase-id");
  assert.equal(result.paymentAttemptId, "attempt-id");
  assert.equal(result.checkoutClaim, checkoutClaim);
  assert.match(result.checkoutClaim, /^[A-Za-z0-9_-]{43}$/);
  assert.match(result.publicReference, /^[A-Za-z0-9_-]{43}$/);
  assert.notEqual(result.checkoutClaim, result.publicReference);
  assert.equal(submitted.claim_hash, `\\x${createHash("sha256").update(result.checkoutClaim).digest("hex")}`);
  assert.ok(new Date(submitted.claim_expires_at) > new Date());
  assert.equal(submitted.reference, result.publicReference);
  assert.equal(submitted.attempt_key, attemptKey);
  assert.ok(new Date(result.claimExpiresAt) > new Date());
});

test("repeated initialization retains the same reference, claim and attempt key", async () => {
  const calls = [];
  const client = { rpc: async (_name, input) => {
    calls.push(input);
    return { data: [{ purchase_id: "purchase-id", payment_attempt_id: "attempt-id", pack_title: "Pack", amount_minor: 59000, currency: "IDR", saved_claim_expires_at: calls[0].claim_expires_at }], error: null };
  } };
  const input = { buyerEmail: "buyer@example.invalid", packId, provider: "demo", attemptKey: randomUUID(), checkoutClaim: randomBytes(32).toString("base64url") };
  const first = await createProcessingPurchaseWithClient(client, input);
  const second = await createProcessingPurchaseWithClient(client, input);
  assert.equal(calls.length, 2);
  assert.equal(calls[0].attempt_key, calls[1].attempt_key);
  assert.equal(calls[0].reference, calls[1].reference);
  assert.equal(calls[0].claim_hash, calls[1].claim_hash);
  assert.equal(first.purchaseId, second.purchaseId);
  assert.equal(first.paymentAttemptId, second.paymentAttemptId);
  assert.equal(first.checkoutClaim, second.checkoutClaim);
  assert.equal(first.claimExpiresAt, second.claimExpiresAt);
});

test("invalid checkout input fails before trusted access", async () => {
  const client = { rpc: () => { throw new Error("trusted access must not run"); } };
  for (const input of [
    { buyerEmail: "not-email", packId, provider: "demo", attemptKey: randomUUID() },
    { buyerEmail: "buyer@example.invalid", packId: "not-a-uuid", provider: "demo", attemptKey: randomUUID() },
    { buyerEmail: "buyer@example.invalid", packId, provider: "bad provider", attemptKey: randomUUID() },
    { buyerEmail: "buyer@example.invalid", packId, provider: "demo", attemptKey: "guessable" },
    { buyerEmail: "buyer@example.invalid", packId, provider: "demo", attemptKey: randomUUID(), checkoutClaim: "short" },
    { buyerEmail: "buyer@example.invalid", packId, provider: "demo", attemptKey: randomUUID(), checkoutClaim: randomBytes(32).toString("base64url"), currency: "USD" },
  ]) {
    await assert.rejects(createProcessingPurchaseWithClient(client, input), /Invalid checkout input/);
  }
});

test("database failures do not reveal Buyer email or claim", async () => {
  const client = { rpc: async () => ({ data: null, error: { message: "Buyer private@example.invalid: checkout claim secret" } }) };
  await assert.rejects(createProcessingPurchaseWithClient(client, { buyerEmail: "private@example.invalid", packId, provider: "demo", attemptKey: randomUUID(), checkoutClaim: randomBytes(32).toString("base64url") }), (error) => {
    assert.equal(error.message, "Checkout initialization failed");
    assert.doesNotMatch(String(error), /private@example.invalid|secret/);
    return true;
  });
});
