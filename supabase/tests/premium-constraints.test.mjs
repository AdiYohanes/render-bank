import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { test } from "node:test";

const premium = "00000000-0000-4000-8000-000000000603";
const otherPremium = "00000000-0000-4000-8000-000000000604";
const pack = "00000000-0000-4000-8000-000000000901";

function sql(statement) {
  return execFileSync("docker", ["exec", "-i", "supabase_db_renderbank", "psql", "-X", "-A", "-t", "-v", "ON_ERROR_STOP=1", "-U", "postgres", "-d", "postgres"], {
    input: `begin;\n${statement}\nset constraints all immediate;\nrollback;\n`, encoding: "utf8", stdio: ["pipe", "pipe", "pipe"],
  });
}

function rejects(statement, expected) {
  assert.throws(() => sql(statement), (error) => {
    assert.match(error.stderr.toString(), expected);
    assert.doesNotMatch(error.stderr.toString(), /SECRET_PREMIUM/);
    return true;
  });
}

test("published Premium Prompts and Packs retain valid relationships after edits", () => {
  rejects(`update public.prompts set primary_sales_pack_id = null where id = '${premium}';`, /Published Prompt is missing required content or membership/);
  rejects(`delete from public.pack_prompts where pack_id = '${pack}' and prompt_id = '${premium}';`, /Published Prompt is missing required content or membership/);
  rejects(`update public.prompts set status = 'DRAFT' where id = '${otherPremium}';`, /Published Pack is missing a cover or valid Premium members/);
  rejects(`update public.prompts set access_type = 'FREE' where id = '${otherPremium}';`, /Published Pack is missing a cover or valid Premium members/);
  rejects(`update public.packs set cover_asset_id = null where id = '${pack}';`, /Published Pack is missing a cover or valid Premium members/);
  rejects(`delete from public.prompt_contents where prompt_id = '${premium}';`, /Published Prompt is missing required content or membership/);
  rejects(`delete from public.prompt_images where prompt_id = '${premium}';`, /Published Prompt is missing required content or membership/);
  rejects(`update public.categories set status = 'ARCHIVED' where slug = 'product-photography';`, /Published Prompt is missing required content or membership/);
  rejects(`update public.models set status = 'ARCHIVED' where slug = 'demo-image-model';`, /Published Prompt is missing required content or membership/);
  const restored = sql(`update public.prompts set status = 'DRAFT' where id = '${premium}';
    update public.prompts set status = 'PUBLISHED' where id = '${premium}';
    select status from public.prompts where id = '${premium}';`);
  assert.match(restored, /PUBLISHED/, "multi-row editorial changes validate their final transaction state");
});

test("invalid Pack vocabulary, money and member constraints are rejected", () => {
  rejects("insert into public.packs (slug,title,description,price_minor,currency,status) values ('bad-pack','Bad','Bad',1,'IDR','AVAILABLE');", /invalid input value for enum pack_status/);
  rejects("insert into public.packs (slug,title,description,price_minor,currency) values ('bad-pack','Bad','Bad',-1,'IDR');", /violates check constraint/);
  rejects("insert into public.packs (slug,title,description,price_minor,currency) values ('bad-pack','Bad','Bad',1,'idr');", /violates check constraint/);
  rejects(`insert into public.pack_prompts (pack_id,prompt_id) values ('${pack}','${premium}');`, /duplicate key value/);
  rejects(`update public.packs set status = 'PUBLISHED', published_at = now() where id = '00000000-0000-4000-8000-000000000903';`, /Published Pack is missing a cover or valid Premium members/);
});

test("canonical and historical slugs share a reserved namespace and redirects do not chain", () => {
  rejects("insert into public.prompt_slug_redirects (prompt_id,old_slug) values ('00000000-0000-4000-8000-000000000605','demo-premium-studio');", /Prompt slug is canonical/);
  rejects("insert into public.prompts (slug,title,short_description,access_type,category_id) values ('demo-premium-old','Bad','Bad','FREE','00000000-0000-4000-8000-000000000101');", /Prompt slug is reserved/);
  rejects("insert into public.pack_slug_redirects (pack_id,old_slug) values ('00000000-0000-4000-8000-000000000902','demo-product-pack');", /Pack slug is canonical/);
  rejects("insert into public.packs (slug,title,description,price_minor,currency) values ('demo-pack-old','Bad','Bad',1,'IDR');", /Pack slug is reserved/);
  rejects("delete from public.prompt_slug_redirects where old_slug = 'demo-premium-old';", /Slug history is immutable/);
  rejects("update public.pack_slug_redirects set old_slug = 'another-old' where old_slug = 'demo-pack-old';", /Slug history is immutable/);
  const result = sql(`
    update public.prompts set slug = 'demo-premium-renamed' where id = '${premium}';
    update public.prompts set slug = 'demo-premium-renamed-again' where id = '${premium}';
    update public.packs set slug = 'demo-pack-renamed' where id = '${pack}';
    select old_slug || ':' || p.slug from public.prompt_slug_redirects r join public.prompts p on p.id = r.prompt_id
      where r.prompt_id = '${premium}' order by old_slug;
    select old_slug || ':' || p.slug from public.pack_slug_redirects r join public.packs p on p.id = r.pack_id
      where r.pack_id = '${pack}' order by old_slug;
  `);
  for (const redirect of [
    "demo-premium-old:demo-premium-renamed-again",
    "demo-premium-studio:demo-premium-renamed-again",
    "demo-premium-renamed:demo-premium-renamed-again",
    "demo-pack-old:demo-pack-renamed",
    "demo-product-pack:demo-pack-renamed",
  ]) assert.ok(result.includes(redirect), `redirect resolves directly: ${redirect}`);
  rejects(`update public.prompts set slug = 'demo-premium-old' where id = '${premium}';`, /Prompt slug is reserved/);
  const renamedWithoutTimestamp = sql(`update public.prompts set published_at = null where id = '${premium}';
    update public.prompts set slug = 'demo-premium-without-timestamp' where id = '${premium}';
    select old_slug from public.prompt_slug_redirects where prompt_id = '${premium}' and old_slug = 'demo-premium-studio';`);
  assert.match(renamedWithoutTimestamp, /demo-premium-studio/, "published status preserves the old slug without a timestamp");
  rejects(`delete from public.pack_prompts where pack_id = '${pack}'; update public.prompts set status = 'ARCHIVED' where id = '${premium}'; delete from public.prompts where id = '${premium}';`, /prompt_slug_redirects_prompt_id_fkey/);
  rejects(`update public.prompts set primary_sales_pack_id = null where primary_sales_pack_id = '${pack}'; delete from public.pack_prompts where pack_id = '${pack}'; update public.packs set status = 'ARCHIVED' where id = '${pack}'; delete from public.packs where id = '${pack}';`, /pack_slug_redirects_pack_id_fkey/);
});
