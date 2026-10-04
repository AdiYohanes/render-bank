import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");

test("premium detail cannot load protected content before the free access check", () => {
  const source = read("../lib/prompts/public.ts");
  const locked = source.indexOf('if (prompt.access_type !== "FREE") return');
  const content = source.indexOf('client.from("prompt_contents")');
  const variables = source.indexOf('client.from("prompt_variables")');
  assert.ok(locked >= 0 && locked < content && locked < variables);
  assert.ok(!source.slice(0, locked).includes('prompt_template'));
});

test("Premium copy is not assembled in the server route", () => {
  const page = read("../app/(public)/prompts/[slug]/page.tsx");
  assert.ok(page.indexOf('prompt.state === "free"') < page.indexOf("<PromptActions"));
  assert.match(page, /prompt\.state === "locked"/);
  assert.doesNotMatch(page, /SECRET_PREMIUM/);
});
