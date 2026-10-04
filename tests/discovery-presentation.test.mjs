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
