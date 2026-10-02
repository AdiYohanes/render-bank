import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { test } from "node:test";

import { buildEnvironment } from "../scripts/build-environment.mjs";

test("build environment omits every casing of trusted keys and replaces public aliases", () => {
  const status = { API_URL: "http://127.0.0.1:54321", PUBLISHABLE_KEY: "public", SECRET_KEY: "local-secret", SERVICE_ROLE_KEY: "local-role" };
  const keys = ["SUPABASE_SECRET_KEY", "SUPABASE_SERVICE_ROLE_KEY", "SERVICE_ROLE_KEY", "PAYMENT_SECRET", "PAYMENT_WEBHOOK_SECRET", "EMAIL_PROVIDER_SECRET", "ACCESS_SESSION_SECRET"];
  const source = { ...process.env, next_public_supabase_url: "wrong", Next_Public_Supabase_Publishable_Key: "wrong" };
  for (const key of keys) {
    source[key] = "upper-test-secret";
    source[key.toLowerCase()] = "lower-test-secret";
  }
  const { env, secrets } = buildEnvironment(source, status);
  assert.equal(env.NEXT_PUBLIC_SUPABASE_URL, status.API_URL);
  assert.equal(env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, status.PUBLISHABLE_KEY);
  assert.equal(env.next_public_supabase_url, undefined);
  for (const key of keys) {
    assert.equal(env[key], undefined);
    assert.equal(env[key.toLowerCase()], undefined);
  }
  assert.ok(secrets.includes("upper-test-secret"));
  assert.ok(secrets.includes("lower-test-secret"));
  assert.ok(secrets.includes(status.SECRET_KEY));
  execFileSync(process.execPath, ["-e", `const assert = require('node:assert/strict'); for (const key of ${JSON.stringify(keys)}) assert.equal(process.env[key], undefined);`], { env, stdio: "pipe" });
});
