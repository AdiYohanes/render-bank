import assert from "node:assert/strict";
import { test } from "node:test";

import { assertRoot } from "../scripts/smoke.mjs";

const root = '<html lang="en"><main><h1>RenderBank</h1></main></html>';

test("accepts the RenderBank root", () => {
  assert.doesNotThrow(() => assertRoot(200, root));
});

test("rejects a failed response or starter branding", () => {
  assert.throws(() => assertRoot(500, root));
  assert.throws(() => assertRoot(200, `${root} Powered by HeroUI`));
});
