// @ts-check
/**
 * @param {{ storage_path: string, bucket: string } | null | undefined} asset
 * @returns {string | null}
 */
export function artworkUrl(asset) {
  if (!asset || asset.storage_path.startsWith("demo/")) return null;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;

  return `${url}/storage/v1/object/public/${asset.bucket}/${asset.storage_path.split("/").map(encodeURIComponent).join("/")}`;
}

/**
 * @param {{ width: number, height: number } | null | undefined} asset
 * @returns {number}
 */
export function ratioOf(asset) {
  return asset && asset.width > 0 ? asset.width / asset.height : 4 / 5;
}
