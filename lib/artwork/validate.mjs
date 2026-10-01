import sharp from "sharp";

const extensions = { "image/jpeg": [".jpg", ".jpeg"], "image/png": [".png"], "image/webp": [".webp"], "image/avif": [".avif"] };
const formats = { "image/jpeg": "jpeg", "image/png": "png", "image/webp": "webp", "image/avif": "heif" };
const maxBytes = 5 * 1024 * 1024;

export async function validatePreviewArtwork(file) {
  if (!(file instanceof File) || !extensions[file.type] || !extensions[file.type].some((extension) => file.name.toLowerCase().endsWith(extension)) || !file.size || file.size > maxBytes) {
    throw new Error("Unsupported preview artwork");
  }

  const input = Buffer.from(await file.arrayBuffer());
  const metadata = await sharp(input, { failOn: "error", limitInputPixels: 25_000_000 }).metadata();
  if (metadata.format !== formats[file.type] || (metadata.pages ?? 1) !== 1 || !metadata.width || !metadata.height || metadata.width > 5000 || metadata.height > 5000) {
    throw new Error("Invalid preview artwork dimensions or format");
  }

  // Decode and re-encode so metadata and trailing non-image bytes cannot enter the public bucket.
  const { data: bytes, info } = await sharp(input, { failOn: "error", limitInputPixels: 25_000_000 }).rotate().webp().toBuffer({ resolveWithObject: true });
  if (bytes.length > maxBytes) throw new Error("Preview artwork exceeds the upload limit");
  return { bytes, mimeType: "image/webp", width: info.width, height: info.height };
}
