import assert from "node:assert/strict";
import { test } from "node:test";

import { checkPackPurchasable, validateBuyerEmail, retryDecision, checkSlugFormat } from "../lib/checkout/initialize.mjs";

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

test("retry decisions keep one attempt stable across safe retries and rotate after terminality", () => {
  // fresh, unbound attempt → resume the same attempt/key
  assert.deepEqual(retryDecision({ status: "CREATED", claim_expires_at: new Date(Date.now() + 60_000).toISOString(), order_id: null }, false), { kind: "resume" });
  assert.deepEqual(retryDecision({ status: "PROCESSING", claim_expires_at: new Date(Date.now() + 60_000).toISOString(), order_id: "r-x" }, true), { kind: "resume" });
  // provider already knows the order (including settled) → resume (status route later decides)
  assert.deepEqual(retryDecision({ status: "PROCESSING", claim_expires_at: new Date(Date.now() - 60_000).toISOString(), order_id: "r-x" }, true), { kind: "resume" });
  assert.deepEqual(retryDecision({ status: "CREATED", claim_expires_at: new Date(Date.now() + 60_000).toISOString(), order_id: null }, true), { kind: "resume" });
  // succeeded → never re-charge; proceed to status route
  assert.deepEqual(retryDecision({ status: "SUCCEEDED", claim_expires_at: new Date(Date.now() + 60_000).toISOString(), order_id: "r-x" }, true), { kind: "redirect-status" });
  // terminal → rotate attempt key AND claim
  for (const status of ["FAILED", "CANCELLED", "EXPIRED"]) {
    assert.deepEqual(retryDecision({ status, claim_expires_at: new Date(Date.now() - 60_000).toISOString(), order_id: "r-x" }, true), { kind: "rotate" });
  }
  // no existing attempt → plain proceed
  assert.deepEqual(retryDecision(undefined, false), { kind: "none" });
});

test("checkout slug is format-guarded before any query", () => {
  for (const bad of ["", "-", "a--b", "A", "demo/product", "demo%2Fproduct", "\n", 42, null, "x".repeat(101), "a b"]) {
    assert.equal(checkSlugFormat(bad), false, JSON.stringify(bad));
  }
  assert.equal(checkSlugFormat("demo-product-pack"), true);
});
