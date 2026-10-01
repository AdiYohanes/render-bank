# RenderBank Technical Architecture

**Document:** Technical Architecture  
**Product:** RenderBank  
**Version:** 2.1  
**Status:** Approved MVP Baseline  
**Last Updated:** 2026-09-30  
**Depends On:** `docs/product/PRD.md v1.0`, `docs/product/SITEMAP.md v1.2`, `docs/experience/USER_FLOWS.md v1.1`, `docs/experience/SCREEN_REQUIREMENTS.md v1.1`, `docs/design/DESIGN.md v1.1`, `docs/design/HIGH_FIDELITY_UI.md v1.1`

---

# 1. Purpose and Scope

Dokumen ini adalah source of truth untuk implementasi RenderBank MVP. Arsitektur mengutamakan:

1. public discovery yang cepat untuk website image-heavy;
2. interaksi dan motion yang smooth pada mobile maupun desktop;
3. payment, entitlement, dan premium access yang server-authoritative;
4. operasi MVP yang sederhana melalui Supabase dan Vercel;
5. migration path yang wajar tanpa membangun infrastructure scale sebelum dibutuhkan.

Product scope tetap mengikuti dokumen product. Arsitektur tidak menambahkan public account, subscription, marketplace, realtime experience, atau fitur lain di luar MVP.

## 1.1 Core Principles

- **Server by default.** Render di server; hydrate hanya bagian yang benar-benar interaktif.
- **Safe data by default.** Premium content tidak pernah dikirim lalu disembunyikan di browser.
- **Database-enforced integrity.** Constraint dan transaction menjaga invariant penting.
- **Verified payment only.** Browser redirect tidak pernah menjadi bukti pembayaran.
- **Simple before scalable.** Satu modular monolith, satu database, tanpa queue atau microservice.
- **Native before dependency.** Gunakan CSS dan Web Platform API untuk kebutuhan sederhana.
- **Measure before upgrading.** Tambah infrastructure hanya setelah bottleneck terbukti.

## 1.2 Explicit MVP Non-Goals

MVP tidak menggunakan:

- buyer registration atau login;
- personal library lintas pembelian;
- subscription;
- Supabase Realtime;
- Supabase Edge Functions;
- microservices atau message broker;
- dedicated search engine;
- custom admin authentication system;
- generic abstraction untuk mengganti Supabase;
- JavaScript masonry atau cinematic page transitions.

---

# 2. Architecture Decisions

| Area | MVP Decision |
|---|---|
| Application | Next.js App Router + TypeScript |
| UI | React Server Components by default + HeroUI v3 for interactive primitives |
| Styling | Tailwind CSS v4 + `@heroui/styles` + CSS custom properties + small authored CSS |
| Components/accessibility | `@heroui/react` v3, built on React Aria Components |
| Motion | HeroUI/CSS first; animation library only when CSS cannot express the interaction cleanly |
| Database | Supabase Postgres |
| Database access | Typed `supabase-js` queries and narrow RPC functions |
| Schema management | Version-controlled SQL migrations via Supabase CLI |
| Database types | Generated TypeScript `Database` types |
| Admin identity | Supabase Auth, admin-only, manually provisioned |
| Buyer identity | No Auth account; secure purchase-scoped session |
| File storage | Supabase Storage |
| Application hosting | Vercel |
| Payment | External provider behind a small payment adapter |
| Transactional email | External provider behind a small mailer adapter |
| Search | PostgreSQL full-text/trigram when necessary |
| Analytics/error tracking | Lightweight provider selected during implementation |
| Runtime | Node.js for provider SDK, webhook, access, and email paths |
| Package manager | npm with committed `package-lock.json` |

There is no ORM in the MVP. SQL migrations define schema truth; generated types prevent manually duplicated table types.

## 2.1 HeroUI v3 Contract

HeroUI is the default source for accessible interactive primitives such as button, form control, dialog, popover, menu, tabs, and toast. It does not replace RenderBank's product-specific composition, image cards, design tokens, or Server Component architecture.

Implementation rules:

- use HeroUI **v3** APIs only;
- install and pin `@heroui/react`, `@heroui/styles`, and `tailwind-variants`;
- Tailwind CSS v4 is mandatory;
- import `tailwindcss` before `@heroui/styles` in global CSS;
- no `HeroUIProvider` is required;
- use compound component anatomy such as `Card.Header` rather than legacy flat v2 props;
- use React Aria event semantics such as `onPress` where exposed by HeroUI;
- prefer semantic variants (`primary`, `secondary`, `tertiary`, `danger`) over raw UI colors;
- customize the RenderBank theme through HeroUI/CSS variables using `oklch` tokens;
- use CSS-based HeroUI motion; do not add Framer Motion merely for standard component transitions;
- consult current HeroUI v3 component documentation before implementing a component because APIs may evolve independently.

