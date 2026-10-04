import assert from "node:assert/strict";
import { test } from "node:test";

import { initializeCheckout } from "../lib/checkout/initialize-checkout.mjs";
import { claimHash, generateAttemptKey, generateRawClaim } from "../lib/checkout/claim-cookie.mjs";

const packRow = {
  id: "00000000-0000-4000-8000-000000000901",
  slug: "demo-product-pack",
  title: "Demo Content: Product Pack",
  price_minor: 59000,
  currency: "IDR",
};

function attempt(overrides = {}) {
  return {
    public_reference: "ref-from-attempt",
    status: "CREATED",
    claim_expires_at: new Date(Date.now() + 60_000).toISOString(),
    order_id: null,
    amount_minor: packRow.price_minor,
    currency: packRow.currency,
    provider: "midtrans",
    ...overrides,
  };
}

function deps(overrides = {}) {
  return {
    pack: { ...packRow },
    findAttemptByKey: async () => null,
    createPurchase: async (input) => ({ publicReference: "ref-from-rpc", claimExpiresAt: new Date(Date.now() + 15 * 60_000).toISOString(), __input: input }),
    input: { buyerEmail: "buyer@example.com" },
    existingCookie: null,
    ...overrides,
  };
}

test("a clean submit initializes the purchase and returns presentation-safe facts", async () => {
  const result = await initializeCheckout(deps());
  assert.equal(result.kind, "ready");
  assert.equal(result.packTitle, "Demo Content: Product Pack");
  assert.equal(result.amountMinor, 59000);
  assert.equal(result.currency, "IDR");
  assert.equal(result.buyerEmail, "buyer@example.com");
  assert.match(result.claim, /^[A-Za-z0-9_-]{43}$/);
  assert.match(result.attemptKey, /^[0-9a-f-]{36}$/);
  assert.equal(result.resumed, undefined);
});

test("an unavailable pack refuses without mutations; invalid email too", async () => {
  assert.deepEqual((await initializeCheckout(deps({ pack: null }))), { kind: "unavailable" });
  assert.deepEqual((await initializeCheckout(deps({ input: { buyerEmail: "nope" } }))), { kind: "invalid-email" });
});

test("a live attempt under the same cookie pair resumes instead of duplicating", async () => {
  const attemptKey = generateAttemptKey();
  const claim = generateRawClaim();
  const result = await initializeCheckout(deps({
    existingCookie: { attemptKey, claim },
    findAttemptByKey: async (key) => (key === attemptKey ? attempt() : null),
  }));
  assert.equal(result.kind, "ready");
  assert.equal(result.attemptKey, attemptKey, "attempt key must stay stable on resume");
  assert.equal(result.claim, claim, "raw claim must stay stable on resume");
  assert.equal(result.resumed, true);
});

test("a terminal attempt rotates both the attempt key and the raw claim", async () => {
  const attemptKey = generateAttemptKey();
  const claim = generateRawClaim();
  const result = await initializeCheckout(deps({
    existingCookie: { attemptKey, claim },
    findAttemptByKey: async (key) => (key === attemptKey ? attempt({ status: "FAILED", claim_expires_at: new Date(Date.now() - 60_000).toISOString() }) : null),
  }));
  assert.equal(result.kind, "ready");
  assert.notEqual(result.attemptKey, attemptKey, "terminal attempt requires a new attempt key");
  assert.notEqual(result.claim, claim, "terminal attempt requires a fresh claim");
  assert.equal(result.resumed, undefined);
});

test("an expired claim rotates material instead of resuming", async () => {
  const attemptKey = generateAttemptKey();
  const result = await initializeCheckout(deps({
    existingCookie: { attemptKey, claim: generateRawClaim() },
    findAttemptByKey: async (key) => (key === attemptKey ? attempt({ claim_expires_at: new Date(Date.now() - 60_000).toISOString() }) : null),
  }));
  assert.equal(result.kind, "ready");
  assert.notEqual(result.attemptKey, attemptKey);
});

test("a SUCCEEDED attempt never recharges and sends the buyer to their status route", async () => {
  const attemptKey = generateAttemptKey();
  const result = await initializeCheckout(deps({
    existingCookie: { attemptKey, claim: generateRawClaim() },
    findAttemptByKey: async (key) => (key === attemptKey ? attempt({ status: "SUCCEEDED" }) : null),
  }));
  assert.deepEqual(result, { kind: "redirect-status", reference: "ref-from-attempt" });
});

test("a changed authoritative price requires explicit reconfirmation; reconfirming rotates", async () => {
  const attemptKey = generateAttemptKey();
  const base = { existingCookie: { attemptKey, claim: generateRawClaim() }, findAttemptByKey: async (key) => (key === attemptKey ? attempt({ amount_minor: 49000 }) : null) };
  assert.equal((await initializeCheckout(deps(base))).kind, "price-changed", "first submit is refused with price-changed");
  const result = await initializeCheckout(deps({ ...base, input: { buyerEmail: "buyer@example.com", reconfirmed: true } }));
  assert.equal(result.kind, "ready");
  assert.notEqual(result.attemptKey, attemptKey, "reconfirmation rotates the attempt");
});

test("checkout failures return actionable kinds, never raw database detail", async () => {
  const result = await initializeCheckout(deps({
    createPurchase: async () => { throw new Error('{"db_error_code": "42501"} user@x.com'); },
  }));
  assert.deepEqual(result, { kind: "checkout-failed" });
});
