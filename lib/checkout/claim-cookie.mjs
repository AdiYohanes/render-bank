// @ts-check
/**
 * Stable checkout-token pair for issue #28: raw claim persists in the cookie;
 * only its SHA-256 hash reaches the database. `{ attemptKey }{ . }{ claim }`
 * in one HttpOnly cookie, rotated together whenever either is unusable.
 */
import { createHash, randomBytes, randomUUID } from "node:crypto";

export const CHECKOUT_COOKIE = "rb_checkout";
const COOKIE_MAX_AGE_SECONDS = 900; // aligns with the stored attempt claim_expires_at

/**
 * Raw claim format accepted by create_processing_purchase (43 chars base64url).
 * @returns {string}
 */
export function generateRawClaim() {
  return randomBytes(32).toString("base64url");
}

export function generateAttemptKey() {
  return randomUUID();
}

/**
 * @param {unknown} cookieValue
 * @returns {{ attemptKey: string, claim: string } | null}
 */
export function parseCheckoutCookie(cookieValue) {
  if (typeof cookieValue !== "string") return null;
  const attemptKey = cookieValue.slice(0, 36);
  if (attemptKey.length !== 36 || cookieValue[36] !== ".") return null;
  const claim = cookieValue.slice(37);
  // 43 chars base64url = 32 bytes, matching the format guard in create-processing-purchase
  return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(attemptKey) &&
    /^[A-Za-z0-9_-]{43}$/.test(claim)
    ? { attemptKey, claim }
    : null;
}

/**
 * Hash-only persistence per the contract: the raw claim never reaches the
 * database; the wire only stores its SHA-256 digest.
 * @param {string} rawClaim
 */
export function claimHash(rawClaim) {
  return `\\x${createHash("sha256").update(rawClaim).digest("hex")}`;
}

/**
 * Cookie options aligned with the stored attempt claim expiry.
 * @param {boolean} secure
 */
export function checkoutCookieOptions(secure) {
  return {
    httpOnly: true,
    /** @type {"lax"} */
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: COOKIE_MAX_AGE_SECONDS,
  };
}
