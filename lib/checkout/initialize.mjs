// @ts-check
/**
 * Checkout submission seam for issue #28: pure decision logic, all I/O injected.
 * Returns presentation-safe decisions only — never echoes claim, email, or
 * internal database detail. Decisions map to HTTP behavior in the server action.
 */

const emailAddress = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL = 254;

/**
 * Resolve the route pack and decide whether checkout may proceed.
 * @param {{slug: string, title: string, description: string, priceMinor: number, currency: string} | null} pack authoritative published pack row (server-resolved; never client-supplied)
 * @returns {{ok: true} | {ok: false, reason: "unavailable"}}
 */
export function checkPackPurchasable(pack) {
  if (!pack || pack.priceMinor == null || pack.currency !== pack.currency?.toUpperCase()) return { ok: false, reason: "unavailable" };
  if (!(Number.isInteger(pack.priceMinor) && pack.priceMinor >= 0)) return { ok: false, reason: "unavailable" };
  return { ok: true };
}

/**
 * Validate a buyer email (format only; delivery is account-free).
 * @param {unknown} email
 * @returns {{ok: true, email: string} | {ok: false, reason: "invalid"}}
 */
export function validateBuyerEmail(email) {
  if (typeof email !== "string") return { ok: false, reason: "invalid" };
  const value = email.trim().toLowerCase();
  if (!value || value.length > MAX_EMAIL || !emailAddress.test(value)) return { ok: false, reason: "invalid" };
  return { ok: true, email: value };
}

/**
 * Guard the slug against path tricks before it ever reaches a query.
 * @param {unknown} slug
 */
export function checkSlugFormat(slug) {
  const slugFormat = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return typeof slug === "string" && slug.length <= 100 && slugFormat.test(slug);
}
