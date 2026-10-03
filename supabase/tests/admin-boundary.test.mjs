import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { test } from "node:test";

import { createClient } from "@supabase/supabase-js";

const require = createRequire(import.meta.url);
const bin = require.resolve("supabase/dist/supabase.js");
const { API_URL: url, PUBLISHABLE_KEY: publishable, SERVICE_ROLE_KEY: serviceKey } = JSON.parse(
  execFileSync(process.execPath, [bin, "status", "--output", "json"], { encoding: "utf8" }),
);
const trusted = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
const contentTables = ["categories", "models", "tags", "use_cases", "prompts", "prompt_contents", "prompt_variables", "prompt_images", "prompt_models", "prompt_tags", "prompt_use_cases", "packs", "pack_prompts"];

async function signedInUser() {
  const email = `admin-test-${crypto.randomUUID()}@example.invalid`;
  const password = `RlsTest-${crypto.randomUUID()}!`;
  const { data: created, error: createError } = await trusted.auth.admin.createUser({ email, password, email_confirm: true });
  assert.ifError(createError);
  const client = createClient(url, publishable, { auth: { persistSession: false, autoRefreshToken: false } });
  const { error } = await client.auth.signInWithPassword({ email, password });
  assert.ifError(error);
  return { id: created.user.id, client };
}

test("only an active, manually profiled Admin can edit content; no browser identity can upload artwork", async () => {
  const visitor = createClient(url, publishable, { auth: { persistSession: false } });
  const { id, client } = await signedInUser();
  const slug = `admin-test-${crypto.randomUUID()}`;
  const { data: before, error: beforeError } = await client.from("prompt_contents").select("prompt_template").eq("prompt_id", "00000000-0000-4000-8000-000000000603");
  assert.ifError(beforeError);
  assert.deepEqual(before, []);
  try {
    const { error: signupError } = await visitor.auth.signUp({ email: `public-${crypto.randomUUID()}@example.invalid`, password: "NeverPublic123!" });
    assert.ok(signupError, "public signup must be disabled");
    for (const actor of [visitor, client]) {
      const { error } = await actor.from("tags").insert({ slug, name: "No rights" });
      assert.ok(error, "unprofiled and anonymous users cannot mutate taxonomy");
    }
    const { error: provisionError } = await trusted.from("admin_profiles").insert({ user_id: id });
    assert.ifError(provisionError);
    const { data: privateContent, error: privateError } = await client.from("prompt_contents").select("prompt_template").eq("prompt_id", "00000000-0000-4000-8000-000000000603");
    assert.ifError(privateError);
    assert.equal(privateContent.length, 1, "active Admin can inspect Premium recipe");
    const { data: tag, error: tagError } = await client.from("tags").insert({ slug, name: "Admin only" }).select().single();
    assert.ifError(tagError);
    assert.equal(tag.slug, slug);
    const { data: renamed, error: renameError } = await client.from("tags").update({ name: "Renamed by Admin" }).eq("id", tag.id).select("name").single();
    assert.ifError(renameError);
    assert.equal(renamed.name, "Renamed by Admin");
    const { data: draft, error: draftError } = await client.from("prompts").select("id,status").eq("id", "00000000-0000-4000-8000-000000000602").single();
    assert.ifError(draftError);
    assert.equal(draft.status, "DRAFT");
    const { error: profileWrite } = await client.from("admin_profiles").update({ is_active: false }).eq("user_id", id);
    assert.ok(profileWrite, "Admin cannot activate or edit their own profile");
    const { error: assetWrite } = await client.from("media_assets").insert({ bucket: "prompt-previews", storage_path: `${slug}.webp`, mime_type: "image/webp", byte_size: 4, width: 1, height: 1 });
    assert.ok(assetWrite, "Admin cannot bypass validated asset creation");
    const { error: directUpload } = await client.storage.from("prompt-previews").upload(`${slug}.webp`, new Blob(["not an image"]), { contentType: "image/webp" });
    assert.ok(directUpload, "Admin JWT must not write Storage objects directly");
    const { error: deactivateError } = await trusted.from("admin_profiles").update({ is_active: false }).eq("user_id", id);
    assert.ifError(deactivateError);
    const { error: inactiveInsert } = await client.from("tags").insert({ slug: `${slug}-inactive`, name: "Inactive" });
    assert.ok(inactiveInsert, "inactive profile cannot mutate taxonomy");
    const { data: hidden, error: hiddenError } = await client.from("prompt_contents").select("prompt_template").eq("prompt_id", "00000000-0000-4000-8000-000000000603");
    assert.ifError(hiddenError);
    assert.deepEqual(hidden, [], "inactive Admin loses protected reads immediately");
    const { error: removeProfileError } = await trusted.from("admin_profiles").delete().eq("user_id", id);
    assert.ifError(removeProfileError);
    const { error: unprofiledInsert } = await client.from("tags").insert({ slug: `${slug}-unprofiled`, name: "Unprofiled" });
    assert.ok(unprofiledInsert, "an Auth identity alone never receives Admin mutations");
  } finally {
    await trusted.from("tags").delete().eq("slug", slug);
    await trusted.from("admin_profiles").delete().eq("user_id", id);
    const { error } = await trusted.auth.admin.deleteUser(id);
    assert.ifError(error);
  }
});

