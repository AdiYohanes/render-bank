import assert from "node:assert/strict";
import { test } from "node:test";

import { parseCategory, parsePack, parsePrompt } from "../lib/admin/validation.mjs";

const form = (values) => { const data = new FormData(); for (const [key, value] of Object.entries(values)) data.set(key, value); return data; };

test("admin validation accepts a complete prompt and normalizes structured fields", () => {
  const result = parsePrompt(form({ title: "Studio Product", slug: "studio-product", shortDescription: "A tested studio recipe", description: "Long copy", promptTemplate: "Render {product}", accessType: "FREE", categoryId: "00000000-0000-4000-8000-000000000101", aspectRatio: "1:1", orientation: "SQUARE", status: "DRAFT", modelIds: "00000000-0000-4000-8000-000000000201", tagIds: "00000000-0000-4000-8000-000000000301", useCaseIds: "00000000-0000-4000-8000-000000000401", variableKey: "product", variableLabel: "Product", variableDescription: "", variablePlaceholder: "", variableDefault: "", variableRequired: "true" }));
  assert.equal(result.ok, true);
  assert.deepEqual(result.value.modelIds, ["00000000-0000-4000-8000-000000000201"]);
  assert.equal(result.value.variables[0].key, "product");
});

test("admin validation rejects unsafe slugs, invalid money, and malformed variables", () => {
  assert.equal(parsePrompt(form({ title: "X", slug: "Bad Slug", shortDescription: "X", promptTemplate: "X", accessType: "FREE", categoryId: "x", status: "DRAFT", variableKey: "Bad Key", variableLabel: "Subject", variableDescription: "", variablePlaceholder: "", variableDefault: "", variableRequired: "false" })).ok, false);
  assert.equal(parsePack(form({ title: "Pack", slug: "pack", description: "Description", priceMinor: "-2", currency: "idr", status: "DRAFT" })).ok, false);
  assert.equal(parsePack(form({ title: "Pack", slug: "pack", description: "Description", priceMinor: "59000.5", currency: "IDR", status: "DRAFT" })).ok, false);
  assert.equal(parsePack(form({ title: "Pack", slug: "pack", description: "Description", priceMinor: "59000", currency: "IDR", status: "DRAFT", coverAssetId: "not-a-uuid" })).ok, false);
});

test("category validation trims text and requires canonical slugs", () => {
  const result = parseCategory(form({ name: "  Products ", slug: "products", description: "", status: "ACTIVE", sortOrder: "2" }));
  assert.deepEqual(result, { ok: true, value: { name: "Products", slug: "products", description: null, status: "ACTIVE", sortOrder: 2 } });
});
