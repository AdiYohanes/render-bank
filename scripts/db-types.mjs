import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";

import { format } from "prettier";

const require = createRequire(import.meta.url);
const bin = require.resolve("supabase/dist/supabase.js");
const file = new URL("../lib/supabase/database.types.ts", import.meta.url);
const generated = execFileSync(process.execPath, [bin, "gen", "types", "typescript", "--local", "--schema", "public"], {
  encoding: "utf8",
  maxBuffer: 16 * 1024 * 1024,
}).replace(/\r\n/g, "\n");
const output = (await format(generated, { parser: "typescript" })).replace(/\r\n/g, "\n");

if (process.argv.includes("--check")) {
  assert.equal(readFileSync(file, "utf8").replace(/\r\n/g, "\n"), output, "Database types drifted; run npm run db:types");
} else {
  writeFileSync(file, output);
}