Use a plain semantic HTML element or small local component when HeroUI would add no accessibility or behavior value. Do not wrap every HeroUI component in a project abstraction; create a wrapper only for a repeated RenderBank-specific contract.

---

# 3. System Topology and Trust Boundaries

```text
Visitor / Buyer / Admin
          │ HTTPS
          ▼
┌──────────────────────────────────────────────┐
│ Next.js application on Vercel               │
│                                              │
│ Public UI  Admin UI  Server Components      │
│ Server Actions  Route Handlers              │
│ Domain services: content, payment, access   │
└───────┬───────────────┬───────────────┬──────┘
        │               │               │
        ▼               ▼               ▼
┌─────────────────┐ Payment Provider  Email Provider
│ Supabase        │         │
│ ├─ Postgres     │         ▼
│ ├─ Auth         │  verified webhook
│ └─ Storage      │         │
└─────────────────┘         └──────→ Next.js → trusted RPC
```

## 3.1 Actors and Credentials

| Actor | Credential | Allowed Boundary |
|---|---|---|
| Visitor | Supabase publishable key (`anon`) | Published safe metadata, free content, public artwork |
| Admin | Publishable key + Supabase Auth JWT (`authenticated`) + active `admin_profiles` row | Approved admin operations; each mutation is authorized server-side |
| Buyer | Custom HttpOnly purchase session | One purchase and its entitlement through trusted Next.js server code |
| Trusted backend | Supabase secret key (`service_role`) | Narrow checkout, webhook, access, and email operations only |

`anon` and `service_role` are legacy role names still used by PostgreSQL policy semantics. New configuration should use Supabase publishable and secret keys where available.

The secret/service-role client:

- lives in a `server-only` module;
- is never imported by Client Components;
- is never exposed through `NEXT_PUBLIC_*` variables;
- never appears in logs, URLs, or analytics;
- bypasses RLS, so application authorization and input validation remain mandatory.

## 3.2 Recommended Application Boundaries

```text
src/
├── app/                 routes, layouts, metadata, route handlers
├── components/          shared UI; client islands kept explicit
├── domain/              content, checkout, payment, entitlement, access
├── lib/supabase/        browser, server, and service clients
├── providers/           payment and email adapters only
└── validation/          trust-boundary schemas

supabase/
├── migrations/          complete schema, functions, grants, RLS
└── seed.sql              safe local development data
```

Page components do not compose payment or entitlement rules directly. They call small domain functions that return safe page-specific data.

---

# 4. Next.js Server and Client Boundary

## 4.1 Server Responsibilities

Run these on the server:

- page data fetching and safe DTO creation;
- premium authorization and entitlement checks;
- authoritative price and currency resolution;
- payment provider calls and webhook verification;
- access-token hashing and session creation;
- canonical metadata and SEO;
- admin identity and authorization checks;
- use of the Supabase secret/service-role client.

## 4.2 Client Islands

Client Components are limited to:

- search input and filter controls;
- HeroUI/React Aria interactions such as sheet, dialog, dropdown, menu, tabs, and toast;
- Variable Editor and composed prompt preview;
- Copy Prompt and Copy Link;
- admin upload/form interactions that require browser state.

Import HeroUI components as close as practical to the interactive boundary. A HeroUI component being client-interactive does not justify converting its page, layout, data loading, or static composition into a Client Component.

Do not convert an entire route to a Client Component for convenience. Public route chunks must not include admin tooling, provider SDKs, premium content, or service credentials.

## 4.3 Validation

Validate every trust boundary:

- URL/search parameters;
- form and Server Action input;
- checkout email and product identifier;
- payment provider payload after signature verification;
- admin mutation input;
- upload metadata;
- access token and session cookie format.

Schema validation supplements—not replaces—database constraints.

---

# 5. Rendering, Caching, and Route Security

This is the authoritative route matrix.

| Route family | Rendering/cache | Identity/check | SEO |
|---|---|---|---|
| `/`, `/explore`, `/category/*` | Server-rendered; revalidated public cache | Published safe data only | Index |
| `/prompts/*` free/locked | Server-rendered; public cache contains safe response only | Publication state and access type | Index |
| `/prompts/*` unlocked | Dynamic, private, `no-store` | Buyer session + current entitlement | Canonical public URL; protected body excluded from metadata |
| `/packs`, `/packs/*` | Server-rendered; revalidated public cache | Published pack only | Index |
| `/checkout/*` | Dynamic, private, `no-store` | Authoritative purchasable pack | Noindex |
| `/payment/*` | Dynamic, private, `no-store` | Opaque reference; claim required for access | Noindex |
| `/access/[token]` | Dynamic, `no-store` | Token hash + active purchase | Noindex |
| `/access` | Dynamic, private, `no-store` | Purchase-scoped buyer session | Noindex |
| `/admin/*` | Dynamic, private, `no-store` | Verified Supabase Auth admin | Noindex |
| Legal/about pages | Static or revalidated | Public | Index |
| Payment webhook | Dynamic, `no-store` | Provider signature | Not a page |

