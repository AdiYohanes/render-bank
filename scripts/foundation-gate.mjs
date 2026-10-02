import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

import { buildEnvironment } from "./build-environment.mjs";

const npm = process.env.npm_execpath;
assert.ok(npm, "Run the gate with npm run foundation:check");
const npmRun = (args, options) => run(process.execPath, [npm, ...args], options);
const steps = [
  ["Locked install", () => npmRun(["ci"])],
  ["Typecheck", () => npmRun(["run", "typecheck"])],
  ["Non-mutating lint", () => npmRun(["run", "lint"])],
  ["Docker", () => run("docker", ["info", "--format", "{{.ServerVersion}}"], { stdio: "ignore" })],
  ["Local Supabase", () => npmRun(["run", "db:start"], { stdio: "ignore" })],
  ["Local configuration", () => {
    const status = JSON.parse(execFileSync(process.execPath, [join("node_modules", "supabase", "dist", "supabase.js"), "status", "--output", "json"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }));
    assert.match(status.API_URL, /^http:\/\/(127\.0\.0\.1|localhost):\d+$/);
    for (const key of ["PUBLISHABLE_KEY", "SECRET_KEY", "SERVICE_ROLE_KEY"]) {
      assert.ok(status[key] && !status[key].startsWith("replace-with-"), `${key} missing from local Supabase status`);
    }
    assert.notEqual(status.PUBLISHABLE_KEY, status.SECRET_KEY);
    return status;
  }],
  ["Reset migrations and seed", () => npmRun(["run", "db:reset"])],
  ["Real-role database and RPC tests", () => npmRun(["run", "db:test"])],
  ["Generated database type drift", () => npmRun(["run", "db:types:check"])],
  ["Application tests", () => npmRun(["test"])],
];

function run(command, args, options = {}) {
  execFileSync(command, args, { stdio: "inherit", ...options });
}

function assertNoPublicSecrets(directory, secrets) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) assertNoPublicSecrets(path, secrets);
    else if (entry.isFile()) {
      const content = readFileSync(path);
      for (const secret of secrets) {
        assert.ok(!content.includes(Buffer.from(secret)), `Trusted key found in public build output: ${path}`);
      }
    }
  }
}

let stage = "Prerequisites";
try {
  assert.ok(Number(process.versions.node.split(".")[0]) >= 22, "Node.js 22+ is required");
  assert.ok(![".env", ".env.local", ".env.production", ".env.production.local"].some(existsSync), "Remove local environment overrides before the clean-checkout gate");
  const initialTree = execFileSync("git", ["status", "--porcelain"], { encoding: "utf8" });
  const initialDiff = execFileSync("git", ["diff", "--binary", "HEAD"], { encoding: "utf8" });
  let status;
  for (const [name, check] of steps) {
    stage = name;
    console.log(`\n[foundation] ${stage}`);
    const result = check();
    if (name === "Local configuration") status = result;
  }

  const { env, secrets } = buildEnvironment(process.env, status);
  stage = "Production build without trusted keys";
  console.log(`\n[foundation] ${stage}`);
  npmRun(["run", "build"], { env });

  stage = "Public output secret check";
  console.log(`\n[foundation] ${stage}`);
  assertNoPublicSecrets(join(".next", "static"), secrets);
  assertNoPublicSecrets(join(".next", "server", "app"), secrets);

  stage = "Production root smoke";
  console.log(`\n[foundation] ${stage}`);
  npmRun(["run", "smoke"], { env });
  stage = "Working-tree status stability";
  console.log(`\n[foundation] ${stage}`);
  assert.equal(execFileSync("git", ["status", "--porcelain"], { encoding: "utf8" }), initialTree, "Gate changed the working-tree file list");
  assert.equal(execFileSync("git", ["diff", "--binary", "HEAD"], { encoding: "utf8" }), initialDiff, "Gate changed tracked file contents");
  console.log("\n[foundation] All checks passed.");
} catch (error) {
  console.error(`\n[foundation] ${stage} failed. Check prerequisites or the preceding command output; no keys are printed.`);
  if (error.code === "ENOENT" || stage === "Docker") console.error("Install and start Docker Desktop with its Linux engine, then retry.");
  if (stage === "Local Supabase") console.error("Run npm run db:start separately for Supabase diagnostics; its output includes local keys, so do not share it.");
  process.exitCode = 1;
}
