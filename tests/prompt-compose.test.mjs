import assert from "node:assert/strict";
import { test } from "node:test";

import { composePrompt, defaultValues } from "../lib/prompts/compose.mjs";

const variables = [
  { key: "product", label: "Product", required: true, default_value: null },
  { key: "background", label: "Background", required: false, default_value: "neutral" },
];

test("defaults compose both supported placeholder styles", () => {
  const values = { ...defaultValues(variables), product: "coffee" };
  assert.deepEqual(composePrompt("{product} on {{background}}", variables, values), {
    text: "coffee on neutral", errors: {}, unresolved: [],
  });
});

test("required and unknown placeholders cannot silently reach the clipboard", () => {
  const result = composePrompt("{product} on {missing}", variables, defaultValues(variables));
  assert.deepEqual(result.errors, { product: "Product is required" });
  assert.deepEqual(result.unresolved, ["product", "missing"]);
});

test("a literal replacement value containing braces stays intact", () => {
  const values = { ...defaultValues(variables), product: "{coffee}" };
  assert.deepEqual(composePrompt("Make {product}", variables, values), {
    text: "Make {coffee}", errors: {}, unresolved: [],
  });
});

test("prompts without variables copy unchanged", () => {
  assert.deepEqual(composePrompt("A complete prompt.", [], {}), {
    text: "A complete prompt.", errors: {}, unresolved: [],
  });
});