Rules:

- Protected HTML must never enter a shared cache.
- Public cached responses contain only safe public fields.
- Admin publish/update triggers targeted path or tag revalidation.
- A slug change creates one redirect to the current canonical slug; avoid redirect chains.
- Premium body is excluded from metadata, OpenGraph descriptions, structured data, serialized client props, and unauthorized error payloads.

---

# 6. Supabase Database Workflow

## 6.1 Source of Truth

All schema changes are SQL migrations under `supabase/migrations` and include:

- tables, enums, constraints, and indexes;
- database functions;
- grants and revokes;
- RLS enablement and policies;
- Storage bucket policies where applicable.

The Supabase Dashboard may inspect data but must not create undocumented production-only schema changes.

Workflow:

```text
Write migration
   ↓
supabase db reset
   ↓
run database/RLS checks
   ↓
generate TypeScript Database types
   ↓
typecheck and test application
   ↓
apply migration before dependent application deployment
```

Destructive production changes use expand/migrate/contract steps. Production and non-production use separate Supabase projects and never share customer data.

## 6.2 Query Approach

- Use generated `Database` types with `supabase-js`.
- Use normal typed queries for CRUD and reads.
- Use a narrow PostgreSQL function/RPC when one atomic operation spans multiple tables.
- Do not expose generic elevated RPCs.
- Add indexes from actual route queries and query plans, not every possible filter.

---

# 7. Core Data Model

The following is the MVP logical model. Exact SQL belongs in migrations.

## 7.1 Content

```text
categories
- id, slug UNIQUE, name, status, sort_order

models
- id, slug UNIQUE, name, status

tags
- id, slug UNIQUE, name

prompts                         -- safe metadata only
- id, slug UNIQUE, title
- short_description, description
- access_type: FREE | PACK_ONLY
- category_id
- aspect_ratio, orientation
- requires_reference_image
- primary_sales_pack_id nullable
- status: DRAFT | PUBLISHED | UNPUBLISHED | UNLISTED | ARCHIVED
- published_at, created_at, updated_at

prompt_contents                 -- never public for premium prompts
- prompt_id PRIMARY KEY
- prompt_template
- generation_notes
- created_at, updated_at

prompt_variables                -- protected with the same parent access rule
- id, prompt_id, key, label, description
- placeholder, default_value, required, sort_order

media_assets                    -- validated preview-file metadata
- id, bucket, storage_path, mime_type, byte_size
- width, height, blur_placeholder nullable, created_by, created_at

prompt_images                   -- published-parent preview associations
- id, prompt_id, media_asset_id, alt_text
- focal_x, focal_y nullable, sort_order, is_primary, created_at

prompt_models
- prompt_id, model_id, sort_order

prompt_tags
- prompt_id, tag_id

prompt_slug_redirects
- old_slug UNIQUE, prompt_id, created_at
```

Separating `prompt_contents` from `prompts` prevents sensitive columns from sharing a broadly readable metadata row. Preview images must never contain embedded premium text or credentials.

## 7.2 Packs

```text
packs
- id, slug UNIQUE, title, description
- cover_asset_id nullable → media_assets.id
- price_minor, currency
- status: DRAFT | PUBLISHED | UNLISTED | ARCHIVED
- published_at, created_at, updated_at

pack_prompts
- pack_id, prompt_id, sort_order, created_at
- UNIQUE(pack_id, prompt_id)

pack_slug_redirects
- old_slug UNIQUE, pack_id, created_at
```

Money is stored as integer minor units where supported. Price and currency always come from the database, never from the browser.

## 7.3 Commerce and Entitlement

```text
purchases
- id, public_reference UNIQUE opaque
- buyer_email_normalized
- pack_id, pack_title_snapshot, amount_minor, currency
- payment_status: PROCESSING | PAID | FAILED | CANCELLED
- entitlement_status: ACTIVE | SUSPENDED
- paid_at nullable, created_at, updated_at

payment_attempts
- id, purchase_id, provider
- UNIQUE(provider, provider_attempt_id) when present; idempotency_key UNIQUE
- checkout_claim_hash, amount_minor, currency
- status, expires_at, created_at, updated_at

payment_events
- id, provider, provider_event_id
- event_type, received_at, processed_at
- processing_status, safe_error_code nullable
- UNIQUE(provider, provider_event_id)

purchase_entitlements
- id, purchase_id, prompt_id
- source: PACK_SNAPSHOT
- granted_at, revoked_at nullable
- UNIQUE(purchase_id, prompt_id)
```

Entitlement is a purchase-time snapshot. Changes to `pack_prompts` affect future purchases only. Purchased content is archived/unlisted rather than hard-deleted.

## 7.4 Accountless Access

