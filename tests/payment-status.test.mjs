import assert from "node:assert/strict";
import { test } from "node:test";

import { canonicalStatusRoute, maskedEmail, resolveStatusView } from "../lib/payment/status-resolve.mjs";

test("canonical route map follows the server purchase status", () => {
  assert.equal(canonicalStatusRoute("PAID"), "success");
  assert.equal(canonicalStatusRoute("PROCESSING"), "pending");
  assert.equal(canonicalStatusRoute("FAILED"), "failed");
  assert.equal(canonicalStatusRoute("CANCELLED"), "cancelled");
  assert.equal(canonicalStatusRoute("OTHER"), null);
  assert.equal(canonicalStatusRoute(null), null);
});

test("buyer email masks to first local character only", () => {
  assert.equal(maskedEmail("buyer@example.com"), "b***@example.com");
  assert.equal(maskedEmail("a***@example.com".replace("*", "bcdef")), "a***@example.com");
  assert.equal(maskedEmail("UPPERCASE@example.com"), "U***@example.com");
  for (const bad of [null, undefined, "", "noatsign", "@example.com", "x@", "a@b"]) {
    assert.equal(maskedEmail(bad), null, String(bad));
  }
});

test("status views are redacted: pack title/slug and masked email only, never ids or claims", () => {
  const purchase = { status: "PAID", pack_title_snapshot: "Demo Content: Product Pack", buyer_email_normalized: "buyer@example.invalid", pack_slug: "demo-product-pack" };
  assert.deepEqual(resolveStatusView(purchase), {
    kind: "success", packTitle: "Demo Content: Product Pack", packSlug: "demo-product-pack", maskedEmail: "b***@example.invalid",
  });
  assert.deepEqual(resolveStatusView({ status: "PROCESSING", pack_title_snapshot: "T", buyer_email_normalized: "a@b.co", pack_slug: null }),
    { kind: "pending", packTitle: "T", packSlug: null, maskedEmail: "a***@b.co" });
  assert.deepEqual(resolveStatusView({ status: "FAILED", pack_title_snapshot: "", buyer_email_normalized: "a@b.co" }),
    { kind: "failed", packTitle: null, packSlug: null, maskedEmail: "a***@b.co" });
  assert.deepEqual(resolveStatusView({ status: "CANCELLED", pack_title_snapshot: "T", buyer_email_normalized: null }),
    { kind: "cancelled", packTitle: "T", packSlug: null, maskedEmail: null });
});

test("unknown and lost references stay unknown, never coerced", () => {
  assert.deepEqual(resolveStatusView(null), { kind: "unknown", packTitle: null, packSlug: null, maskedEmail: null });
  assert.deepEqual(resolveStatusView(undefined), { kind: "unknown", packTitle: null, packSlug: null, maskedEmail: null });
  assert.deepEqual(resolveStatusView({ status: "WEIRD", pack_title_snapshot: "T", buyer_email_normalized: "a@b.co" }),
    { kind: "unknown", packTitle: null, packSlug: null, maskedEmail: null });
});
