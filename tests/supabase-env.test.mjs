import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import ts from "typescript";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const source = read("lib/supabase/public-env.ts");
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } });
const { publicSupabaseEnv } = await import(`data:text/javascript,${encodeURIComponent(outputText)}`);

test("public configuration accepts URL and publishable key without a server secret", () => {
  assert.deepEqual(publicSupabaseEnv({
    NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321",
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_example",
  }), { url: "http://127.0.0.1:54321", key: "sb_publishable_example" });
});

test("public configuration rejects missing and malformed values", () => {
  assert.throws(() => publicSupabaseEnv({}), /NEXT_PUBLIC_SUPABASE_URL/);
  assert.throws(() => publicSupabaseEnv({ NEXT_PUBLIC_SUPABASE_URL: "file:///secret" }), /NEXT_PUBLIC_SUPABASE_URL/);
  assert.throws(() => publicSupabaseEnv({ NEXT_PUBLIC_SUPABASE_URL: "https://example.test" }), /NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY/);
  assert.throws(() => publicSupabaseEnv({ NEXT_PUBLIC_SUPABASE_URL: "https://example.test", NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_secret_do-not-expose" }), /NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY/);
});

test("browser dependency graph has no trusted credential or server imports", () => {
  const browser = read("lib/supabase/browser.ts");
  const shared = read("lib/supabase/public-env.ts");
  const trusted = read("lib/supabase/service.ts");
  assert.doesNotMatch(browser + shared, /SUPABASE_SECRET_KEY|\.\/service|\.\/server/);
  assert.match(trusted, /^import "server-only";/);
  assert.match(trusted, /SUPABASE_SECRET_KEY/);
});