```text
access_tokens
- id, purchase_id
- token_hash UNIQUE
- status: ACTIVE | REVOKED | ROTATED
- created_at, last_used_at, revoked_at
- rotated_from_token_id nullable

access_sessions
- id, session_hash UNIQUE
- purchase_id
- created_at, expires_at, last_seen_at, revoked_at

email_deliveries
- id, purchase_id, purpose, recipient_email_normalized
- status: QUEUED | SENT | DELIVERED | FAILED
- provider, provider_message_id nullable
- attempt_number, safe_error_code nullable
- sent_at, delivered_at, failed_at, created_at
```

Only token and session hashes are stored. A buyer session maps to exactly one purchase; purchases sharing an email are not combined.

## 7.5 Minimum Constraints and Indexes

Required integrity constraints:

- unique slugs and redirect source slugs;
- unique provider attempt and event IDs;
- unique `(purchase_id, prompt_id)` entitlement;
- unique token/session hashes;
- valid enum/check values and non-negative money;
- foreign-key behavior that prevents accidental deletion of purchased records.

Initial route-driven indexes:

- prompts by `(status, published_at DESC)`;
- prompts by `(category_id, status, published_at DESC)`;
- pack membership by `(pack_id, sort_order)`;
- entitlements by `(purchase_id, prompt_id)`;
- access token by `token_hash`;
- access session by `session_hash` and expiry.

Search-specific full-text/trigram indexes are added when the actual query is implemented.

---

# 8. RLS and Data Exposure

Enable RLS on every table in an exposed schema. Default is no access until an explicit grant and policy exist.

## 8.1 Policy Matrix

| Data | `anon` | `authenticated` admin | `service_role` backend |
|---|---|---|---|
| Published prompt/pack metadata | Read | Read/write | Narrow server use |
| Free published content/variables | Read | Read/write | Narrow server use |
| Premium content/variables | No direct read | Read/write | Read after buyer authorization |
| Categories/models/tags | Published read | Read/write | Narrow server use |
| Preview Storage objects | Public read | No direct write | Validated server upload only |
| Purchases/payment events | No access | Approved admin read/actions | Checkout/webhook only |
| Entitlements/tokens/sessions | No access | Approved admin operations | Access services only |
| Email delivery records | No access | Approved admin read/retry | Mail workflow only |

## 8.2 Policy Rules

- `anon` receives no database or Storage mutation permission.
- Published public metadata policies filter lifecycle state.
- Free content policies require the parent prompt to be `PUBLISHED` and `FREE`.
- Premium content is never directly available to a buyer through Supabase. Trusted Next.js code resolves the buyer session and returns only authorized content.
- Admin policies use verified Supabase Auth identity and active `admin_profiles` membership.
- Lifecycle/business invariants remain in domain validation and database constraints; UI visibility is not authorization.
- RPC execution is revoked from `public`, `anon`, and `authenticated` unless a function is explicitly designed for them.

RLS protects publishable-key access. It does not constrain service-role code.

---

# 9. Admin Authentication and Authorization

Supabase Auth is used only for RenderBank administrators.

## 9.1 MVP Rules

- Disable public signup.
- Provision admin users manually.
- Use Supabase server-side Auth with request-specific cookie handling.
- Verify identity server-side with validated claims/user lookup and an active `admin_profiles` row; do not authorize from unverified cookie content or `getSession()` alone.
- Every `/admin/*` mutation repeats authorization server-side.
- Buyer access never uses Supabase Auth.
- Do not build custom passwords, custom admin session tables, RBAC, or an Auth-provider abstraction.

For MVP, provision each Admin Supabase Auth identity manually together with an active `admin_profiles` row. An Auth identity without an active profile is not a RenderBank Admin and receives only public-role reads; RLS and every server mutation check the active profile. Do not add another authenticated actor without reviewing these grants and policies.

## 9.2 Mutation Flow

```text
Admin request
   ↓
verify Supabase Auth identity + active `admin_profiles` row
   ↓
validate mutation input
   ↓
apply domain rules and DB constraints
   ↓
commit
   ↓
revalidate affected public cache
```

Destructive operations prefer archive/unpublish. Sensitive operations such as entitlement suspension or token rotation require an explicit reason and safe audit record.

---

# 10. Checkout and Payment

## 10.1 Checkout Initialization

```text
POST checkout
   ↓
validate email and pack identifier
   ↓
load PUBLISHED purchasable pack
   ↓
read authoritative price/currency
   ↓
create purchase + payment attempt
   ↓
generate high-entropy checkout claim
   ↓
store claim hash; set raw claim in HttpOnly cookie
   ↓
create provider checkout session
   ↓
redirect to provider
```

Never trust client-submitted price, currency, payment status, or product description.

Checkout claim cookie requirements:

- `HttpOnly`;
- `Secure` in production;
- `SameSite=Lax`;
- narrow lifetime;
- random high entropy;
- scoped to the checkout/payment flow where practical.

## 10.2 Verified Webhook

The payment provider webhook is the only normal path that completes payment.

