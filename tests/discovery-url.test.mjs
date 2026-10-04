import assert from "node:assert/strict";
import { test } from "node:test";

import { discoveryState, discoveryHref } from "../lib/discovery/url.mjs";

test("Visitor's search and filters survive a shared URL with bounded paging", () => {
  const state = discoveryState({ q: "  studio  ", category: "product-photography", access: "free", page: "99999", orientation: "invalid" });
  assert.deepEqual(state, { q: "studio", category: "product-photography", model: "", orientation: "", access: "free", page: 83 });
  assert.equal(discoveryHref(state, { model: "demo-image-model", page: 1 }), "/explore?q=studio&category=product-photography&model=demo-image-model&access=free");
  assert.equal(discoveryHref(state, { q: "", page: 1 }), "/explore?category=product-photography&access=free");
});

test("discoveryHref omits unchanged keys and resets page on filter chip removal", () => {
  const state = discoveryState({ q: "studio", category: "product-photography", model: "demo-image-model", orientation: "portrait", access: "free", page: "3" });
  // Removing one filter keeps the others and resets paging.
  assert.equal(discoveryHref(state, { model: "", page: 1 }), "/explore?q=studio&category=product-photography&orientation=portrait&access=free");
  // Clear filters only (q preserved).
  assert.equal(discoveryHref(state, { category: "", model: "", orientation: "", access: "", page: 1 }), "/explore?q=studio");
  // Clear search only (filters preserved).
  assert.equal(discoveryHref(state, { q: "", page: 1 }), "/explore?category=product-photography&model=demo-image-model&orientation=portrait&access=free");
});
