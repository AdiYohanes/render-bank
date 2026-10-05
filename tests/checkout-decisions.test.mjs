import assert from "node:assert/strict";
import { test } from "node:test";

import { checkPackPurchasable, validateBuyerEmail, checkSlugFormat } from "../lib/checkout/initialize.mjs";
import { initializeCheckout } from "../lib/checkout/initialize-checkout.mjs";
import { generateAttemptKey, generateRawClaim } from "../lib/checkout/claim-cookie.mjs";

const purchasable = { slug: "demo-product-pack", title: "Demo Content: Product Pack", description: "d", priceMinor: 59000, currency: "IDR" };

test("checkout resolves the route pack server-side and refuses non-purchasable packs", () => {
  assert.deepEqual(checkPackPurchasable(purchasable), { ok: true });
  assert.deepEqual(checkPackPurchasable(null), { ok: false, reason: "unavailable" });
  assert.deepEqual(checkPackPurchasable({ ...purchasable, priceMinor: -1 }), { ok: false, reason: "unavailable" });
  assert.deepEqual(checkPackPurchasable({ ...purchasable, priceMinor: 59.5 }), { ok: false, reason: "unavailable" });
  assert.deepEqual(checkPackPurchasable({ ...purchasable, currency: "idr" }), { ok: false, reason: "unavailable" });
});

test("checkout validates the buyer email inline and safely", () => {
  assert.deepEqual(validateBuyerEmail("buyer@example.com"), { ok: true, email: "buyer@example.com" });
  assert.deepEqual(validateBuyerEmail(" Buyer@Example.com "), { ok: true, email: "buyer@example.com" });
  for (const bad of ["", undefined, null, 12, {"x":1}, "nope", "a b@c.d", "a@b", `${"e".repeat(300)}@x.d`, "a@b.c\nx"]) {
    const result = validateBuyerEmail(bad);
    assert.equal(result.ok, false, JSON.stringify(bad));
    assert.deepEqual(Object.keys(result).sort(), ["ok", "reason"], "refusal must stay presentation-safe");
    assert.doesNotMatch(JSON.stringify(result), /value|email/, "refusal must not echo rejected input");
  }
});

test("retry decisions keep one attempt stable across safe retries and rotate after terminality", async () => {
  // The decision lives in initialize-checkout.mjs (the live orchestrator);
  // these cover the seam behavior the tests previously double-kept.
  const attemptKey = generateAttemptKey();
  const claim = generateRawClaim();
  const base = {
    pack: { id: "pack-1", slug: "demo-product-pack", title: "Demo Content: Product Pack", description: "d", price_minor: 59000, currency: "IDR" },
    createPurchase: async () => ({ publicReference: "ref-2", claimExpiresAt: new Date(Date.now() + 60_000).toISOString() }),
    input: { buyerEmail: "buyer@example.com" },
    existingCookie: { attemptKey, claim },
  };
  // live attempt → resume the same attempt/key
  const resume = await initializeCheckout({
    ...base,
    findAttemptByKey: async (key) => (key === attemptKey ? { public_reference: "ref-1", status: "CREATED", claim_expires_at: new Date(Date.now() + 60_000).toISOString(), order_id: null, amount_minor: 59000, currency: "IDR", provider: "midtrans" } : null),
  });
  assert.equal(resume.kind, "ready");
  assert.equal(resume.resumed, true);
  // terminal → rotate attempt key AND claim
  const rotated = await initializeCheckout({
    ...base,
    findAttemptByKey: async (key) => (key === attemptKey ? { public_reference: "ref-1", status: "FAILED", claim_expires_at: new Date(Date.now() - 60_000).toISOString(), order_id: "r-x", amount_minor: 59000, currency: "IDR", provider: "midtrans" } : null),
  });
  assert.notEqual(rotated.kind, "checkout-failed");
  assert.notEqual(rotated.attemptKey, attemptKey, "terminal attempt rotates the attempt key");
  assert.notEqual(rotated.claim, claim, "terminal attempt rotates the raw claim");
  // succeeded → never re-charge; proceed to status route
  const redirected = await initializeCheckout({
    ...base,
    findAttemptByKey: async (key) => (key === attemptKey ? { public_reference: "ref-1", status: "SUCCEEDED", claim_expires_at: new Date(Date.now() + 60_000).toISOString(), order_id: "r-x", amount_minor: 59000, currency: "IDR", provider: "midtrans" } : null),
  });
  assert.deepEqual(redirected, { kind: "redirect-status", reference: "ref-1" });
});

test("a different email against a live attempt surfaces the refusal instead of rotating", async () => {
  // ADR-0001: a different email against an existing attempt key is refused by
  // the database; the orchestrator surfaces that refusal and never orphans the
  // live attempt by silently rotating into a fresh one.
  const attemptKey = generateAttemptKey();
  const claim = generateRawClaim();
  let createCalls = 0;
  const conflict = await initializeCheckout({
    pack: { id: "pack-1", slug: "demo-product-pack", title: "Demo Content: Product Pack", description: "d", price_minor: 59000, currency: "IDR" },
    createPurchase: async () => { createCalls += 1; throw new Error("Checkout idempotency key conflict"); },
    input: { buyerEmail: "other-buyer@example.com" },
    existingCookie: { attemptKey, claim },
    findAttemptByKey: async (key) => (key === attemptKey ? { public_reference: "ref-1", status: "CREATED", claim_expires_at: new Date(Date.now() + 60_000).toISOString(), order_id: null, amount_minor: 59000, currency: "IDR", provider: "midtrans" } : null),
  });
  assert.deepEqual(conflict, { kind: "email-conflict" });
  assert.equal(createCalls, 1, "the refused resume never falls through to a fresh create");
});

test("checkout slug is format-guarded before any query", () => {
  for (const bad of ["", "-", "a--b", "A", "demo/product", "demo%2Fproduct", "\n", 42, null, "x".repeat(101), "a b"]) {
    assert.equal(checkSlugFormat(bad), false, JSON.stringify(bad));
  }
  assert.equal(checkSlugFormat("demo-product-pack"), true);
});