```text
Provider webhook
   ↓
read provider-required raw body
   ↓
verify signature/authenticity
   ↓
normalize trusted event
   ↓
generate raw access token in server memory; derive its hash
   ↓
call complete_paid_purchase RPC with token hash as service role
   ↓
commit durable paid state + entitlements
   ↓
send raw access link after commit; discard raw token
```

Browser success/cancel URLs only control presentation. They never update payment truth.

## 10.3 Atomic Completion RPC

`complete_paid_purchase` is a narrow PostgreSQL function callable only by the trusted backend. Its exact inputs, output, and state contract are owned by [`DATABASE_SCHEMA.md` section 39](DATABASE_SCHEMA.md#39-payment-transaction-boundary). It performs one transaction:

1. insert or resolve unique `(provider, provider_event_id)`;
2. lock the matching payment attempt and purchase;
3. compare provider product, amount, currency, and verified status with stored expectations;
4. reject invalid or regressive state transitions;
5. transition `PROCESSING → PAID` once;
6. copy current pack membership into `purchase_entitlements`;
7. insert the supplied access-token hash only when this invocation newly completes payment;
8. mark the event processed;
9. return purchase ID and whether this invocation newly completed payment.

The raw token exists only in trusted server memory long enough to construct the first access email. On duplicate events, the RPC returns `newly_completed = false`; the handler sends no new email and discards its unused candidate token. Database uniqueness makes duplicate events harmless. Any mismatch or uncaught failure rolls back the entire transaction.

Function security:

- use `SECURITY INVOKER` with the service-role caller;
- explicitly revoke execution from `public`, `anon`, and `authenticated`, then grant it to `service_role` only;
- schema-qualify referenced objects;
- set a safe `search_path` if a definer function is ever unavoidable;
- accept only normalized fields required for the transition.

Email is outside the transaction. Email failure does not revert `PAID` or entitlement.

## 10.4 Payment Status Page

`/payment/*` reads server state using an opaque public reference. The route name never overrides that state.

Immediate “Open My Pack” requires all three:

1. matching opaque purchase reference;
2. matching checkout claim cookie whose hash belongs to the payment attempt;
3. server purchase state `PAID` with active entitlement.

A payment reference without the secret claim cannot create access. On `Open My Pack`, the server hashes the short-lived HttpOnly claim, matches it to an attempt for that purchase, checks `PAID` and active entitlement, creates a fresh purchase-scoped session (revoking a prior session presented in that cookie), sets its HttpOnly cookie, and redirects to `/access`. This does not require or reveal the raw email access token. A missing, expired, or mismatched claim cannot create a session; a later visit uses the emailed `/access/[token]` link.

Pending state may offer an explicit **Check Again** action or bounded polling if UX testing requires it. Realtime is not used.

---

# 11. Entitlement and Buyer Access

## 11.1 Access Token

Access links use 32 or more cryptographically secure random bytes with URL-safe encoding.

Rules:

- scope exactly one purchase;
- store only a one-way hash;
- never log or send the raw token to analytics;
- never place it in prompt URLs, metadata, or referrers;
- support revoke and rotate;
- do not rotate during ordinary validation.

## 11.2 Token Exchange

```text
GET /access/[token]
   ↓
hash presented token
   ↓
resolve ACTIVE token and ACTIVE entitlement
   ↓
create random purchase-scoped session
   ↓
store session hash; set HttpOnly cookie
   ↓
update last_used_at
   ↓
303 redirect to /access
```

The redirect removes the token from the address bar immediately. Access surfaces use `Referrer-Policy: no-referrer`, `no-store`, and minimal third-party scripts.

Session cookie:

- `HttpOnly`;
- `Secure` in production;
- `SameSite=Lax`;
- `Path=/` unless a narrower valid scope is practical;
- shorter lifetime than the access token;
- name contains no buyer or purchase data.

## 11.3 Premium Prompt Authorization

Every premium request repeats authorization:

```text
load safe prompt metadata
   ↓
FREE? ── yes → load full content
   │
   no
   ↓
resolve hashed buyer session
   ↓
resolve its one purchase
   ↓
check active purchase entitlement for prompt
   ├── entitled → load protected content server-side
   └── otherwise → return locked public state
```

Protected content must not flash before authorization because it never enters an unauthorized response.

## 11.4 Rotation, Revocation, and Suspension

- **Rotate token:** mark old token `ROTATED`, create/store a new hash, keep entitlement active.
- **Revoke token:** mark token `REVOKED`; entitlement remains active and a replacement may be created.
- **Suspend entitlement:** explicit admin operation for justified refund, chargeback, fraud, legal, or policy cases.

Because raw tokens are not recoverable, “resend access email” creates or rotates to a replacement token and sends the new raw link. It never reads an old token from the database.

---

# 12. Supabase Storage and Images

## 12.1 Bucket Model

Use one public bucket, `prompt-previews`, for preview artwork and pack covers only.

- Public may read objects.
- The trusted server verifies an active Admin profile and validates image bytes before uploading; Storage policies deny direct `anon` and `authenticated` object mutations, including Admin JWTs.
- The public bucket serves every stored object immediately; validation precedes upload, while database image rows determine whether content uses the object.
- Premium prompt text, buyer data, and credentials never enter Storage.
- Generated/versioned object paths are used instead of raw filenames.

## 12.2 Upload Pipeline

```text
verify admin
   ↓
validate declared MIME, extension, and size
   ↓
decode image server-side; validate bytes and dimensions
   ↓
generate safe object path
   ↓
upload object
   ↓
write validated media_asset and prompt_images metadata
   ↓
publish content only after validation succeeds
```

Do not trust client MIME type alone. Serve uploads as media from Storage, never as executable application files.

## 12.3 Delivery and Performance

Use `next/image` with Supabase Storage URLs as the baseline. Each image records width, height, aspect ratio, format, storage path, and alt/decorative intent.

Rules:

- supply accurate `sizes`;
- reserve geometry with dimensions or CSS `aspect-ratio`;
- prioritize only the likely above-fold LCP image;
- lazy-load below-fold grids and secondary gallery items;
- avoid original-size assets for small cards;
- use `cover` only when composition tolerates cropping; otherwise use focal metadata or `contain`.

Supabase Image Transformations may be enabled when the selected plan supports the required volume and economics. The MVP must remain correct without assuming that paid transformation feature.

---

# 13. Search, SEO, Performance, and Accessibility

## 13.1 Search and Filters

Discovery state lives in URL parameters such as:

```text
q, category, model, orientation, access
```

Initial results are server-rendered. Use PostgreSQL search over approved public fields only; premium prompt bodies are never indexed for public search. Paginate with a stable order and an accessible **Load More** interaction.

Do not add external search until measured inventory/query load or relevance requirements exceed PostgreSQL capability.

## 13.2 SEO

Index public discovery, public prompt pages, published packs, about, and legal pages. Noindex checkout, payment, access, and admin routes.

Each public page uses:

- canonical URL;
- safe title and description;
- safe OpenGraph artwork;
- semantic headings;
- meaningful alt text;
- structured data only when it contains no protected fields.

Filtered `/explore` variants canonicalize according to the approved SEO strategy rather than generating unlimited indexable combinations.

## 13.3 Performance Budgets

| Metric | Target | Investigation Threshold |
|---|---:|---:|
| LCP | ≤ 2.0s preferred | > 2.5s |
| INP | ≤ 150ms preferred | > 200ms |
| CLS | ≤ 0.05 preferred | > 0.10 |
| Cached public TTFB | ≤ 500ms p75 | > 800ms |
| Main-thread task | avoid > 50ms | repeated > 50ms |

Measure on representative mid-range mobile hardware and throttled network, not only developer desktop.

Public performance rules:

- Server Components by default;
- no admin or payment SDK in unrelated public chunks;
- responsive images and stable layout;
- no eager loading of complete galleries;
- CSS grid instead of runtime masonry;
- third-party scripts require measured justification.

## 13.4 Motion

Default UI motion is subtle, typically 150–250ms. Prefer HeroUI's CSS-based interaction states and `transform`/`opacity`; avoid repeated animation of layout properties, large blur, or expensive shadow. Do not add Framer Motion for hover, fade, press, sheet, or standard disclosure behavior.

Respect `prefers-reduced-motion`; removing decorative motion must not remove necessary status feedback. Avoid global per-frame scroll work; use `IntersectionObserver` for visibility-driven behavior.

## 13.5 Accessibility

Target WCAG 2.1 AA in practical implementation. Preserve:

- semantic landmarks and headings;
- full keyboard operation and visible focus;
- form labels and associated errors;
- non-color status cues;
- appropriate touch targets;
- focus trap/return for overlays;
- live status for copy, payment, and access feedback;
- reduced motion;
- meaningful image alternatives.

Performance optimization must not remove semantics or focus behavior.

---

# 14. External Provider Seams

Only two external capabilities receive explicit adapters:

```text
PaymentGateway
- createCheckout()
- verifyAndNormalizeWebhook()
- getAuthoritativeStatus() when required

TransactionalMailer
- sendAccessLink()
```

Domain services consume normalized provider results, not provider-specific payloads. Do not build adapters for Supabase database, Auth, or Storage during MVP.

Analytics and error monitoring are operational integrations, not domain abstractions. They must be non-blocking and redact sensitive values.

---

# 15. Security, Privacy, and Operations

## 15.1 Sensitive Data

Sensitive values include:

- premium prompt content and protected variable definitions;
- raw access token and checkout claim;
- buyer email and purchase reference;
- session identifiers;
- visitor-entered variable values;
- payment credentials/provider secrets;
- Supabase secret/service-role key.

They must not appear in unauthorized HTML, metadata, client props, share URLs, analytics, logs, image metadata, or third-party error payloads.

## 15.2 Application Controls

Required controls:

- HTTPS-only production;
- input validation at every trust boundary;
- framework-safe output escaping;
- parameterized database operations;
- Content Security Policy and secure headers;
- CSRF-safe patterns for cookie-authenticated mutations;
- rate limits on admin login, checkout, payment recheck, token validation, and resend/rotation;
- generic public errors that do not disclose token validity or internal IDs;
- least-privilege grants and provider credentials.

`SameSite` cookies help but are not the only CSRF control. Exact CSP should allow only required payment/image/provider origins.

## 15.3 Logging and Analytics

Safe structured fields include request ID, route, operation, status, duration, safe error code, event type, and release ID.

Never log raw tokens, cookies, premium content, buyer email in general request logs, variable values, or credentials. Use pseudonymized correlation only when operationally necessary.

Approved analytics may include prompt viewed/copied/shared, search/filter usage, pack viewed, checkout started, and aggregate purchase outcomes. Analytics failure never blocks product actions.

## 15.4 Environments and Secrets

```text
Local: Supabase CLI + local environment
Preview/Staging: isolated non-production Supabase project and provider sandbox
Production: dedicated Supabase project + production provider credentials
```

Typical environment variables:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
SUPABASE_SECRET_KEY
PAYMENT_SECRET
PAYMENT_WEBHOOK_SECRET
EMAIL_PROVIDER_SECRET
ACCESS_SESSION_SECRET (if application signing requires it)
```

Only explicitly public values use `NEXT_PUBLIC_*`. Store server secrets in Vercel environment secrets; rotate after suspected exposure.

## 15.5 Backup and Recovery

Production requires:

- Supabase database backups and point-in-time recovery when supported by the selected plan;
- a documented restore procedure and periodic restore test;
- Storage durability/backup strategy appropriate to source artwork availability;
- migration history sufficient to recreate schema, functions, grants, and policies.

A PostgreSQL backup alone does not restore Storage objects. Failed deployments must not require reconstructing purchases or entitlements.

## 15.6 Failure Behavior

- Database unavailable: show recoverable generic error; webhook returns a provider-appropriate failure so retry remains possible.
- Email unavailable: preserve paid purchase and entitlement; record failure; allow replacement-link send.
- Analytics unavailable: do not block copy, navigation, checkout, or access.
- Image delivery failure: preserve layout and keep text/actions usable.
- Unknown payment status: remain pending/unknown; never coerce to failed or paid for convenience.

---

# 16. Testing and Delivery Gates

## 16.1 Required Automated Checks

```text
locked install
→ typecheck
→ lint
→ database reset/migration checks
→ unit and integration tests
→ build
→ E2E smoke tests
```

Generated database types must match the migrated schema with no uncommitted drift.

## 16.2 High-Value Database and RLS Tests

- `anon` reads published metadata and published free content; Premium recipes and protected variables are separated from safe Prompt metadata.
- `anon` cannot read premium content/variables, purchases, buyer email, events, entitlements, tokens, sessions, or email deliveries.
- unauthenticated users cannot mutate content or Storage.
- verified admins can perform approved content operations.
- buyers receive no Supabase Auth identity.
- public roles cannot execute payment-completion RPC.
- the trusted backend can execute the RPC.
- duplicate events create one paid transition, one entitlement snapshot, and one token row.
- amount/currency/product mismatch rolls back the transaction.
- changing pack membership after purchase does not alter existing entitlement.

## 16.3 Application Integration Tests

- locked premium response contains no protected body or variable data;
- entitled response returns protected content only after server authorization;
- checkout ignores browser price/currency;
- browser redirect alone grants no access;
- payment reference without checkout claim grants no access;
- token exchange removes token from the URL;
- a buyer session cannot access another purchase;
- rotation invalidates the old token without removing entitlement;
- suspended entitlement blocks premium access;
- email failure does not invalidate purchase or entitlement;
- public metadata, OpenGraph, structured data, and hydration payload contain no premium body.

## 16.4 Critical E2E Journeys

```text
Home → Explore → Free Prompt → Customize → Copy
Explore → Premium Prompt → Pack → Checkout
Verified Payment → Success → Open My Pack → Premium Prompt
Email Link → Token Exchange → Buyer Access
Expired Session → Recovery State
Admin Login → Create/Edit/Publish Prompt
Admin Create/Publish Pack
Admin Send Replacement Access Link
```

## 16.5 Quality Gates

Before release, verify critical routes on mobile and desktop for:

- LCP, INP, CLS, image decode, and bundle size;
- keyboard operation, focus management, and live status;
- reduced motion;
- no protected-content flash;
- private cache and noindex behavior;
- correct responsive image sizes and below-fold lazy loading;
- restore procedure for durable business records.

---

# 17. MVP Implementation Sequence

## Phase 1 — Foundation

- Initialize Next.js, TypeScript, Tailwind CSS v4, HeroUI v3, lint, and tests.
- Import `tailwindcss` before `@heroui/styles`; define RenderBank semantic `oklch` theme tokens without adding `HeroUIProvider`.
- Configure local Supabase and isolated remote projects.
- Create migrations for schema, grants, RLS, RPC, and seed data.
- Generate TypeScript database types.
- Create separate browser, server, and service-role Supabase clients.
- Configure public Storage reads, deny direct object mutations, and authorize validated server uploads for active Admins.

## Phase 2 — Public Discovery

- Implement public shell, home, category, explore, prompt cards, search/filter, caching, image delivery, and SEO.
- Validate `anon` can see only safe published data.

## Phase 3 — Prompt Detail and Admin

- Implement free and locked prompt states, Variable Editor, copy actions, and protected data boundary.
- Configure Supabase Auth admin-only flow.
- Build content/pack CRUD, upload validation, publish workflow, and cache revalidation.

## Phase 4 — Commerce

- Implement pack detail, checkout claim, payment adapter, provider checkout, verified webhook, atomic completion RPC, and payment status UI.
- Verify idempotency and mismatch rollback before connecting live credentials.

## Phase 5 — Secure Access

- Implement entitlement snapshot, token generation/hash, email delivery, token exchange, buyer session, `/access`, and per-request premium authorization.
- Add rotate, revoke, suspend, and replacement-link admin operations.

## Phase 6 — Launch Hardening

- Add rate limits, headers, analytics, error monitoring, accessibility QA, performance QA, E2E tests, and restore verification.

---

# 18. Deferred Decisions and Revisit Triggers

Payment, transactional email, analytics, and error-monitoring providers remain implementation decisions. Choose them based on Indonesia support, global direction, webhook reliability, cost, latency, and operational simplicity.

Revisit architecture only when evidence appears:

| Future Change | Revisit Trigger |
|---|---|
| Buyer accounts/library | Repeat purchases make accountless access materially confusing |
| Dedicated search | PostgreSQL relevance or latency misses measured product targets |
| Queue/background worker | Retries or asynchronous volume exceed simple provider retry + durable status handling |
| Realtime | A validated feature requires live shared state |
| Separate services | Independent scaling/deployment need is measured, not anticipated |
| Additional admin roles | Non-admin authenticated actors or multiple permission levels are introduced |
| Storage/image provider change | Supabase delivery quality, capability, or economics fail measured requirements |

These are migration triggers, not MVP scaffolding requirements.

---

# 19. Launch Invariants

The following are launch-blocking:

1. Public visitors do not need an account.
2. Supabase Auth is admin-only; buyers use purchase-scoped sessions.
3. Public discovery is server-rendered and cache-friendly.
4. Public JavaScript is limited to interactive islands.
5. Premium content is separated from public metadata and authorized before render.
6. No protected body enters unauthorized HTML, metadata, structured data, client props, logs, or analytics.
7. RLS is enabled on every exposed table; public roles receive least privilege.
8. The secret/service-role client is server-only and narrowly used.
9. Client price, currency, and payment status are never authoritative.
10. Browser redirect and public payment reference are never payment proof or access credentials.
11. Payment completion requires a verified provider event and an atomic, idempotent database transition.
12. Amount, currency, product, and state must match before `PAID`.
13. Entitlement is a durable purchase-time snapshot and is not silently changed by later pack edits.
14. Raw access tokens and checkout claims are high entropy, hash-stored, and never logged.
15. Token exchange removes the raw token from the URL and creates a shorter purchase-scoped session.
16. Each premium request re-checks active session and entitlement server-side.
17. Purchases sharing an email are not automatically merged.
18. Email failure cannot undo paid state or entitlement.
19. Preview Storage contains no premium content or credentials.
20. Images reserve layout, use responsive delivery, and lazy-load below the fold.
21. Standard motion is lightweight and respects reduced motion.
22. Private/payment/access/admin routes are `no-store` and `noindex`.
23. Accessibility, mobile performance, security, and restore readiness are definition-of-done requirements.
24. No Realtime, Edge Functions, microservices, external search, or new architecture layer is added without a demonstrated need.

---

# 20. Reference Architecture Summary

```text
Public discovery
Browser → Next.js server render/cache → Supabase published safe data

Admin
Admin → Supabase Auth → server authorization → content mutation → cache revalidation

Payment
Checkout → provider → verified webhook → atomic Postgres RPC
                              └→ purchase + snapshot + token hash

Buyer access
Raw access link → token exchange → HttpOnly purchase session
                                  └→ server entitlement check → premium content

Artwork
Admin-validated upload → Supabase Storage → next/image responsive delivery
```

RenderBank MVP is a Supabase-backed modular monolith: simple to ship, inexpensive to operate, and strict where correctness matters. Scale-specific infrastructure is intentionally deferred until product usage proves the need.
