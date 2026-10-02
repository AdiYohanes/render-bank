import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { test } from "node:test";

import { createClient } from "@supabase/supabase-js";

const require = createRequire(import.meta.url);
const bin = require.resolve("supabase/dist/supabase.js");
const status = JSON.parse(execFileSync(process.execPath, [bin, "status", "--output", "json"], { encoding: "utf8" }));
const { API_URL: url, PUBLISHABLE_KEY: publishable, SERVICE_ROLE_KEY: serviceKey } = status;
assert.ok(url && publishable && serviceKey, "Start local Supabase before running database tests");
const trusted = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
const tables = ["categories", "models", "tags", "use_cases", "media_assets", "prompts", "prompt_contents", "prompt_variables", "prompt_images", "prompt_models", "prompt_tags", "prompt_use_cases", "packs", "pack_prompts", "prompt_slug_redirects", "pack_slug_redirects"];
const published = "00000000-0000-4000-8000-000000000601";
const draft = "00000000-0000-4000-8000-000000000602";

async function verify(role, client) {
  const { data: prompts, error: promptError } = await client.from("prompts").select("id,slug,title,status,access_type,primary_sales_pack_id");
  assert.ifError(promptError);
  assert.deepEqual(prompts.map(({ id }) => id).sort(), [published, "00000000-0000-4000-8000-000000000603", "00000000-0000-4000-8000-000000000604"].sort(), `${role}: published Free and Premium metadata`);
  const free = prompts.find(({ id }) => id === published);
  assert.equal(free.slug, "demo-studio-product");
  assert.equal(free.primary_sales_pack_id, null);
  assert.equal(prompts.find(({ id }) => id.endsWith("603")).primary_sales_pack_id, "00000000-0000-4000-8000-000000000901");

  const { data: contents, error: contentError } = await client.from("prompt_contents").select("prompt_id,prompt_template,generation_notes");
  assert.ifError(contentError);
  assert.deepEqual(contents.map(({ prompt_id }) => prompt_id), [published]);
  assert.match(contents[0].prompt_template, /\{product\}.*\{background\}/);
  assert.doesNotMatch(JSON.stringify(contents), /PRIVATE DRAFT RECIPE/);

  const { data: variables, error: variableError } = await client.from("prompt_variables").select("prompt_id,key,default_value,required").order("sort_order").order("id");
  assert.ifError(variableError);
  assert.deepEqual(variables, [
    { prompt_id: published, key: "product", default_value: null, required: true },
    { prompt_id: published, key: "background", default_value: "neutral backdrop", required: false },
  ]);

  for (const [table, expected] of Object.entries({
    categories: "product-photography", models: "demo-image-model", tags: "studio-lighting", use_cases: "product-ad",
    media_assets: "demo/free-product-preview.webp",
  })) {
    const { data, error } = await client.from(table).select("*");
    assert.ifError(error);
    const values = data.map((row) => row.slug ?? row.storage_path);
    assert.ok(values.includes(expected), `${role}: ${table} includes published metadata`);
    assert.ok(values.every((value) => !value.includes("draft-only") && !value.includes("archived")), `${role}: ${table} excludes non-public records`);
  }
  for (const table of ["prompt_images", "prompt_models", "prompt_tags", "prompt_use_cases"]) {
    const { data, error } = await client.from(table).select("*");
    assert.ifError(error);
    assert.deepEqual(data.map(({ prompt_id }) => prompt_id).sort(),
      table === "prompt_tags" || table === "prompt_use_cases" ? [published] : [published, "00000000-0000-4000-8000-000000000603", "00000000-0000-4000-8000-000000000604"].sort(),
      `${role}: ${table} exposes only published relations`);
  }
  const { data: packs, error: packError } = await client.from("packs").select("id,slug,price_minor,currency,pack_prompts(sort_order,prompt_id,prompts(id,slug,prompt_contents(prompt_template,generation_notes),prompt_variables(key,label,default_value)))");
  assert.ifError(packError);
  assert.equal(packs.length, 1);
  assert.equal(packs[0].slug, "demo-product-pack");
  assert.equal(packs[0].price_minor, 59000);
  assert.equal(packs[0].currency, "IDR");
  assert.deepEqual(packs[0].pack_prompts.sort((a, b) => a.sort_order - b.sort_order).map(({ prompt_id }) => prompt_id),
    ["00000000-0000-4000-8000-000000000603", "00000000-0000-4000-8000-000000000604"]);
  assert.ok(packs[0].pack_prompts.every(({ prompts: prompt }) => prompt.prompt_contents === null && prompt.prompt_variables.length === 0));
  assert.doesNotMatch(JSON.stringify(packs), /SECRET_PREMIUM/);
  const { data: hiddenRecipes, error: recipeError } = await client.from("prompt_contents").select("*").in("prompt_id", ["00000000-0000-4000-8000-000000000603", "00000000-0000-4000-8000-000000000604"]);
  assert.ifError(recipeError);
  assert.deepEqual(hiddenRecipes, []);
  const { data: hiddenVariables, error: hiddenVariableError } = await client.from("prompt_variables").select("*").eq("prompt_id", "00000000-0000-4000-8000-000000000603");
  assert.ifError(hiddenVariableError);
  assert.deepEqual(hiddenVariables, []);
  for (const table of ["prompt_slug_redirects", "pack_slug_redirects"]) {
    const { data, error } = await client.from(table).select("*");
    assert.ifError(error);
    assert.equal(data.length, 1, `${role}: only published canonical redirects`);
  }
  const { data: hidden, error: hiddenError } = await client.from("prompts").select("id").eq("id", draft);
  assert.ifError(hiddenError);
  assert.deepEqual(hidden, []);
  for (const [table, ids] of [
    ["prompts", ["00000000-0000-4000-8000-000000000605", "00000000-0000-4000-8000-000000000606"]],
    ["packs", ["00000000-0000-4000-8000-000000000902", "00000000-0000-4000-8000-000000000903"]],
  ]) {
    const { data, error } = await client.from(table).select("id").in("id", ids);
    assert.ifError(error);
    assert.deepEqual(data, [], `${role}: archived and unlisted ${table} stay hidden`);
  }
  const { data: publicPayload, error: payloadError } = await client.from("prompts").select("*,prompt_contents(*),prompt_variables(*),packs!prompts_primary_sales_pack_id_fkey(*)");
  assert.ifError(payloadError);
  assert.doesNotMatch(JSON.stringify({ publicPayload, payloadError }), /SECRET_PREMIUM|SECRET_ARCHIVED/);

  for (const table of tables) {
    const { error: insert } = await client.from(table).insert({});
    assert.equal(insert?.code, "42501", `${role}: ${table} insert must be denied`);
    const { data: existing } = await trusted.from(table).select("*").limit(1).single();
    const identity = Object.fromEntries(Object.entries(existing).filter(([key]) => ["id", "prompt_id", "model_id", "tag_id", "use_case_id"].includes(key)));
    const filters = (query) => Object.entries(identity).reduce((result, [key, value]) => result.eq(key, value), query);
    const { data: updated, error: update } = await filters(client.from(table).update(existing)).select();
    assert.ok(update?.code === "42501" || (role !== "anon" && !update && updated.length === 0), `${role}: ${table} update must affect no rows`);
    const { data: removed, error: remove } = await filters(client.from(table).delete()).select();
    assert.ok(remove?.code === "42501" || (role !== "anon" && !remove && removed.length === 0), `${role}: ${table} delete must affect no rows`);
  }
}

