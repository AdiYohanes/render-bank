import assert from "node:assert/strict";
import { test } from "node:test";

import { CHECKOUT_COOKIE, checkoutCookieOptions, claimHash, generateAttemptKey, generateRawClaim, parseCheckoutCookie } from "../lib/checkout/claim-cookie.mjs";

test("generated checkout claims satisfy the create_processing_purchase format", () => {
  const claim = generateRawClaim();
  assert.match(claim, /^[A-Za-z0-9_-]{43}$/);
  const key = generateAttemptKey();
  assert.match(key, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  // entropy sanity: two rounds differ
  assert.notEqual(claim, generateRawClaim());
  assert.notEqual(key, generateAttemptKey());
});

test("parsing a checkout cookie round-trips the attempt key and raw claim, rejects tampering", () => {
  const attemptKey = generateAttemptKey();
  const claim = generateRawClaim();
  const parsed = parseCheckoutCookie(`${attemptKey}.${claim}`);
  assert.deepEqual(parsed, { attemptKey, claim });

  for (const broken of [
    "", "x", // too short
    `${attemptKey.replace("4", "5")}.${claim}`, // not a v4 uuid
    `${attemptKey}${claim}`, // missing separator
    `${attemptKey}.${claim.slice(0, 42)}`, // claim too short
    `${attemptKey}.${claim}+`, // non-base64url char
    `${attemptKey.toUpperCase()}.${claim}`, // uuid case
    null, undefined, 42, ["a"],
  ]) {
    assert.equal(parseCheckoutCookie(broken), null, JSON.stringify(broken));
  }
  // a claim built from random bytes that also round-trips: not base64 alphabet padding accepted
  assert.equal(parseCheckoutCookie(`${attemptKey}.${generateRawClaim().slice(0, 42)}`), null);
});

test("claim hashes are hex digests with the bytea prefix, never the raw claim", () => {
  const hash = claimHash(generateRawClaim());
  assert.match(hash, /^\\x[0-9a-f]{64}$/);
  assert.equal(claimHash("a").length, "\\x".length + 64, "hash length is constant");
});

test("checkout cookie attributes match the contract", () => {
  const prod = checkoutCookieOptions(true);
  assert.deepEqual(prod, { httpOnly: true, sameSite: "lax", secure: true, path: "/", maxAge: 900 });
  assert.equal(checkoutCookieOptions(false).secure, false);
  assert.equal(CHECKOUT_COOKIE.length > 0, true);
});
