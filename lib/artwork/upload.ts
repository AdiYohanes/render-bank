import "server-only";

import type { Database } from "../supabase/database.types";

import { createRequestSupabaseClient } from "../supabase/server";
import { createTrustedSupabaseClient } from "../supabase/service";

import { uploadPreviewArtworkWithClients } from "./upload.mjs";

type MediaAsset = Database["public"]["Tables"]["media_assets"]["Row"];

export async function uploadPreviewArtwork(file: File): Promise<MediaAsset> {
  const request = await createRequestSupabaseClient();

  return uploadPreviewArtworkWithClients(
    request,
    createTrustedSupabaseClient(),
    file,
  );
}
