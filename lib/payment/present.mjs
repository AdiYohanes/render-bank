// @ts-check
// Allowlist view-model for pack sales surfaces. Inputs come straight from the
// public discovery client (RLS-scoped), so only safe fields survive here.

/**
 * Packs store `price_minor` per currency: IDR is zero-decimal (whole rupiah),
 * others are 100-based minor units. Seed and admin both treat IDR that way.
 */
export function formatPackPrice(amountMinor, currency) {
  const fractionDigits = (currency || "").toUpperCase() === "IDR" ? 0 : 2;
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency,
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(amountMinor / 10 ** fractionDigits);
}

/**
 * Overload: one pack row → one card object; an array of rows → an array of cards.
 * @param {Array<{slug: string, title: string, description: string, price_minor: number, currency: string, cover: unknown, prompt_count?: Array<{count: number}>}>|{slug: string, title: string, description: string, price_minor: number, currency: string, cover: unknown, prompt_count?: Array<{count: number}>}} packs
 */
export function packCatalog(packs) {
  if (packs === null || packs === undefined) return Array.isArray(packs) ? [] : null;
  const rows = Array.isArray(packs) ? packs : [packs];
  const cards = rows.map((pack) => ({
    href: `/packs/${pack.slug}`,
    title: pack.title,
    description: pack.description,
    cover: pack.cover,
    promptCount: pack.prompt_count?.[0]?.count ?? 0,
    price: formatPackPrice(pack.price_minor, pack.currency),
  }));
  return Array.isArray(packs) ? cards : cards[0];
}

/**
 * Safe sales-detail view model from a lib/discovery findPackDetail row (prompts
 * already sorted by pack order): locked Prompt recipes never pass through this
 * projection — only titles, safe descriptions, and preview artwork survive.
 * @param {{slug: string, title: string, description: string, priceMinor: number, currency: string, cover: unknown, prompts: Array<{slug: string, title: string, short_description: string, images?: Array<{is_primary: boolean, alt_text: string, media_assets: unknown}>|null, category?: {name: string} | null, models?: Array<{models: {name: string} | null} | null> | null}>}} pack
 */
export function packDetail(pack) {
  const prompts = (pack.prompts ?? []).filter(Boolean);
  const useCases = [...new Set(prompts.map((p) => p.category?.name).filter(Boolean))];
  const models = [
    ...new Set(prompts.flatMap((p) => (p.models ?? []).map((m) => m?.models?.name).filter(Boolean))),
  ];
  const previews = prompts.map((p) => ({
    href: `/prompts/${p.slug}`,
    title: p.title,
    description: p.short_description,
  }));
  const examples = prompts
    .map((p) => (p.images?.find(({ is_primary }) => is_primary) ?? p.images?.[0])?.media_assets)
    .filter(Boolean)
    .map((asset, index) => ({ asset, alt: previews[index]?.title ? `${previews[index].title} example visual` : "Pack example visual" }));

  return {
    slug: pack.slug,
    title: pack.title,
    description: pack.description,
    price: formatPackPrice(pack.priceMinor, pack.currency),
    currency: pack.currency,
    promptCount: prompts.length,
    useCases,
    models,
    previews,
    examples,
  };
}