test("active Admin can edit valid Prompt, Pack, and membership rows", async () => {
  const { id, client } = await signedInUser();
  const promptId = "00000000-0000-4000-8000-000000000602";
  const packId = "00000000-0000-4000-8000-000000000903";
  const premiumId = "00000000-0000-4000-8000-000000000603";
  try {
    assert.ifError((await trusted.from("admin_profiles").insert({ user_id: id })).error);
    const { data: prompt, error: promptError } = await client.from("prompts")
      .update({ title: "Admin-edited draft" }).eq("id", promptId).select("title").single();
    assert.ifError(promptError);
    assert.equal(prompt.title, "Admin-edited draft");
    const { data: pack, error: packError } = await client.from("packs")
      .update({ title: "Admin-edited unlisted pack" }).eq("id", packId).select("title").single();
    assert.ifError(packError);
    assert.equal(pack.title, "Admin-edited unlisted pack");
    const { data: membership, error: memberError } = await client.from("pack_prompts")
      .update({ sort_order: 12 }).eq("pack_id", "00000000-0000-4000-8000-000000000901")
      .eq("prompt_id", premiumId).select("sort_order").single();
    assert.ifError(memberError);
    assert.equal(membership.sort_order, 12);
  } finally {
    assert.ifError((await trusted.from("prompts").update({ title: "Demo Content: Draft Product" }).eq("id", promptId)).error);
    assert.ifError((await trusted.from("packs").update({ title: "Demo Content: Unlisted Pack" }).eq("id", packId)).error);
    assert.ifError((await trusted.from("pack_prompts").update({ sort_order: 10 })
      .eq("pack_id", "00000000-0000-4000-8000-000000000901").eq("prompt_id", premiumId)).error);
    assert.ifError((await trusted.from("admin_profiles").delete().eq("user_id", id)).error);
    assert.ifError((await trusted.auth.admin.deleteUser(id)).error);
  }
});

test("active Admin has the approved content grants, but not asset or profile mutations", async () => {
  const { id, client } = await signedInUser();
  try {
    assert.ifError((await trusted.from("admin_profiles").insert({ user_id: id })).error);
    for (const table of contentTables) {
      const { error: readError } = await client.from(table).select("*").limit(1);
      assert.ifError(readError);
      const { error: insertError } = await client.from(table).insert({});
      assert.notEqual(insertError?.code, "42501", `${table}: Admin has INSERT grant (constraints may reject the empty row)`);
    }
    for (const table of ["admin_profiles", "media_assets", "prompt_slug_redirects", "pack_slug_redirects"]) {
      const { error } = await client.from(table).insert({});
      assert.equal(error?.code, "42501", `${table}: no direct INSERT grant`);
    }
  } finally {
    await trusted.from("admin_profiles").delete().eq("user_id", id);
    assert.ifError((await trusted.auth.admin.deleteUser(id)).error);
  }
});
