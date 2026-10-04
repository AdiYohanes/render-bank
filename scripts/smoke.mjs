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
  assert.match(html, /"@type"\s*:\s*"WebSite"|&#x22;@type&#x22;:&#x22;WebSite&#x22;/, "root must embed WebSite JSON-LD");
  assert.doesNotMatch(html, /SECRET_PREMIUM|PRIVATE DRAFT RECIPE/, "root must never leak protected recipe markers");
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
      const html = await result.text();
      assert.doesNotMatch(html, starterCopy);
      assert.doesNotMatch(html, /SECRET_PREMIUM|PRIVATE DRAFT RECIPE/, `${route} must never leak protected recipe markers`);
    }
    for (const route of ["/blog", "/docs", "/pricing"]) {
      const result = await fetch(`${base}${route}`, { signal: AbortSignal.timeout(5000) });
      assert.equal(result.status, 404, `${route} should not serve starter content`);
    }

    const robots = await fetch(`${base}/robots.txt`, { signal: AbortSignal.timeout(5000) });
    assert.equal(robots.status, 200, "robots.txt should be served");
    const robotsText = await robots.text();
    assert.match(robotsText, /Sitemap: .+\/sitemap\.xml/);
    assert.doesNotMatch(robotsText, /Disallow: \/prompts\//, "public prompt detail must be indexable");
    assert.match(robotsText, /Disallow: \/admin\//);

    const free = await fetch(`${base}/prompts/demo-studio-product`, { signal: AbortSignal.timeout(5000) });
    assert.equal(free.status, 200);
    const freeHtml = await free.text();
    assert.match(freeHtml, /Copy Prompt/);
    assert.match(freeHtml, /Make a studio product image/);
    assert.match(freeHtml, /CreativeWork/);
    assert.doesNotMatch(freeHtml, /SECRET_PREMIUM|PRIVATE DRAFT RECIPE/);
    const locked = await fetch(`${base}/prompts/demo-premium-studio`, { signal: AbortSignal.timeout(5000) });
    assert.equal(locked.status, 200);
    const lockedHtml = await locked.text();
    assert.match(lockedHtml, /View Pack/);
    assert.match(lockedHtml, /Copy Link/);
    assert.match(lockedHtml, /Included in Demo Content: Product Pack/);
    assert.doesNotMatch(lockedHtml, /<meta name="robots" content="noindex/);
    assert.doesNotMatch(lockedHtml, /SECRET_PREMIUM|PRIVATE DRAFT RECIPE/);
    const prior = await fetch(`${base}/prompts/demo-premium-old`, { redirect: "manual", signal: AbortSignal.timeout(5000) });
    assert.equal(prior.status, 301);
    assert.match(prior.headers.get("location") ?? "", /\/prompts\/demo-premium-studio$/);

    const sitemap = await fetch(`${base}/sitemap.xml`, { signal: AbortSignal.timeout(5000) });
    assert.equal(sitemap.status, 200, "sitemap.xml should be served");
    const sitemapText = await sitemap.text();
    assert.match(sitemapText, /<loc>.*\/explore<\/loc>/);
    assert.match(sitemapText, /<loc>.*\/about<\/loc>/);
    assert.match(sitemapText, /<loc>.*\/prompts\/demo-studio-product<\/loc>/);
    assert.match(sitemapText, /<loc>.*\/prompts\/demo-premium-studio<\/loc>/);
    assert.doesNotMatch(sitemapText, /<(loc>.*\/(packs|terms|privacy|category\/draft|prompts\/demo-draft))/, "sitemap must not list later-phase or non-public routes");

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
