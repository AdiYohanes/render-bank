import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { test } from "node:test";

import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";

const require = createRequire(import.meta.url);
const bin = require.resolve("supabase/dist/supabase.js");
const { API_URL: url, PUBLISHABLE_KEY: publishable, SERVICE_ROLE_KEY: serviceKey } = JSON.parse(
  execFileSync(process.execPath, [bin, "status", "--output", "json"], { encoding: "utf8" }),
);
const trusted = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
const { uploadPreviewArtworkWithClients } = await import("../../lib/artwork/upload.mjs");
const bytes = await sharp({ create: { width: 4, height: 3, channels: 3, background: "#fff" } }).png().toBuffer();
const file = () => new File([bytes], "preview.png", { type: "image/png" });

test("only a current active Admin uploads sanitized public artwork without publishing content", async () => {
  const email = `artwork-${crypto.randomUUID()}@example.invalid`;
  const password = `Artwork-${crypto.randomUUID()}!`;
  const { data: created, error: createError } = await trusted.auth.admin.createUser({ email, password, email_confirm: true });
  assert.ifError(createError);
  const userId = created.user.id;
  const admin = createClient(url, publishable, { auth: { persistSession: false, autoRefreshToken: false } });
  assert.ifError((await admin.auth.signInWithPassword({ email, password })).error);
  const { data: session } = await admin.auth.getSession();
  const authorization = session.session.access_token;
  const visitor = createClient(url, publishable, { auth: { persistSession: false } });
  const request = createClient(url, publishable, { auth: { persistSession: false, autoRefreshToken: false }, global: { headers: { Authorization: `Bearer ${authorization}` } } });
  const upload = (artwork) => uploadPreviewArtworkWithClients(request, trusted, artwork);
  let asset;
  try {
    await assert.rejects(upload(file()), /Admin/);
    assert.ifError((await trusted.from("admin_profiles").insert({ user_id: userId })).error);
    asset = await upload(file());
    assert.equal(asset.bucket, "prompt-previews");
    assert.equal(asset.mime_type, "image/webp");
    assert.equal(asset.width, 4);
    assert.equal(asset.height, 3);
    assert.match(asset.storage_path, /^previews\/[0-9a-f-]+\.webp$/);
    assert.equal(asset.created_by, userId);
    const { data: downloaded, error: readError } = await visitor.storage.from("prompt-previews").download(asset.storage_path);
    assert.ifError(readError);
    assert.equal((await sharp(Buffer.from(await downloaded.arrayBuffer())).metadata()).format, "webp");
    const { data: invisible, error: metadataError } = await visitor.from("media_assets").select("id").eq("id", asset.id);
    assert.ifError(metadataError);
    assert.deepEqual(invisible, [], "unassociated artwork is not public database metadata");
    const { error: directUpload } = await admin.storage.from("prompt-previews").upload(`previews/${crypto.randomUUID()}.webp`, file(), { contentType: "image/webp" });
    assert.ok(directUpload);
    assert.ifError((await trusted.from("admin_profiles").update({ is_active: false }).eq("user_id", userId)).error);
    await assert.rejects(upload(file()), /Admin/);
  } finally {
    if (asset) {
      assert.ifError((await trusted.from("media_assets").delete().eq("id", asset.id)).error);
      assert.ifError((await trusted.storage.from("prompt-previews").remove([asset.storage_path])).error);
    }
    await trusted.from("admin_profiles").delete().eq("user_id", userId);
    assert.ifError((await trusted.auth.admin.deleteUser(userId)).error);
  }
});
