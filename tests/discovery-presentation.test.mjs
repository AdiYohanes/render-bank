import assert from "node:assert/strict";
import { test } from "node:test";

import { discoveryHref, discoveryState, discoveryWindow } from "../lib/discovery/url.mjs";

test("local previews bypass the server image optimizer without admitting private IP fetches", async () => {
  const previous = process.env.NEXT_PUBLIC_SUPABASE_URL;
  try {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "http://127.0.0.1:54321";
    const { default: local } = await import("../next.config.mjs?local");
    assert.notEqual(local.images.dangerouslyAllowLocalIP, true);
    assert.equal(local.images.remotePatterns[0].hostname, "127.0.0.1");
    assert.equal(local.images.unoptimized, true);
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://sample.supabase.co";
    const { default: remote } = await import("../next.config.mjs?remote");
    assert.notEqual(remote.images.dangerouslyAllowLocalIP, true);
    assert.equal(remote.images.unoptimized, false);
  } finally {
    if (previous === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    else process.env.NEXT_PUBLIC_SUPABASE_URL = previous;
  }
});

test("pagination keeps filters while adding results", () => {
  const state = discoveryState({ q: "studio", page: "2" });
  assert.equal(discoveryHref(state, { page: state.page + 1 }), "/explore?q=studio&page=3");
  assert.deepEqual(discoveryWindow(state.page), { size: 25, offset: 0 });
  assert.deepEqual(discoveryWindow(83), { size: 997, offset: 0 });
  assert.equal(discoveryState({ page: "84" }).page, 83);
});

test("artwork helpers resolve demo assets to null and keep stored geometry fallback", async () => {
  const { artworkUrl } = await import("../lib/discovery/shared.mjs");
  assert.equal(artworkUrl(null), null);
  assert.equal(artworkUrl({ storage_path: "demo/preview.webp", bucket: "prompt-previews" }), null);
  const previous = process.env.NEXT_PUBLIC_SUPABASE_URL;
  try {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://sample.supabase.co";
    assert.equal(
      artworkUrl({ storage_path: "uploads/one two.webp", bucket: "prompt-previews" }),
      "https://sample.supabase.co/storage/v1/object/public/prompt-previews/uploads/one%20two.webp",
    );
  } finally {
    if (previous === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    else process.env.NEXT_PUBLIC_SUPABASE_URL = previous;
  }
});

test("ratio falls back to 4:5 when stored dimensions are unusable", async () => {
  const { ratioOf } = await import("../lib/discovery/shared.mjs");
  assert.equal(ratioOf(null), 0.8);
  assert.equal(ratioOf({ width: 0, height: 100 }), 0.8);
  assert.equal(ratioOf({ width: 1200, height: 900 }), 1200 / 900);
});
