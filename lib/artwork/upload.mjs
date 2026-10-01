import { randomUUID } from "node:crypto";

import { validatePreviewArtwork } from "./validate.mjs";

// The caller supplies a request-scoped client and a server-only trusted client.
// This function always re-verifies Auth and profile state before using the trusted client.
export async function uploadPreviewArtworkWithClients(request, trusted, file) {
  const { data: { user }, error: authError } = await request.auth.getUser();
  if (authError || !user) throw new Error("Admin authentication required");
  const { data: profile, error: profileError } = await request.from("admin_profiles")
    .select("is_active").eq("user_id", user.id).single();
  if (profileError || !profile?.is_active) throw new Error("Active Admin profile required");

  const { bytes, mimeType, width, height } = await validatePreviewArtwork(file);
  const path = `previews/${randomUUID()}.webp`;
  const storage = trusted.storage.from("prompt-previews");
  const { error: uploadError } = await storage.upload(path, bytes, { contentType: mimeType, upsert: false });
  if (uploadError) throw new Error("Preview artwork upload failed", { cause: uploadError });

  const { data: asset, error: metadataError } = await trusted.from("media_assets").insert({
    bucket: "prompt-previews", storage_path: path, mime_type: mimeType,
    byte_size: bytes.length, width, height, created_by: user.id,
  }).select().single();
  if (metadataError) {
    const { error: cleanupError } = await storage.remove([path]);
    if (cleanupError) throw new Error("Preview metadata failed and artwork cleanup failed", { cause: cleanupError });
    throw new Error("Preview artwork metadata failed", { cause: metadataError });
  }
  return asset;
}
