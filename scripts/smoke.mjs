import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createServer } from "node:net";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";

const require = createRequire(import.meta.url);
const starterCopy = /HeroUI|ACME|Make beautiful|Powered by|Sponsor|heroui\.com|next-app-template/i;

export function assertRoot(status, html) {
  assert.equal(status, 200, "root must respond with HTTP 200");
  assert.match(html, /<html[^>]+lang="en"/);
  assert.match(html, /Don(?:'|&#x27;|&#39;)t prompt from scratch\./);
  assert.match(html, /Explore Prompts/);
  assert.doesNotMatch(html, starterCopy);
}

async function availablePort() {
  const server = createServer();

  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address();
      server.close((error) => error ? reject(error) : resolve(port));
    });
  });
}

async function smoke() {
  const port = await availablePort();
  const base = `http://127.0.0.1:${port}`;
  const child = spawn(process.execPath, [require.resolve("next/dist/bin/next"), "start", "--hostname", "127.0.0.1", "--port", String(port)], {
    stdio: ["ignore", "pipe", "pipe"],
  });
  let output = "";
  let startupError;
  const exited = new Promise((resolve) => child.once("exit", resolve));

  child.on("error", (error) => { startupError = error; });
  for (const stream of [child.stdout, child.stderr]) {
    stream.setEncoding("utf8");
    stream.on("data", (chunk) => { output += chunk; });
  }

  try {
    const deadline = Date.now() + 20_000;
    let response;

    while (Date.now() < deadline && child.exitCode === null && !startupError) {
      try {
        response = await fetch(base, { signal: AbortSignal.timeout(1000) });
        break;
      } catch {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    if (!response) throw new Error(`Production server did not start. Run npm run build first.\n${startupError ?? output}`);
    assertRoot(response.status, await response.text());

    for (const route of ["/explore", "/about", "/packs", "/terms", "/privacy"]) {
      const result = await fetch(`${base}${route}`, { signal: AbortSignal.timeout(5000) });
      assert.equal(result.status, 200, `${route} should load`);
      assert.doesNotMatch(await result.text(), starterCopy);
    }
    for (const route of ["/blog", "/docs", "/pricing"]) {
      const result = await fetch(`${base}${route}`, { signal: AbortSignal.timeout(5000) });
      assert.equal(result.status, 404, `${route} should not serve starter content`);
    }

    console.log("Production public routes smoke passed.");
  } finally {
    if (child.exitCode === null) child.kill();
    await Promise.race([exited, new Promise((resolve) => setTimeout(resolve, 5000))]);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  smoke().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
