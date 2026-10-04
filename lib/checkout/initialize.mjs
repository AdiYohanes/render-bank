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
 * Decide retry behavior for an existing attempt under the same claim/attempt key.
 * @param {{status: "CREATED"|"PROCESSING"|"SUCCEEDED"|"FAILED"|"CANCELLED"|"EXPIRED", claim_expires_at: string, order_id: string | null}|undefined} attempt
 * @param {boolean | undefined} orderExistsAtProvider true when the provider already knows the order id
 */
export function retryDecision(attempt, orderExistsAtProvider) {
  if (!attempt) return { kind: "none" };
  if (["FAILED", "CANCELLED", "EXPIRED"].includes(attempt.status)) return { kind: "rotate" };
  if (attempt.status === "SUCCEEDED") return { kind: "redirect-status" };
  // CREATED/PROCESSING — same claim may resume the same attempt
  if (orderExistsAtProvider) return { kind: "resume" };
  return { kind: "resume" };
}

const slugFormat = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Guard the slug against path tricks before it ever reaches a query.
 * @param {unknown} slug
 */
export function checkSlugFormat(slug) {
  return typeof slug === "string" && slug.length <= 100 && slugFormat.test(slug);
}
