# ADR-0001: Phase 4 Payment Provider — Midtrans

**Status:** Accepted (4 October 2026)
**Decides:** Issue #26 — select the payment provider and lock the Phase 4 lifecycle contract
**Criteria source:** `docs/engineering/TECHNICAL_ARCHITECTURE.md` §18
**Parent:** [#25](https://github.com/AdiYohanes/render-bank/issues/25)

## Decision

RenderBank Phase 4 uses **Midtrans** with the hosted **Snap** page as the single payment provider, isolated behind the `PaymentGateway` seam:

```text
lib/payment/gateway.ts       seam: createCheckout(), verifyAndNormalizeWebhook() (server-only)
lib/payment/midtrans.ts      the selected adapter; the only module importing Midtrans details
```

- Midtrans is called over plain HTTPS (its Snap REST API) with Node's stdlib `crypto` — no SDK dependency, no client-bundle payment code.
- `getAuthoritativeStatus()` is declared on the seam but **not implemented**: verified webhooks are the only normal path that mutates payment truth, and `/payment/*` rechecks read server purchase state only. One internal adapter helper reads Midtrans transaction status only for checkout 409 recovery (A–C below) — that helper is an implementation detail, not an exposed seam method.
- `TransactionMailer.sendAccessLink()` remains Phase 5; the Phase 4 webhook completes payment and discards the candidate raw token (email delivery is Phase 5).

## Evaluation against the §18 criteria

| Criterion | Verdict | Note |
|---|---|---|
| Indonesia support | ✅ | QRIS, bank VA (BCA/BRI/Mandiri/BNI), e-wallets (GoPay/ShopeePay), cards; IDR native settlement; catalog prices in IDR |
| Global direction | ✅ | Cards + Google Pay/Apple Pay; regional overseas acceptance; matches PRD "Indonesia + Global" |
| Webhook reliability | ✅ | Documented automatic retry with backoff on non-2xx; notification push + signature verification |
| Cost | ✅ | Per-transaction MDR only, no monthly platform fee |
| Latency | ✅ | One server→Snap API call, then hosted-page handoff |
| Operational simplicity | ✅ | Hosted page needs no client SDK; two server env vars; signature = one SHA-512 hex check |

Rejected alternatives: **Stripe** (no Indonesian local rails under an Indonesian entity; weakest on the first criterion), **Xendit** (viable second choice; larger API surface than the deliberately narrow seam needs), **aggregator/DIY** (disproportionate operational burden for MVP).

## Sandbox strategy without production credentials

- **Application tests** (`tests/*.test.mjs`): pure projection functions of the adapter — payload normalization, signature verification against fixture vectors, redaction — with an injectable `fetch` fake; no network, no keys.
- **Real-role database tests** (`supabase/tests/*.test.mjs`): local Supabase with real roles; no provider involvement.
- **Checkout/status flows**: checked via the seam with fake gateways and local Supabase; the fake never calls Midtrans.
- **Optional developer smoke with Midtrans** (never required by CI/gates): uses the documented **Sandbox** host `app.sandbox.midtrans.com`, snap.sk test card `4811 1111 1111 1114`, CVV `123`, expiry `12/31`, and a public tunnel for `POST /api/payment/webhook`. Sandbox keys are never production credentials and are forbidden in the repo/build output (secret scan).
- CI and the acceptance gate never need Midtrans network access.

## Configuration, callback URLs, and the exact webhook route

Runtime: **Node.js** (never edge). Server-only env vars (added to the §15.4 list and to the secret-scan trusted-key set):

```text
MIDTRANS_SERVER_KEY       server key of the sandbox/test or production environment
MIDTRANS_IS_PRODUCTION    "true" → app.midtrans.com; unset/false → app.sandbox.midtrans.com
```

A missing/invalid env is a generic fail-closed: the checkout seam throws "Payment provider is unavailable" **before** any purchase mutation; builds and tests never require the vars.

- **Endpoints:** `POST {base}/snap/v1/transactions` (create); `POST {base}/v2/{order_id}/status` (internal 409 recovery + one-time re-fetch only); Basic auth `base64(SERVER_KEY + ":")`.
- **Checkout body:** `transaction_details(order_id, gross_amount)` from the initializer's authoritative attempt terms; `customer_details(email)`; `credit_card.secure = true`; `callbacks{finish, unfinish, error}`. `item_details` omitted — the money match is enforced by the database against stored purchase/attempt terms, not by the provider payload.
- **Webhook route (exact):** `POST /api/payment/webhook` — Node Route Handler, reads the provider-required raw body, verifies signature before trusting anything, normalizes to the lifecycle facts, and routes through the accepted RPCs. Returns `2xx` for accepted, replayed, deliberately-ignored, or decided-non-actionable events; `4xx` for malformed/unauthenticated; `5xx` only for transient internal failures (Midtrans retries per its documented schedule).
- **Return/callback URLs (presentation only, never payment proof):**
  - `finish` → `/payment/success?ref=<public_reference>`
  - `unfinish` → `/payment/pending?ref=<public_reference>`
  - `error` → `/payment/failed?ref=<public_reference>`
- Buyer-side cancel inside the Snap page returns via `unfinish`/`error`; `/payment/cancelled` exists for the CANCELLED purchase state reached after server verification or pending-route recheck.

## Provider-attempt binding and retry semantics (unambiguous + transaction-safe)

- `payment_attempts.provider = 'midtrans'`.
- **Order id formula (deterministic):** `order_id = 'r-' + public_reference` (45 chars ≤ 50; charset matches Midtrans `[A-Za-z0-9.\-_]+`; both halves are opaque to buyers, and only `ref=` leaks — never the order id — to presentation routes).
- **Binding is one-time and persists before the buyer handoff.** A dedicated service-role-only RPC `bind_provider_attempt chubby attempt row: id, provider, order_id)` writes `provider_attempt_id` atomically. It is the *only later write* of `provider_attempt_id`: the `guard_buyer_terms` trigger keeps the attempt terms immutable after that. It is idempotent — rebinding the same order_id succeeds; any other order id or a terminal attempt raises.
- **Retry safety across one checkout claim (attempt key stable):**
  1. attempt `CREATED`, no bound provider id → bind + `POST /snap/v1/transactions` once; success → buyer redirect persisted with the stored claim/attempt key.
  2. Bash POST → `409` (order already exists) or the provider reports an existing transaction → the adapter reads `/v2/{order_id}/status` — if the transaction is not yet paid, it returns the existing `snap_redirect_url` so the *same* session continues; if it already settled, the checkout flow redirects the buyer to the status route of the purchase instead of creating anything new. In no case a second `POST` is fired after a successful first one — the 409 recovery path is the only re-entry.
  3. attempt terminal (`FAILED/CANCELLED/EXPIRED`) or claim cookie expired → **the checkout submission rotates BOTH the attempt key and the raw claim** (fresh cookie, fresh claim hash, fresh attempt key) and creates a *new* attempt row. Because `create_processing_purchase` is keyed by the attempt key, a retry after terminality always creates a new purchase row with its own `public_reference`; `/payment/*` routes work per-reference; no duplicate payment can ever be charged from the old attempt.
- A different attempt key or email against an existing attempt key is refused by the database (`Checkout idempotency key conflict`).

## Verified non-success transitions, replay, and regression rules

Normalized event dispatch (first verified fact wins; later conflicting categories are recorded but never undo applied ones):

| Verified `transaction_status` (+`fraud_status`) | Attempt transition | Purchase transition | Webhook reply |
|---|---|---|---|
| `settlement`, or `capture` + `fraud_status=accept` | attempt `SUCCEEDED` via `complete_paid_purchase` (the paid RPC) | `PROCESSING → PAID` once; entitlement snapshot; token hash | `200` |
| `capture` + `fraud_status=pending` | no attempt change | none | `200` (recorded only) |
| `pending` | no attempt change | none | `200` (recorded only) |
| `cancel`, `deny` | attempt `FAILED` | purchase `PROCESSING → FAILED` (only while still `PROCESSING`) | `200` |
| `expire` | attempt `EXPIRED` | purchase `PROCESSING → CANCELLED` | `200` |
| `refund`, `partial_refund` | no attempt change | none | `200` (recorded only) |

Additional hard rules:

- The paid RPC remains the **only** path able to set `PAID`. Non-success recording uses the new service-role-only RPC `record_unpaid_payment_event`, which writes the `payment_events` row (idempotent by `(provider, provider_event_id)`), applies at most one legal attempt transition (`CREATED/PROCESSING → FAILED|CANCELLED|EXPIRED`) plus its corresponding purchase transition, and *never* touches `PAID`/`SUCCEEDED` state.
- A `PAID` purchase cannot regress. Attempt/purchase regressive updates are rejected; a non-success event against an already-`SUCCEEDED` attempt is recorded `IGNORED`.
- A mismatched event (other attempt, other amount, other order) is a hard error; nothing mutated, and the reply is `200` with safe logging (provider will not retry better data).
- Replay of the *same* `(provider, provider_event_id)` is safe: the recorded event row short-circuits handling; the paid path returns `newly_completed=false`, mints no second token, sends no duplicate email.
- Concurrent delivery is safe: paid completion relies `complete_paid_purchase`'s existing row-locked serial behavior (already proven by `supabase/tests/paid-purchase.test.mjs`), and non-success recording takes the same attempt row lock before checking transition legality.
- All `payment_events` rows record a SHA-256 digest of the raw provider payload (`provider_payload_digest`); raw payload bodies are not persisted.

## Wrong-route payment-state behavior (server state always wins)

`/payment/{route}?ref=<public_reference>` resolves a minimal, redacted purchase subset (status, masked email, pack title) by public reference using the service-role client. Then:

```text
paid-route canonical map:
  PAID       → /payment/success
  PROCESSING → /payment/pending
  FAILED     → /payment/failed
  CANCELLED  → /payment/cancelled
  (unknown/lost reference) → the REQUESTED route renders Unknown copy
```

- **Requested route matches the canonical map for the server state** → render that state's screen.
- **Requested route disagrees** (e.g. server says `PAID` but the buyer is on `/payment/failed`) → redirect to the canonical route with the same `ref`. The route name never projects a state.
- **Unknown reference / unresolvable** → the requested route shows the documented Unknown copy ("We couldn't verify your payment status.") in its own route; never coerced to `PAID` or `FAILED`.

## Reconciliation of Phase 4 / Phase 5 boundaries

| Capability | Owner | Phase 4 behavior |
|---|---|---|
| Raw access token generation + hash-only persistence | **Phase 5** | The completion path must take a candidate token hash from trusted code. In Phase 4 the webhook handler still derives a fresh high-entropy raw token **in server memory**, hashes it, and passes the hash inside `complete_paid_purchase`; the raw token is discarded after commit instead of emailed. Tests already model this contract. |
| Transactional email | **Phase 5** | `email_deliveries` rows/emails are not written by Phase 4 handlers. The Paid status page presents email-first wording ("Access link sent to your email") with no Resend action in Phase 4. |
| `Open My Pack` + buyer session creation + `/access` | **Phase 5** | Phase 4 does not render an `Open My Pack` CTA. Paid status shows pack + masked email, with exploration backlinks only; the HIGH_FIDELITY/SCREEN contracts (which include Open My Pack) stay authoritative for launch behavior and gain clarifying notes that Phase 4's acceptance gate does not cover the exchange. |
| Checkout claim cookie lifecycle | **Phase 4** | Created at checkout submit: `HttpOnly`, `SameSite=Lax`, `Secure` in production, `Path=/`, 15-minute lifetime aligned with the stored attempt `claim_expires_at`. Rotation rules above. Consumed later by the Phase 5 Open-My-Pack exchange; Phase 4 never reads it for authorization. |

## Sub-issue independence

Re-checked against this contract; all are executable without re-touching others' scope:

- **#27** storefront reads only public discovery data; no provider code.
- **#28** checkout + claims; the fake gateway is enough.
- **#29** adapter + binding RPC; no storefront/presentment code.
- **#30 webhook + lifecycle RPC**; #31 maps presentment routes only.
- **#32** runs the gate for everything; needs no live credentials.
