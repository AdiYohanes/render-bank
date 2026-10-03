import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { test } from "node:test";

import { createClient } from "@supabase/supabase-js";

const require = createRequire(import.meta.url);
const bin = require.resolve("supabase/dist/supabase.js");
const { API_URL: url, PUBLISHABLE_KEY: publishable, SERVICE_ROLE_KEY: serviceKey } = JSON.parse(
  execFileSync(process.execPath, [bin, "status", "--output", "json"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }),
);
const trusted = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

test("audit history is trusted-only, append-only, and retains its actor", async () => {
  const visitor = createClient(url, publishable, { auth: { persistSession: false, autoRefreshToken: false } });
  const email = `audit-${crypto.randomUUID()}@example.invalid`;
  const password = `Audit-${crypto.randomUUID()}!`;
  const { data: created, error: createError } = await trusted.auth.admin.createUser({ email, password, email_confirm: true });
  assert.ifError(createError);
  const admin = createClient(url, publishable, { auth: { persistSession: false, autoRefreshToken: false } });
  assert.ifError((await admin.auth.signInWithPassword({ email, password })).error);
  assert.ifError((await trusted.from("admin_profiles").insert({ user_id: created.user.id })).error);
  const promptId = "00000000-0000-4000-8000-000000000602";
  const packId = "00000000-0000-4000-8000-000000000903";
  assert.ifError((await admin.from("prompts").update({ status: "UNPUBLISHED" }).eq("id", promptId)).error);
  assert.ifError((await admin.from("packs").update({ status: "ARCHIVED" }).eq("id", packId)).error);
  const { data: transitions, error: transitionError } = await trusted.from("admin_audit_logs")
    .select("actor_user_id,action,entity_type,entity_id,metadata").eq("actor_user_id", created.user.id);
  assert.ifError(transitionError);
  assert.deepEqual(transitions.map(({ action }) => action).sort(), ["PACK_ARCHIVED", "PROMPT_UNPUBLISHED"]);
  for (const transition of transitions) assert.equal(transition.actor_user_id, created.user.id);
  assert.deepEqual(transitions.find(({ entity_type }) => entity_type === "PROMPT")?.metadata,
    { previous_status: "DRAFT", status: "UNPUBLISHED" });
  assert.deepEqual(transitions.find(({ entity_type }) => entity_type === "PACK")?.metadata,
    { previous_status: "UNLISTED", status: "ARCHIVED" });
  assert.ifError((await trusted.from("admin_profiles").update({ is_active: false }).eq("user_id", created.user.id)).error);
  const { data: rejected, error: rejectedError } = await admin.from("prompts")
    .update({ status: "ARCHIVED" }).eq("id", promptId).select("id");
  assert.ok(rejectedError || rejected?.length === 0, "inactive Admin must not change Prompt status");
  assert.equal((await trusted.from("admin_audit_logs").select("id").eq("actor_user_id", created.user.id)).data.length, 2);
  assert.ifError((await trusted.from("prompts").update({ status: "DRAFT" }).eq("id", promptId)).error);
  assert.ifError((await trusted.from("packs").update({ status: "UNLISTED" }).eq("id", packId)).error);
  for (const actor of [visitor, admin]) {
    const { data, error } = await actor.from("admin_audit_logs").select("id");
    assert.ok(error || data?.length === 0, "browser roles cannot read audit rows");
    assert.ok((await actor.from("admin_audit_logs").insert({ actor_user_id: created.user.id, action: "TEST", entity_type: "PROMPT" })).error);
  }
  const { data: row, error: insertError } = await trusted.from("admin_audit_logs")
    .insert({ actor_user_id: created.user.id, action: "PROMPT_PUBLISHED", entity_type: "PROMPT", metadata: { source: "test" } })
    .select().single();
  assert.ifError(insertError);
  assert.equal(row.actor_user_id, created.user.id);
  assert.deepEqual(row.metadata, { source: "test" });
  for (const actor of [visitor, admin]) {
    const { data, error } = await actor.from("admin_audit_logs").select("id").eq("id", row.id);
    assert.ok(error || data?.length === 0, "browser roles cannot read persisted audit history");
  }
  assert.ok((await trusted.from("admin_audit_logs").update({ action: "REWRITTEN" }).eq("id", row.id)).error);
  assert.ok((await trusted.from("admin_audit_logs").delete().eq("id", row.id)).error);
  assert.ok((await trusted.auth.admin.deleteUser(created.user.id)).error, "audit actor cannot be hard-deleted");
});
