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
const tables = ["categories", "models", "tags", "use_cases", "media_assets", "prompts", "prompt_contents", "prompt_variables", "prompt_images", "prompt_models", "prompt_tags", "prompt_use_cases"];
const published = "00000000-0000-4000-8000-000000000601";
const draft = "00000000-0000-4000-8000-000000000602";

async function verify(role, client) {
  const { data: prompts, error: promptError } = await client.from("prompts").select("id,slug,title,status,access_type,primary_sales_pack_id");
  assert.ifError(promptError);
  assert.deepEqual(prompts.map(({ id }) => id), [published], `${role}: only published Free metadata`);
  assert.equal(prompts[0].slug, "demo-studio-product");
  assert.equal(prompts[0].primary_sales_pack_id, null);

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
    assert.equal(data.length, 1, `${role}: ${table} must exclude draft-only records`);
    assert.equal(data[0].slug ?? data[0].storage_path, expected);
  }
  for (const table of ["prompt_images", "prompt_models", "prompt_tags", "prompt_use_cases"]) {
    const { data, error } = await client.from(table).select("*");
    assert.ifError(error);
    assert.equal(data.length, 1, `${role}: ${table} must expose only published relations`);
    assert.equal(data[0].prompt_id, published);
  }
  const { data: hidden, error: hiddenError } = await client.from("prompts").select("id").eq("id", draft);
  assert.ifError(hiddenError);
  assert.deepEqual(hidden, []);

  for (const table of tables) {
    const { error: insert } = await client.from(table).insert({});
    assert.equal(insert?.code, "42501", `${role}: ${table} insert must be denied`);
    const { data: existing } = await trusted.from(table).select("*").limit(1).single();
    const identity = Object.fromEntries(Object.entries(existing).filter(([key]) => ["id", "prompt_id", "model_id", "tag_id", "use_case_id"].includes(key)));
    const filters = (query) => Object.entries(identity).reduce((result, [key, value]) => result.eq(key, value), query);
    const { error: update } = await filters(client.from(table).update(existing)).select();
    assert.equal(update?.code, "42501", `${role}: ${table} update must be denied`);
    const { error: remove } = await filters(client.from(table).delete()).select();
    assert.equal(remove?.code, "42501", `${role}: ${table} delete must be denied`);
  }
}

test("actual anon and non-Admin Auth policies expose only published Free data and deny writes", async () => {
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

    const path = `tests/${crypto.randomUUID()}.txt`;
    const storage = trusted.storage.from("prompt-previews");
    const { error: uploadError } = await storage.upload(path, new Blob(["test-only"]), { contentType: "text/plain" });
    assert.ifError(uploadError);
    try {
      for (const [role, client] of [["anon", visitor], ["authenticated", authenticated]]) {
        const bucket = client.storage.from("prompt-previews");
        const { error: put } = await bucket.upload(`tests/${crypto.randomUUID()}.txt`, new Blob(["denied"]), { contentType: "text/plain" });
        assert.ok(put, `${role}: upload must fail against an existing bucket`);
        const { error: overwrite } = await bucket.update(path, new Blob(["denied"]), { contentType: "text/plain" });
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
