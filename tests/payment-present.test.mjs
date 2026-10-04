import assert from "node:assert/strict";
import { test } from "node:test";

import { formatPackPrice, packCatalog, packDetail } from "../lib/payment/present.mjs";

const cover = { storage_path: "packs/cover.webp", width: 1200, height: 900, bucket: "prompt-previews" };

test("a published pack card exposes only the safe sales fields, formatted price", () => {
  const card = packCatalog({
    slug: "demo-product-pack",
    title: "Demo Content: Product Pack",
    description: "Curated product photo prompts",
    price_minor: 59000,
    currency: "IDR",
    cover,
    prompt_count: [{ count: 2 }],
  });
  assert.deepEqual(Object.keys(card).sort(), ["cover", "description", "href", "price", "promptCount", "title"]);
  assert.match(card.price, /Rp[\s ]59\.000$/);
  assert.equal(card.promptCount, 2);
  assert.equal(card.href, "/packs/demo-product-pack");
  assert.equal(card.cover, cover);
});

test("price formatting treats IDR as zero-decimal major units", () => {
  assert.match(formatPackPrice(59000, "IDR"), /Rp[\s ]?59\.000/);
  assert.match(formatPackPrice(0, "IDR"), /Rp[\s ]?0/);
  assert.match(formatPackPrice(500, "USD"), /US\$[\s ]?5,00/);
});

test("pack inventory shapes one pack, several packs, and no packs distinctly", () => {
  const inventory = packCatalog([
    { slug: "solo", title: "Solo pack", description: "First of one", price_minor: 59000, currency: "IDR", cover, prompt_count: [{ count: 3 }] },
  ]);
  assert.deepEqual(inventory, [{ ...inventory[0], href: "/packs/solo" }]);

  const none = packCatalog([]);
  assert.deepEqual(none, []);
});

test("pack sales detail exposes the safe allowlist and derives non-locked facts", () => {
  const promptRow = {
    id: "p1",
    slug: "premium-studio",
    title: "Premium Studio",
    short_description: "Studio look",
    aspect_ratio: "1:1",
    images: [{ is_primary: true, alt_text: "A", media_assets: cover }],
    category: { name: "Product Photography" },
    models: [{ models: { name: "Nano Banana" } }],
  };
  const detail = packDetail({
    slug: "demo-product-pack",
    title: "Demo Content: Product Pack",
    description: "Curated product photo prompts",
    priceMinor: 59000,
    currency: "IDR",
    cover,
    prompts: [promptRow, promptRow],
  });
  assert.deepEqual(Object.keys(detail).sort(), ["currency", "description", "examples", "models", "previews", "price", "promptCount", "slug", "title", "useCases"]);
  assert.equal(detail.promptCount, 2);
  assert.match(detail.price, /Rp[\s ]59\.000$/u);
  assert.deepEqual(Object.keys(detail.previews[0]).sort(), ["description", "href", "title"]);
  // previews sorted by pack order, not DB order
  assert.equal(detail.previews[0].title, "Premium Studio");
  assert.deepEqual(Object.keys(detail.examples[0]).sort(), ["alt", "asset"]);
  assert.deepEqual(detail.useCases, ["Product Photography"]);
});

test("pack sales detail handles a cover-less pack and an empty membership", () => {
  const result = packDetail({ slug: "x", title: "T", description: "D", priceMinor: 1, currency: "IDR", cover: null, prompts: [] });
  assert.equal(result.promptCount, 0);
  assert.deepEqual(result.examples, []);
  assert.deepEqual(result.previews, []);
  assert.deepEqual(result.useCases, []);
  assert.deepEqual(result.models, []);
});

test("pack sales detail never carries locked recipe fields into the view model", () => {
  const promptRow = {
    id: "p-secret",
    slug: "locked-prompt",
    title: "Locked Prompt",
    short_description: "Big look",
    recipe_body: "SECRET_PREMIUM step-by-step recipe",
    protected_variables: JSON.stringify([{ name: "subject", value: "SECRET" }]),
    access_type: "PACK_ONLY",
    images: [{ is_primary: true, alt_text: "A", media_assets: cover }],
    category: { name: "Product Photography" },
    models: [{ models: { name: "Nano Banana" } }],
  };
  const serialized = JSON.stringify(packDetail({
    slug: "demo-product-pack",
    title: "Demo Content: Product Pack",
    description: "Curated product photo prompts",
    priceMinor: 59000,
    currency: "IDR",
    cover,
    prompts: [promptRow],
  }));
  assert.ok(!serialized.includes("SECRET_PREMIUM") && !serialized.includes("SECRET"), "locked recipe content must not survive projection");
  assert.ok(!serialized.includes("recipe_body") && !serialized.includes("protected_variables"), "locked field names must not survive projection");
  assert.ok(serialized.includes("Locked Prompt") && serialized.includes("Big look"), "safe preview fields survive");
});
