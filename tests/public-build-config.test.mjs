import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { test } from "node:test";

const config = new URL("../next.config.mjs", import.meta.url);

test("build configuration rejects trusted public credentials before compilation", () => {
  const jwt = (role) => `eyJhbGciOiJIUzI1NiJ9.${Buffer.from(JSON.stringify({ role })).toString("base64url")}.signature`;
  for (const key of ["sb_secret_do-not-expose", " sb_secret_do-not-expose", jwt("service_role")]) {
    assert.throws(() => execFileSync(process.execPath, ["--input-type=module", "-e", `await import(${JSON.stringify(config.href)})`], {
      env: { ...process.env, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: key }, stdio: "pipe",
    }), (error) => {
      assert.match(error.stderr.toString(), /NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY must not contain a trusted credential/);
      return true;
    });
  }
  assert.doesNotThrow(() => execFileSync(process.execPath, ["--input-type=module", "-e", `await import(${JSON.stringify(config.href)})`], {
    env: { ...process.env, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: jwt("anon") }, stdio: "pipe",
  }));
});
