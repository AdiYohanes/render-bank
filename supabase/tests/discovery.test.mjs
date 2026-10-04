import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { test } from "node:test";

import { createClient } from "@supabase/supabase-js";

const require = createRequire(import.meta.url);
const status = JSON.parse(execFileSync(process.execPath, [require.resolve("supabase/dist/supabase.js"), "status", "--output", "json"], { encoding: "utf8" }));
const visitor = createClient(status.API_URL, status.PUBLISHABLE_KEY, { auth: { persistSession: false } });

async function search(filters = {}) {
  const { data, error } = await visitor.rpc("search_public_prompts", filters);
  assert.ifError(error);
  return data;
}

test("Visitor searches published safe Prompt metadata without seeing protected recipes", async () => {
  const rows = await search({ search_query: "studio" });
  assert.deepEqual(rows.map((row) => row.slug), ["demo-premium-studio", "demo-studio-product"]);
  assert.doesNotMatch(JSON.stringify(rows), /SECRET_|PRIVATE DRAFT RECIPE/);
  assert.deepEqual((await search({ search_query: "SECRET_PREMIUM_RECIPE_STUDIO" })), []);
  assert.deepEqual((await search({ search_query: "Draft Product" })), []);
  assert.deepEqual((await search({ category_slug: "draft-only" })), []);
});

test("Visitor combines filters and pages with stable order", async () => {
  assert.deepEqual((await search({ category_slug: "product-photography", model_slug: "demo-image-model", orientation_filter: "SQUARE", access_filter: "FREE" })).map((row) => row.slug), ["demo-studio-product"]);
  assert.deepEqual((await search({ search_query: "Demo", page_size: 1, page_offset: 1 })).map((row) => row.slug), ["demo-premium-studio"]);
  assert.equal((await search({ search_query: "Demo", page_size: 25 })).length, 3);
});
