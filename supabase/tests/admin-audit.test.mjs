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
