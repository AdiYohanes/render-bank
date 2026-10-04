// @ts-check
/**
 * Payment status mapping (#31): pure decisions behind /payment/* routes.
 * Server purchase state always wins; the route name never projects a state.
 * (ADR-0001 "wrong-route payment-state behavior" + SCREEN_REQUIREMENTS §14-17.)
 */

/** @typedef {"success"|"pending"|"failed"|"cancelled"|"unknown"} StatusKind */

/** @typedef {{kind: StatusKind, packTitle: string|null, maskedEmail: string|null}} StatusView */

/**
 * @param {string} status server-side payment_status enum value
 * @returns {"success"|"pending"|"failed"|"cancelled"|null} canonical route name
 */
export function canonicalStatusRoute(status) {
  switch (status) {
    case "PAID": return "success";
    case "PROCESSING": return "pending";
    case "FAILED": return "failed";
    case "CANCELLED": return "cancelled";
    default: return null;
  }
}

/**
 * Mask an email for status presentation: keep the first character of the
 * local part, mask the rest with ***. Invalid or absent email stays absent.
 * @param {string | null | undefined} email
 */
export function maskedEmail(email) {
  if (typeof email !== "string" || !email.includes("@")) return null;
  const trimmed = email.trim();
  const at = trimmed.indexOf("@");
  const local = trimmed.slice(0, at);
  const domain = trimmed.slice(at + 1);
  if (!local || !domain.includes(".") || local.includes(" ")) return null;
  return `${local[0]}***@${domain}`;
  return `${local[0]}***@${domain}`;
}

/**
 * Resolve the canonical route + redacted view for a purchase row. Unknown or
 * lost references stay "unknown" — never coerced to paid or failed.
 * @param {{status: string, pack_title_snapshot: string, buyer_email_normalized: string} | null | undefined} purchase
 * @returns {StatusView}
 */
export function resolveStatusView(purchase) {
  const route = purchase ? canonicalStatusRoute(purchase.status) : null;
  if (!purchase || !route) {
    return { kind: "unknown", packTitle: null, maskedEmail: null };
  }
  return {
    kind: /** @type {Exclude<StatusKind, "unknown">} */ (route),
    packTitle: purchase.pack_title_snapshot || null,
    maskedEmail: maskedEmail(purchase.buyer_email_normalized),
  };
}
