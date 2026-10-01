import assert from "node:assert/strict";
import { test } from "node:test";

import sharp from "sharp";

import { validatePreviewArtwork } from "../lib/artwork/validate.mjs";

const image = await sharp({ create: { width: 4, height: 3, channels: 3, background: "#fafafa" } }).png().toBuffer();
const valid = new File([image], "original.png", { type: "image/png" });

test("a real, correctly declared preview becomes sanitized WebP with measured dimensions", async () => {
  const result = await validatePreviewArtwork(valid);
  assert.equal(result.mimeType, "image/webp");
  assert.equal(result.width, 4);
  assert.equal(result.height, 3);
  assert.equal((await sharp(result.bytes).metadata()).format, "webp");
  assert.ok(result.bytes.length > 0 && result.bytes.length <= 5 * 1024 * 1024);
});

test("JPEG filenames and declared formats match decoded bytes", async () => {
  const jpeg = await sharp(image).jpeg().toBuffer();
  for (const name of ["preview.jpg", "preview.jpeg"]) {
    const result = await validatePreviewArtwork(new File([jpeg], name, { type: "image/jpeg" }));
    assert.equal(result.mimeType, "image/webp");
  }
});

test("preview validation rejects deceptive declarations and undecodable image bytes", async () => {
  for (const file of [
    new File([image], "image.svg", { type: "image/svg+xml" }),
    new File([image], "image.png", { type: "image/jpeg" }),
    new File([image], "image.jpg", { type: "image/png" }),
    new File(["<script>alert(1)</script>"], "image.png", { type: "image/png" }),
  ]) await assert.rejects(validatePreviewArtwork(file));
});

test("preview validation rejects oversized input and decoded dimensions", async () => {
  await assert.rejects(validatePreviewArtwork(new File([new Uint8Array(5 * 1024 * 1024 + 1)], "huge.png", { type: "image/png" })));
  const oversized = await sharp({ create: { width: 5001, height: 1, channels: 3, background: "#000" } }).png().toBuffer();
  await assert.rejects(validatePreviewArtwork(new File([oversized], "wide.png", { type: "image/png" })));
});
