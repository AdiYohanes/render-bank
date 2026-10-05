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

    for (const route of ["/explore", "/about", "/packs", "/packs/demo-product-pack", "/terms", "/privacy"]) {
      const result = await fetch(`${base}${route}`, { signal: AbortSignal.timeout(5000) });
      assert.equal(result.status, 200, `${route} should load`);
      const html = await result.text();
      assert.doesNotMatch(html, starterCopy);
      assert.doesNotMatch(html, /SECRET_PREMIUM|PRIVATE DRAFT RECIPE/, `${route} must never leak protected recipe markers`);
    }
    const packStore = await fetch(`${base}/packs/demo-product-pack`, { signal: AbortSignal.timeout(5000) });
    assert.equal(packStore.status, 200, "pack store should load");
    const packStoreHtml = await packStore.text();
    assert.match(packStoreHtml, /Demo Content: Product Pack/);
    assert.match(packStoreHtml, /Rp.{0,2}59\.000/, "pack price must render IDR zero-decimal formatting");
    assert.match(packStoreHtml, /\/checkout\/demo-product-pack/, "pack store must link its checkout route");

    const checkout = await fetch(`${base}/checkout/demo-product-pack`, { signal: AbortSignal.timeout(5000) });
    assert.equal(checkout.status, 200, "checkout for a published pack should load");
    const checkoutHtml = await checkout.text();
    assert.match(checkoutHtml, /noindex/i, "checkout must be noindex");
    assert.match(checkoutHtml, /Demo Content: Product Pack/, "checkout must show the pack summary");
    assert.match(checkoutHtml, /Rp.{0,2}59\.000/, "checkout must show the authoritative price");
    assert.match(checkoutHtml, /Continue to Payment/, "checkout must show the payment CTA");
    assert.doesNotMatch(checkoutHtml, /SECRET_PREMIUM|PRIVATE DRAFT RECIPE/, "checkout must never leak protected recipe markers");

    const checkoutArchived = await fetch(`${base}/checkout/demo-archived-pack`, { signal: AbortSignal.timeout(5000) });
    assert.equal(checkoutArchived.status, 200, "checkout for an unavailable pack must render, not error");
    assert.match(await checkoutArchived.text(), /not purchasable/i, "unavailable checkout must refuse to sell");

    // /payment/*: unknown references render Unknown copy in the requested
    // route, never coerced to paid/failed; noindex; safe to load directly.
    for (const route of ["success", "pending", "failed", "cancelled"]) {
      const unknown = await fetch(`${base}/payment/${route}?ref=${"z".repeat(43)}`, { signal: AbortSignal.timeout(5000) });
      assert.equal(unknown.status, 200, `/payment/${route} unknown ref must render, not error`);
      const html = await unknown.text();
      assert.match(html, /couldn&#x27;t verify your payment status|couldn't verify your payment status/, "unknown ref shows the Unknown copy");
      assert.match(html, /noindex/i, `payment/${route} must be noindex`);
      assert.doesNotMatch(html, /74[0-9a-f]{10}|open my pack/i, "unknown view must not promise access or CTA state");
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
    assert.doesNotMatch(robotsText, /Disallow: \/packs\//, "pack storefront must be indexable");
    assert.match(robotsText, /Disallow: \/admin\//);
    assert.match(robotsText, /Disallow: \/checkout\//, "checkout must stay out of search");
    assert.match(robotsText, /Disallow: \/payment\//, "payment status must stay out of search");

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
    assert.match(sitemapText, /<loc>.*\/packs<\/loc>/);
    assert.match(sitemapText, /<loc>.*\/packs\/demo-product-pack<\/loc>/);
    assert.doesNotMatch(sitemapText, /<(loc>.*\/(terms|privacy|checkout|payment|category\/draft|prompts\/demo-draft))/, "sitemap must not list gated or non-public routes");

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