test("actual anon and non-Admin Auth policies expose published safe metadata, Free recipes, and no public writes", async () => {
  const visitor = createClient(url, publishable, { auth: { persistSession: false } });
  const email = `rls-${Date.now()}@example.invalid`;
  const password = `RlsTest-${crypto.randomUUID()}!`;
  const { data: created, error: createError } = await trusted.auth.admin.createUser({ email, password, email_confirm: true });
  assert.ifError(createError);
  try {
    const authenticated = createClient(url, publishable, { auth: { persistSession: false } });
    const { error: loginError } = await authenticated.auth.signInWithPassword({ email, password });
    assert.ifError(loginError);
    await verify("anon", visitor);
    await verify("authenticated non-Admin", authenticated);

    const path = `tests/${crypto.randomUUID()}.webp`;
    const storage = trusted.storage.from("prompt-previews");
    const { error: uploadError } = await storage.upload(path, new Blob(["test-only"], { type: "image/webp" }), { contentType: "image/webp" });
    assert.ifError(uploadError);
    try {
      for (const [role, client] of [["anon", visitor], ["authenticated", authenticated]]) {
        const bucket = client.storage.from("prompt-previews");
        const { error: put } = await bucket.upload(`tests/${crypto.randomUUID()}.webp`, new Blob(["denied"], { type: "image/webp" }), { contentType: "image/webp" });
        assert.ok(put, `${role}: upload must fail against an existing bucket`);
        const { error: overwrite } = await bucket.update(path, new Blob(["denied"], { type: "image/webp" }), { contentType: "image/webp" });
        assert.ok(overwrite, `${role}: overwrite must fail`);
        const { error: remove } = await bucket.remove([path]);
        if (remove) assert.ok(remove.message);
        // Some Storage API versions return success with zero deleted objects under RLS.
        const { data: retained, error: retainedError } = await storage.download(path);
        assert.ifError(retainedError);
        assert.equal(await retained.text(), "test-only", `${role}: deletion must leave the original bytes intact`);
      }
      const { data: object, error: readError } = await visitor.storage.from("prompt-previews").download(path);
      assert.ifError(readError);
      assert.equal(await object.text(), "test-only", "denied mutation did not alter public artwork");
    } finally {
      const { error } = await storage.remove([path]);
      assert.ifError(error);
    }
  } finally {
    const { error } = await trusted.auth.admin.deleteUser(created.user.id);
    assert.ifError(error);
  }
});
