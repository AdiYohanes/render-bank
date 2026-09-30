# RenderBank Database Schema — Draft Design

**Document:** Database Schema  
**Product:** RenderBank  
**Version:** 0.2  
**Status:** Draft for Review  
**Target Database:** Supabase PostgreSQL  
**Architecture Style:** Server-authoritative modular monolith  
**Depends On:** `docs/product/PRD.md`, `docs/product/SITEMAP.md`, `docs/experience/USER_FLOWS.md`, `docs/experience/SCREEN_REQUIREMENTS.md`, `docs/design/DESIGN.md`, `docs/design/HIGH_FIDELITY_UI.md`, `docs/engineering/TECHNICAL_ARCHITECTURE.md`

---

# 1. Purpose

Dokumen ini merancang database schema RenderBank MVP dengan fokus:

1. public browsing yang cepat;
2. admin CMS yang sederhana;
3. payment yang idempotent;
4. purchase-time entitlement snapshot;
5. secure accountless buyer access;
6. premium prompt yang tidak bocor ke unauthorized client;
7. compatibility dengan Supabase tanpa menjadikan Supabase client sebagai business-logic authority;
8. struktur yang cukup fleksibel untuk future accounts tanpa menambah scope MVP sekarang.

Schema ini adalah rancangan database, belum merupakan migration SQL final.

---

# 2. Core Database Principles

## 2.1 PostgreSQL is the Source of Truth

Supabase digunakan sebagai managed PostgreSQL infrastructure.

Business rules tetap dimiliki RenderBank server layer.

```text
Browser
   ↓
Next.js Server
   ↓
Application Services
   ↓
PostgreSQL / Supabase
```

Browser tidak menentukan:

- premium authorization;
- authoritative pack price;
- payment success;
- entitlement;
- token validity;
- admin authorization.

---

## 2.2 Buyer Does Not Have an Account

Buyer RenderBank tidak menggunakan Supabase Auth pada MVP.

```text
Purchase
+
Verified Payment
+
Entitlement
+
Secure Access Session
```

adalah identity/access model buyer.

Supabase Auth hanya digunakan untuk admin.

---

## 2.3 Purchase and Payment Are Different Concepts

`purchases` adalah business record RenderBank.

`payment_attempts` adalah attempt untuk membayar purchase tersebut.

`payment_events` adalah provider events/webhooks.

Dengan demikian retry payment tidak perlu membuat purchase baru secara otomatis.

---

## 2.4 Entitlement Is a Snapshot

Buyer mendapatkan prompt yang berada di pack pada saat payment berhasil diverifikasi.

```text
pack_prompts
      ↓
verified PAID
      ↓
purchase_entitlements
```

Setelah snapshot dibuat, perubahan `pack_prompts` tidak mengubah entitlement buyer lama.

---

## 2.5 Credentials Are Never Stored in Plaintext

Database tidak menyimpan raw:

- access token;
- buyer session token;
- payment credentials;
- provider secrets.

Access token dan buyer session disimpan dalam bentuk hash.

---

## 2.6 Avoid Hard Delete for Purchased Content

Prompt dan pack yang pernah menjadi bagian purchase sebaiknya tetap ada sebagai:

```text
UNPUBLISHED
UNLISTED
ARCHIVED
```

Foreign key dan application rules harus mencegah deletion yang merusak entitlement history.

---

# 3. High-Level Entity Map

```text
Supabase auth.users
        │
        ▼
 admin_profiles
        │
        ▼
 admin_audit_logs


categories ───────────────┐
models ─ prompt_models ───┤
tags ──── prompt_tags ────┤
use_cases ─ prompt_use_cases
                          │
                          ▼
                       prompts
                     ┌────┼───────────────┐
                     │    │               │
                     ▼    ▼               ▼
           prompt_variables        prompt_images
                                          │
                                          ▼
                                     media_assets

packs ─────────────────────────────────────┐
  │                                        │
  ├── cover_asset_id ──> media_assets      │
  │                                        │
  └── pack_prompts ─────────────────> prompts

prompts.primary_sales_pack_id ─────────> packs


packs
  │
  ▼
purchases
  ├── payment_attempts
  ├── payment_events
  ├── purchase_entitlements ───────> prompts
  ├── access_tokens
  ├── access_sessions
  └── email_deliveries
```

---

# 4. PostgreSQL Extensions

Recommended:

```text
pgcrypto
citext
pg_trgm
```

Purpose:

| Extension | Usage |
|---|---|
| `pgcrypto` | UUID/random/hash helpers where appropriate |
| `citext` | case-insensitive email handling if selected |
| `pg_trgm` | fast fuzzy/partial MVP search |

Use extensions only where required by actual implementation.

---

# 5. ID Strategy

Internal entity IDs:

```text
UUID
DEFAULT gen_random_uuid()
```

Use UUID for:

- prompts;
- packs;
- categories;
- purchases;
- payment attempts;
- access token records;
- sessions;
- media assets.

Do not expose internal UUID as security credential.

Public payment lookup uses a separate high-entropy opaque reference.

Access uses separate random token material whose hash is stored in the database.

---

# 6. Shared Timestamp Rules

Mutable domain tables generally contain:

```text
created_at timestamptz NOT NULL DEFAULT now()
updated_at timestamptz NOT NULL DEFAULT now()
```

`updated_at` should be maintained by a shared trigger or application layer.

Immutable event/audit rows generally use only:

```text
created_at
received_at
processed_at
```

and should not be rewritten unnecessarily.

---

# 7. Enums / Controlled States

Recommended PostgreSQL enums or equivalent CHECK constraints:

```text
prompt_access_type
- FREE
- PACK_ONLY

prompt_status
- DRAFT
- PUBLISHED
- UNPUBLISHED
- ARCHIVED
- UNLISTED

pack_status
- DRAFT
- PUBLISHED
- UNLISTED
- ARCHIVED

content_status
- ACTIVE
- ARCHIVED

orientation
- PORTRAIT
- LANDSCAPE
- SQUARE

payment_status
- PROCESSING
- PAID
- FAILED
- CANCELLED

payment_attempt_status
- CREATED
- PROCESSING
- SUCCEEDED
- FAILED
- CANCELLED
- EXPIRED

payment_event_status
- RECEIVED
- PROCESSED
- IGNORED
- FAILED

entitlement_status
- ACTIVE
- SUSPENDED

entitlement_source
- PACK_SNAPSHOT
- FREE_UPDATE

access_token_status
- ACTIVE
- ROTATED
- REVOKED

email_delivery_status
- QUEUED
- SENT
- DELIVERED
- FAILED

email_purpose
- ACCESS_LINK

admin_role
- ADMIN
```

`FREE_UPDATE` is retained as a future-compatible value. MVP entitlement creation uses `PACK_SNAPSHOT`.

---

# 8. Admin Identity

Supabase Auth owns admin credentials and authentication identity.

Do not create custom admin password tables.

## 8.1 admin_profiles

```text
admin_profiles
- user_id uuid PRIMARY KEY
- role admin_role NOT NULL DEFAULT ADMIN
- display_name text nullable
- is_active boolean NOT NULL DEFAULT true
- created_at timestamptz
- updated_at timestamptz
```

Relation:

```text
admin_profiles.user_id
→ auth.users.id
```

Admin authorization requires:

```text
valid Supabase Auth session
+
admin_profiles.is_active = true
```

---

# 9. Admin Audit Log

Sensitive admin operations must have an internal audit trail.

## admin_audit_logs

```text
admin_audit_logs
- id uuid PRIMARY KEY
- actor_user_id uuid NOT NULL
- action text NOT NULL
- entity_type text NOT NULL
- entity_id uuid nullable
- reason text nullable
- metadata jsonb NOT NULL DEFAULT '{}'
- created_at timestamptz NOT NULL DEFAULT now()
```

Examples:

```text
PROMPT_PUBLISHED
PROMPT_UNPUBLISHED
PACK_ARCHIVED
ACCESS_TOKEN_ROTATED
ACCESS_TOKEN_REVOKED
ENTITLEMENT_SUSPENDED
ACCESS_EMAIL_RESENT
```

`metadata` must contain only safe internal metadata, never raw token or payment credential.

Audit rows should be append-only from the application perspective.

---

# 10. Categories

## categories

```text
categories
- id uuid PRIMARY KEY
- slug text UNIQUE NOT NULL
- name text NOT NULL
- description text nullable
- status content_status NOT NULL DEFAULT ACTIVE
- sort_order integer NOT NULL DEFAULT 0
- created_at
- updated_at
```

Rules:

- slug lowercase and URL-safe;
- category with content should be archived rather than hard-deleted;
- unpublished/empty categories are not exposed publicly.

Recommended slug rule:

```text
^[a-z0-9]+(?:-[a-z0-9]+)*$
```

---

# 11. AI Models

## models

```text
models
- id uuid PRIMARY KEY
- slug text UNIQUE NOT NULL
- name text NOT NULL
- provider_name text nullable
- status content_status NOT NULL DEFAULT ACTIVE
- sort_order integer NOT NULL DEFAULT 0
- created_at
- updated_at
```

Examples:

```text
gpt-image
gemini-image
midjourney
flux
```

Models are managed inline through prompt administration in MVP.

---

# 12. Tags

## tags

```text
tags
- id uuid PRIMARY KEY
- slug text UNIQUE NOT NULL
- name text NOT NULL
- created_at
```

Tags are lightweight taxonomy.

No dedicated public route is required.

---

# 13. Use Cases

Normalize use cases because they participate in search/discovery and may be shared across prompts.

## use_cases

```text
use_cases
- id uuid PRIMARY KEY
- slug text UNIQUE NOT NULL
- name text NOT NULL
- status content_status NOT NULL DEFAULT ACTIVE
- created_at
- updated_at
```

Examples:

```text
product-ad
social-post
marketplace-listing
editorial
campaign
```

No dedicated admin route is required for MVP; values can be managed inline.

---

# 14. Media Assets

Supabase Storage contains file bytes.

PostgreSQL stores durable metadata.

## media_assets

```text
media_assets
- id uuid PRIMARY KEY
- bucket text NOT NULL
- storage_path text UNIQUE NOT NULL
- mime_type text NOT NULL
- byte_size bigint NOT NULL
- width integer nullable
- height integer nullable
- blur_placeholder text nullable
- created_by uuid nullable
- created_at timestamptz NOT NULL DEFAULT now()
```

`created_by` may reference `auth.users.id`.

Rules:

- never store access tokens or premium prompt text in metadata;
- width/height are stored before rendering;
- storage path must not reveal secrets;
- public preview assets may live in a public-read bucket;
- private assets, if introduced later, must use a separate private bucket.

A separate derivative table is intentionally omitted from MVP unless image processing actually generates persistent variants.

---

# 15. Prompts

## prompts

```text
prompts
- id uuid PRIMARY KEY
- slug text UNIQUE NOT NULL
- title text NOT NULL
- short_description text NOT NULL
- description text nullable
- prompt_template text NOT NULL
- access_type prompt_access_type NOT NULL
- category_id uuid NOT NULL
- aspect_ratio text nullable
- orientation orientation nullable
- requires_reference_image boolean NOT NULL DEFAULT false
- generation_notes text nullable
- primary_sales_pack_id uuid nullable
- status prompt_status NOT NULL DEFAULT DRAFT
- last_tested_at timestamptz nullable
- published_at timestamptz nullable
- created_at
- updated_at
```

Relations:

```text
category_id → categories.id ON DELETE RESTRICT
primary_sales_pack_id → packs.id ON DELETE RESTRICT
```

Rules:

- published `PACK_ONLY` prompt requires a valid primary sales pack;
- its primary sales pack must contain the prompt in `pack_prompts`;
- the membership rule is validated in application/domain service or database trigger;
- premium prompt body is never exposed by unauthorized public query;
- slug changes after publish create a redirect record;
- `aspect_ratio` can support values such as `1:1`, `4:5`, `9:16`, `16:9`, or other valid ratios.

Recommended aspect ratio validation:

```text
^[1-9][0-9]*:[1-9][0-9]*$
```

Recommended publication constraint conceptually:

```text
status = PUBLISHED
AND access_type = PACK_ONLY
→ primary_sales_pack_id IS NOT NULL
```

---

# 16. Prompt Variables

## prompt_variables

```text
prompt_variables
- id uuid PRIMARY KEY
- prompt_id uuid NOT NULL
- key text NOT NULL
- label text NOT NULL
- description text nullable
- placeholder text nullable
- default_value text nullable
- required boolean NOT NULL DEFAULT false
- sort_order integer NOT NULL DEFAULT 0
- created_at
- updated_at
```

Constraints:

```text
UNIQUE(prompt_id, key)
```

Relation:

```text
prompt_id → prompts.id ON DELETE CASCADE
```

`sort_order` need not be unique. Render deterministically with `ORDER BY sort_order, id` so default values and concurrent inserts do not collide.

Visitor-entered values are ephemeral browser state and are not stored by default.

---

# 17. Prompt Images

## prompt_images

```text
prompt_images
- id uuid PRIMARY KEY
- prompt_id uuid NOT NULL
- media_asset_id uuid NOT NULL
- alt_text text NOT NULL
- focal_x numeric nullable
- focal_y numeric nullable
- sort_order integer NOT NULL DEFAULT 0
- is_primary boolean NOT NULL DEFAULT false
- created_at
```

Relations:

```text
prompt_id → prompts.id ON DELETE CASCADE
media_asset_id → media_assets.id ON DELETE RESTRICT
```

Recommended constraint:

```text
UNIQUE(prompt_id, media_asset_id)
```

Partial unique index:

```text
UNIQUE(prompt_id) WHERE is_primary = true
```

`sort_order` need not be unique. Render deterministically with `ORDER BY sort_order, id`.

---

# 18. Prompt ↔ Model

## prompt_models

```text
prompt_models
- prompt_id uuid NOT NULL
- model_id uuid NOT NULL
- relation_type text NOT NULL DEFAULT 'RECOMMENDED'
- sort_order integer NOT NULL DEFAULT 0
- created_at
```

Allowed relation types for MVP:

```text
RECOMMENDED
TESTED
```

Primary key / uniqueness:

```text
UNIQUE(prompt_id, model_id, relation_type)
prompt_id → prompts.id ON DELETE CASCADE
model_id → models.id ON DELETE RESTRICT
```

This supports recommended models while retaining the product requirement to document tested models.

---

# 19. Prompt ↔ Tags

## prompt_tags

```text
prompt_tags
- prompt_id uuid NOT NULL
- tag_id uuid NOT NULL
- created_at
```

Constraints:

```text
PRIMARY KEY(prompt_id, tag_id)
prompt_id → prompts.id ON DELETE CASCADE
tag_id → tags.id ON DELETE RESTRICT
```

---

# 20. Prompt ↔ Use Cases

## prompt_use_cases

```text
prompt_use_cases
- prompt_id uuid NOT NULL
- use_case_id uuid NOT NULL
- created_at
```

Constraints:

```text
PRIMARY KEY(prompt_id, use_case_id)
prompt_id → prompts.id ON DELETE CASCADE
use_case_id → use_cases.id ON DELETE RESTRICT
```

---

# 21. Prompt Slug Redirects

## prompt_slug_redirects

```text
prompt_slug_redirects
- id uuid PRIMARY KEY
- prompt_id uuid NOT NULL
- old_slug text UNIQUE NOT NULL
- created_at
```

Relation:

```text
prompt_id → prompts.id ON DELETE RESTRICT
```

Redirect history is durable; a prompt with published-slug history is archived instead of hard-deleted.

Used for permanent redirect:

```text
/prompts/[old-slug]
→ 301
→ /prompts/[current-slug]
```

---

# 22. Packs

## packs

```text
packs
- id uuid PRIMARY KEY
- slug text UNIQUE NOT NULL
- title text NOT NULL
- description text NOT NULL
- cover_asset_id uuid nullable
- price_minor bigint NOT NULL CHECK (price_minor >= 0)
- currency text NOT NULL CHECK (currency ~ '^[A-Z]{3}$')
- status pack_status NOT NULL DEFAULT DRAFT
- published_at timestamptz nullable
- created_at
- updated_at
```

Relation:

```text
cover_asset_id → media_assets.id ON DELETE RESTRICT
```

Rules:

- price uses minor units;
- never use floating point for money;
- archived pack is not purchasable;
- unlisted pack is removed from discovery;
- pack with historical purchases should not be hard-deleted.

Example:

```text
Rp59.000
→ price_minor = 59000
→ currency = IDR
```

---

# 23. Pack Membership

## pack_prompts

```text
pack_prompts
- pack_id uuid NOT NULL
- prompt_id uuid NOT NULL
- sort_order integer NOT NULL DEFAULT 0
- created_at
```

Constraints and relations:

```text
PRIMARY KEY(pack_id, prompt_id)
pack_id → packs.id ON DELETE CASCADE
prompt_id → prompts.id ON DELETE RESTRICT
```

`sort_order` need not be unique. Render deterministically with `ORDER BY sort_order, prompt_id`.

Rules:

- this table represents CURRENT pack composition;
- it is not buyer entitlement history;
- changing this table affects future buyers only;
- every insert, update, or delete acquires `SELECT ... FOR UPDATE` on the owning `packs` row first;
- the same pack-row lock is used by payment finalization before entitlement snapshot creation;
- mutations must revalidate any affected published prompt and pack before commit.

---

# 24. Pack Slug Redirects

## pack_slug_redirects

```text
pack_slug_redirects
- id uuid PRIMARY KEY
- pack_id uuid NOT NULL
- old_slug text UNIQUE NOT NULL
- created_at
```

Relation:

```text
pack_id → packs.id ON DELETE RESTRICT
```

Redirect history is durable; a pack with published-slug history is archived instead of hard-deleted.

Used for permanent redirect after published slug changes.

---

# 25. Purchases

A purchase record is created before or during payment initialization so RenderBank has a stable opaque reference for the browser payment journey.

## purchases

```text
purchases
- id uuid PRIMARY KEY
- public_reference text UNIQUE NOT NULL
- buyer_email_normalized citext NOT NULL
- pack_id uuid NOT NULL
- pack_title_snapshot text NOT NULL
- amount_minor bigint NOT NULL CHECK (amount_minor >= 0)
- currency text NOT NULL CHECK (currency ~ '^[A-Z]{3}$')
- payment_status payment_status NOT NULL DEFAULT PROCESSING
- entitlement_status entitlement_status NOT NULL DEFAULT ACTIVE
- paid_at timestamptz nullable
- CHECK ((payment_status = 'PAID') = (paid_at IS NOT NULL))
- created_at
- updated_at
```

Relations:

```text
pack_id → packs.id ON DELETE RESTRICT
```

`public_reference`:

- cryptographically random;
- high entropy;
- non-sequential;
- not access credential;
- safe only as opaque purchase lookup;
- never emitted to analytics.

`pack_title_snapshot` preserves what the buyer purchased even if pack title later changes.

Rules:

```text
PAID
→ paid_at IS NOT NULL
```

`pack_id`, `pack_title_snapshot`, `amount_minor`, and `currency` are immutable after purchase creation. Application layer controls allowed payment-state transitions.

---

# 26. Payment Attempts

One purchase may have more than one provider attempt because the buyer can retry after failure/cancellation/expiration.

## payment_attempts

```text
payment_attempts
- id uuid PRIMARY KEY
- purchase_id uuid NOT NULL
- provider text NOT NULL
- provider_attempt_id text nullable
- idempotency_key text UNIQUE NOT NULL
- amount_minor bigint NOT NULL CHECK (amount_minor >= 0)
- currency text NOT NULL CHECK (currency ~ '^[A-Z]{3}$')
- status payment_attempt_status NOT NULL DEFAULT CREATED
- expires_at timestamptz nullable
- created_at
- updated_at
```

Relation:

```text
purchase_id → purchases.id ON DELETE RESTRICT
```

Recommended partial unique index when provider reference exists:

```sql
CREATE UNIQUE INDEX payment_attempts_provider_attempt_uidx
ON payment_attempts (provider, provider_attempt_id)
WHERE provider_attempt_id IS NOT NULL;
```

Server always compares attempt amount/currency with authoritative purchase data. Attempt amount and currency are immutable after creation.

---

# 27. Payment Events / Webhook Idempotency

## payment_events

```text
payment_events
- id uuid PRIMARY KEY
- provider text NOT NULL
- provider_event_id text NOT NULL
- payment_attempt_id uuid nullable
- event_type text NOT NULL
- processing_status payment_event_status NOT NULL DEFAULT RECEIVED
- provider_payload_digest text nullable
- safe_metadata jsonb NOT NULL DEFAULT '{}'
- safe_error_code text nullable
- received_at timestamptz NOT NULL DEFAULT now()
- processed_at timestamptz nullable
```

Constraints and relation:

```text
UNIQUE(provider, provider_event_id)
payment_attempt_id → payment_attempts.id ON DELETE RESTRICT
```

The purchase is derived through `payment_attempts.purchase_id`; it is not duplicated on the event row. When an event resolves to an attempt, its provider must match `payment_attempts.provider` before any mutation.

Rules:

- verify webhook authenticity before state mutation;
- duplicate event is safely ignored;
- raw provider payload should not be persisted by default;
- if debug metadata is retained, it must be redacted/safe;
- browser redirect cannot set purchase to `PAID`.

---

# 28. Purchase Entitlements

This is the most important durability table for premium ownership.

## purchase_entitlements

```text
purchase_entitlements
- id uuid PRIMARY KEY
- purchase_id uuid NOT NULL
- prompt_id uuid NOT NULL
- source entitlement_source NOT NULL DEFAULT PACK_SNAPSHOT
- granted_at timestamptz NOT NULL DEFAULT now()
- revoked_at timestamptz nullable
```

Relations:

```text
purchase_id → purchases.id ON DELETE RESTRICT
prompt_id → prompts.id ON DELETE RESTRICT
```

Constraint:

```text
UNIQUE(purchase_id, prompt_id)
```

Creation flow:

```text
Verified payment becomes PAID
        ↓
BEGIN TRANSACTION
        ↓
lock/read purchase
        ↓
lock/read owning pack using SELECT ... FOR UPDATE
        ↓
if not already PAID:
    update purchase
        ↓
read current pack_prompts while pack lock is held
        ↓
insert purchase_entitlements
ON CONFLICT DO NOTHING
        ↓
ensure active access token exists
        ↓
COMMIT
```

Authorization MUST query this snapshot rather than current `pack_prompts`.

---

# 29. Access Tokens

Only token hashes are stored.

## access_tokens

```text
access_tokens
- id uuid PRIMARY KEY
- purchase_id uuid NOT NULL
- token_hash bytea UNIQUE NOT NULL
- status access_token_status NOT NULL DEFAULT ACTIVE
- rotated_from_token_id uuid nullable
- created_at timestamptz NOT NULL DEFAULT now()
- last_used_at timestamptz nullable
- revoked_at timestamptz nullable
```

Relations:

```text
purchase_id → purchases.id ON DELETE RESTRICT
(rotated_from_token_id, purchase_id)
  → access_tokens(id, purchase_id)
```

The composite self-reference requires a candidate key on `access_tokens(id, purchase_id)` and prevents rotation lineage from crossing purchases.

Required partial unique index:

```sql
CREATE UNIQUE INDEX access_tokens_one_active_per_purchase_uidx
ON access_tokens (purchase_id)
WHERE status = 'ACTIVE';
```

Raw token:

```text
generated server-side
↓
emailed / used on access URL
↓
never persisted
```

Token rotation uses one transaction:

```text
lock purchase/token
old token → ROTATED
new token hash inserted → ACTIVE
entitlement unchanged
commit
```

Token revocation:

```text
token → REVOKED
entitlement unchanged
```

---

# 30. Buyer Access Sessions

Buyer sessions are custom RenderBank sessions, not Supabase Auth users.

## access_sessions

```text
access_sessions
- id uuid PRIMARY KEY
- purchase_id uuid NOT NULL
- session_hash bytea UNIQUE NOT NULL
- created_at timestamptz NOT NULL DEFAULT now()
- expires_at timestamptz NOT NULL
- last_seen_at timestamptz nullable
- revoked_at timestamptz nullable
```

Relation:

```text
purchase_id → purchases.id ON DELETE RESTRICT
```

Cookie contains raw random session material.

Database contains only its hash.

Session is valid when:

```text
session exists
AND revoked_at IS NULL
AND expires_at > now()
AND purchase.entitlement_status = ACTIVE
```

One session resolves to one purchase only.

Purchases sharing an email are never automatically combined.

---

# 31. Email Delivery Records

Needed for admin purchase operations and resend visibility.

## email_deliveries

```text
email_deliveries
- id uuid PRIMARY KEY
- purchase_id uuid NOT NULL
- purpose email_purpose NOT NULL DEFAULT ACCESS_LINK
- recipient_email_normalized citext NOT NULL
- provider text NOT NULL
- provider_message_id text nullable
- status email_delivery_status NOT NULL DEFAULT QUEUED
- attempt_number integer NOT NULL DEFAULT 1
- safe_error_code text nullable
- created_at timestamptz NOT NULL DEFAULT now()
- sent_at timestamptz nullable
- delivered_at timestamptz nullable
- failed_at timestamptz nullable
```

Relation:

```text
purchase_id → purchases.id ON DELETE RESTRICT
```

No raw access token should be persisted inside delivery logs.

The generated email body may contain the raw token at send time in memory, but database records only delivery state.

---

# 32. Search Architecture in Database

MVP inventory is small enough to remain PostgreSQL-native.

Search sources:

```text
prompts.title
prompts.short_description
prompts.description
categories.name
tags.name
use_cases.name
```

Never include unauthorized premium `prompt_template` in public search index/query result.

Recommended first implementation:

```text
pg_trgm
+
indexed normalized text
+
relational filters
```

No dedicated Elasticsearch/Meilisearch service in MVP.

Future full-text search can be introduced behind the same application search service.

---

# 33. Recommended Indexes

## Content

```text
UNIQUE categories(slug)
UNIQUE models(slug)
UNIQUE tags(slug)
UNIQUE use_cases(slug)

UNIQUE prompts(slug)
INDEX prompts(status, published_at DESC)
INDEX prompts(category_id, status, published_at DESC)
INDEX prompts(access_type, status)
INDEX prompts(orientation, status)
INDEX prompts(primary_sales_pack_id)

GIN / trigram index prompts(title)
GIN / trigram index prompts(short_description)
```

## Prompt relationships

```text
UNIQUE prompt_variables(prompt_id, key)
UNIQUE prompt_images(prompt_id, media_asset_id)
UNIQUE prompt_images(prompt_id) WHERE is_primary = true

INDEX prompt_variables(prompt_id, sort_order, id)
INDEX prompt_images(prompt_id, sort_order, id)
INDEX prompt_models(model_id, prompt_id)
INDEX prompt_tags(tag_id, prompt_id)
INDEX prompt_use_cases(use_case_id, prompt_id)
```

## Packs

```text
UNIQUE packs(slug)
INDEX packs(status, published_at DESC)

PRIMARY KEY pack_prompts(pack_id, prompt_id)
INDEX pack_prompts(pack_id, sort_order, prompt_id)
INDEX pack_prompts(prompt_id, pack_id)
```

## Purchases

```text
UNIQUE purchases(public_reference)
INDEX purchases(buyer_email_normalized)
INDEX purchases(payment_status, created_at DESC)
INDEX purchases(pack_id, created_at DESC)
```

## Payment

```text
INDEX payment_attempts(purchase_id, created_at DESC)
UNIQUE payment_attempts(idempotency_key)
UNIQUE payment_attempts(provider, provider_attempt_id)
  WHERE provider_attempt_id IS NOT NULL
UNIQUE payment_events(provider, provider_event_id)
INDEX payment_events(payment_attempt_id, received_at DESC)
```

## Entitlements

```text
UNIQUE purchase_entitlements(purchase_id, prompt_id)
INDEX purchase_entitlements(prompt_id, purchase_id)
```

## Access

```text
UNIQUE access_tokens(token_hash)
UNIQUE access_tokens(id, purchase_id)
UNIQUE access_tokens(purchase_id) WHERE status = 'ACTIVE'

UNIQUE access_sessions(session_hash)
INDEX access_sessions(purchase_id, expires_at)
INDEX access_sessions(expires_at)
```

## Operations

```text
INDEX email_deliveries(purchase_id, created_at DESC)
INDEX admin_audit_logs(entity_type, entity_id, created_at DESC)
INDEX admin_audit_logs(actor_user_id, created_at DESC)
```

Do not add indexes speculatively to every column. Validate indexes using real query plans as inventory grows.

---

# 34. Foreign-Key Delete Policy

Recommended philosophy:

## Explicit foreign-key matrix

```text
admin_profiles.user_id → auth.users.id ON DELETE RESTRICT
admin_audit_logs.actor_user_id → auth.users.id ON DELETE RESTRICT
media_assets.created_by → auth.users.id ON DELETE SET NULL

prompts.category_id → categories.id ON DELETE RESTRICT
prompts.primary_sales_pack_id → packs.id ON DELETE RESTRICT
prompt_variables.prompt_id → prompts.id ON DELETE CASCADE
prompt_images.prompt_id → prompts.id ON DELETE CASCADE
prompt_images.media_asset_id → media_assets.id ON DELETE RESTRICT
prompt_models.prompt_id → prompts.id ON DELETE CASCADE
prompt_models.model_id → models.id ON DELETE RESTRICT
prompt_tags.prompt_id → prompts.id ON DELETE CASCADE
prompt_tags.tag_id → tags.id ON DELETE RESTRICT
prompt_use_cases.prompt_id → prompts.id ON DELETE CASCADE
prompt_use_cases.use_case_id → use_cases.id ON DELETE RESTRICT
prompt_slug_redirects.prompt_id → prompts.id ON DELETE RESTRICT

packs.cover_asset_id → media_assets.id ON DELETE RESTRICT
pack_prompts.pack_id → packs.id ON DELETE CASCADE
pack_prompts.prompt_id → prompts.id ON DELETE RESTRICT
pack_slug_redirects.pack_id → packs.id ON DELETE RESTRICT

purchases.pack_id → packs.id ON DELETE RESTRICT
payment_attempts.purchase_id → purchases.id ON DELETE RESTRICT
payment_events.payment_attempt_id → payment_attempts.id ON DELETE RESTRICT
purchase_entitlements.purchase_id → purchases.id ON DELETE RESTRICT
purchase_entitlements.prompt_id → prompts.id ON DELETE RESTRICT
access_tokens.purchase_id → purchases.id ON DELETE RESTRICT
access_sessions.purchase_id → purchases.id ON DELETE RESTRICT
email_deliveries.purchase_id → purchases.id ON DELETE RESTRICT
```

`access_tokens` additionally uses the same-purchase composite self-reference defined in section 29.

## Cascading child configuration

Configuration children may cascade only where their parent itself is legally deletable. Application rules still prohibit hard deletion of prompts/packs referenced by history.

## Business-history records

Never cascade-delete business history:

```text
purchases
purchase_entitlements
payment_attempts
payment_events
access_tokens
access_sessions
email_deliveries
admin_audit_logs
```

For prompts/packs referenced by entitlement/purchase history:

```text
ON DELETE RESTRICT
```

Prefer lifecycle state changes over deletion.

---

# 35. RLS Strategy

All application tables should have RLS enabled as defense in depth.

However RenderBank does not need to expose the database directly to public browser code.

Recommended MVP policy:

```text
anon
→ no direct domain-table access

authenticated non-admin
→ no domain-table access

Next.js server with service role
→ database operations

Supabase Auth admin
→ identity only
→ business operations still pass through Next.js server
```

This keeps one business-rule boundary.

Important:

- Supabase service-role key is server-only;
- never expose service-role key to browser;
- admin Auth JWT is validated by server;
- `admin_profiles` determines whether authenticated user is an active RenderBank admin.

If direct Supabase browser queries are introduced later, explicit narrow RLS policies must be designed first.

---

# 36. Supabase Storage Policy

Recommended buckets:

```text
renderbank-public
```

Contains:

- prompt preview images;
- pack covers;
- public artwork.

Read:

```text
public
```

Write:

```text
admin only / signed server-controlled upload
```

Future private bucket may be created only if RenderBank introduces non-public binary assets.

Access credentials must never appear in storage object metadata.

---

# 37. Premium Prompt Data Boundary

The presence of `prompt_template` in the database does not mean it may be returned to every application request.

Repository/service contract:

```text
getPublicPrompt(slug)
→ safe metadata only for PACK_ONLY

getAuthorizedPrompt(slug, purchaseId)
→ verifies purchase_entitlements
→ returns protected prompt body only if entitled
```

Avoid data access patterns such as:

```text
SELECT * FROM prompts
```

on public route services.

Use explicit projections.

---

# 38. Recommended Public Data Projection

Example public prompt projection:

```text
id
slug
title
short_description
category
models
aspect_ratio
orientation
access_type
status
preview_images
primary_sales_pack
```

Do NOT return for unauthorized premium prompt:

```text
prompt_template
protected variable details
premium-only generation notes
buyer data
access data
```

---

# 39. Payment Transaction Boundary

When verified payment becomes newly `PAID`, use one DB transaction.

Concept:

```text
BEGIN

SELECT purchase FOR UPDATE
SELECT owning pack FOR UPDATE

if already PAID:
    COMMIT / no-op

else:
    UPDATE purchase → PAID

    INSERT entitlement snapshot
      FROM current pack_prompts while pack lock is held
      ON CONFLICT DO NOTHING

    ensure one ACTIVE access token record

COMMIT
```

Every `pack_prompts` mutation acquires the same owning-pack lock before changing composition. This serializes the entitlement snapshot with pack edits without introducing pack-version tables.

Email delivery happens after durable database commit.

Email failure does not roll back a valid purchase.

---

# 40. Entitlement Suspension

Suspending entitlement is a purchase-level action.

```text
purchases.entitlement_status
ACTIVE → SUSPENDED
```

The same transaction must:

```text
lock purchase
update entitlement_status → SUSPENDED
optionally revoke active access_sessions
insert admin_audit_logs with action = ENTITLEMENT_SUSPENDED
commit
```

The administrative reason is mandatory and nonblank for this action. Enforce it with a conditional CHECK where the action vocabulary is constrained, or with the same transaction/service plus a constraint trigger.

Recommended session response:

- newly requested protected content is denied immediately;
- active buyer sessions may be revoked as part of the suspension transaction/service.

Token revoke/rotate does NOT change entitlement state.

---

# 41. Prompt Publish Invariants

Before a prompt can be `PUBLISHED`, server validates:

```text
title exists
slug valid
short description exists
prompt template exists
category active
at least one usable preview image
at least one recommended/tested model as required by content policy
variables internally valid
```

Additionally for:

```text
access_type = PACK_ONLY
```

require:

```text
primary_sales_pack_id exists
AND
pack_prompts contains (primary_sales_pack_id, prompt_id)
```

These are domain validation rules even if not all can be expressed as simple SQL CHECK constraints.

They must remain true after publication. Publishing and any mutation of category status, prompt images, prompt-model relations, primary pack, or relevant `pack_prompts` rows must run through one transactional service that:

1. locks affected prompt and pack rows in a consistent order;
2. applies the mutation;
3. revalidates every affected published prompt and pack immediately before commit.

Deferred constraint triggers may provide the same guarantee if direct database writes must be supported.

---

# 42. Pack Publish Invariants

Before pack becomes `PUBLISHED`:

```text
title exists
slug valid
description exists
price_minor >= 0
currency valid
cover exists
contains publishable premium prompts
```

These invariants must remain true after publication. Pack cover, price/currency, membership, prompt publication state, and prompt access-type mutations use the same locked transactional validation described above.

Archiving:

```text
status → ARCHIVED
```

does not touch:

```text
purchases
purchase_entitlements
access_tokens
```

---

# 43. Slug Lifecycle

Published content should keep stable slugs.

When slug changes:

```text
old slug
↓
slug_redirect table
↓
new canonical slug
```

Current and historical slugs share one uniqueness namespace per route type. Independent unique constraints on `prompts.slug` and `prompt_slug_redirects.old_slug` (or the equivalent pack tables) are insufficient because they permit cross-table collisions.

MVP enforcement uses transaction-safe constraint triggers:

```text
prompt slug write
→ lock a fixed advisory key for the prompt-slug namespace
→ reject if slug exists in prompts.slug or prompt_slug_redirects.old_slug

pack slug write
→ lock a fixed advisory key for the pack-slug namespace
→ reject if slug exists in packs.slug or pack_slug_redirects.old_slug
```

The trigger runs on inserts and slug updates in both the current and redirect tables. Slug changes insert the redirect and update the canonical row in the same transaction. Never reuse an old published slug for another entity while redirect history still exists.

A shared slug-registry table is the upgrade path if more route types later need the same behavior.

---

# 44. Money Rules

All money is stored as integer minor units.

```text
amount_minor bigint CHECK (amount_minor >= 0)
price_minor bigint CHECK (price_minor >= 0)
currency text CHECK (currency ~ '^[A-Z]{3}$')
```

Examples:

```text
IDR 59,000 → 59000
USD 9.99   → 999
```

Provider-specific conversion logic belongs to payment adapter, not schema semantics.

---

# 45. Email Normalization

Normalize before persistence:

```text
trim
lowercase where appropriate for identity comparison
```

Recommended field:

```text
buyer_email_normalized citext
```

Do not automatically merge purchases by email.

The field supports:

- purchase lookup by admin;
- future verified account migration;
- email delivery.

It is not a login credential.

---

# 46. Analytics Data

Do not duplicate product analytics into relational business tables unless operationally required.

External/lightweight analytics handles:

```text
prompt_viewed
prompt_copied
prompt_shared
search_performed
filter_applied
pack_viewed
checkout_started
purchase_completed
purchase_failed
```

Never send:

```text
buyer email
access token
session token
purchase public_reference
payment reference
raw premium prompt
visitor variable values
```

to analytics.

---

# 47. Data Retention / PII Boundary

Personally identifiable business data is concentrated mainly in:

```text
purchases.buyer_email_normalized
email_deliveries.recipient_email_normalized
```

Access/session credentials are hashed.

Payment credentials are not stored.

Logs and audit metadata should reference internal entity IDs rather than duplicating buyer email where possible.

---

# 48. Recommended Migration Order

```text
001_extensions
002_enums
003_shared_timestamp_functions

010_admin_profiles
011_admin_audit_logs

020_categories
021_models
022_tags
023_use_cases
024_media_assets

030_prompts
031_prompt_variables
032_prompt_images
033_prompt_models
034_prompt_tags
035_prompt_use_cases
036_prompt_slug_redirects

040_packs
041_pack_prompts
042_pack_slug_redirects
043_prompt_primary_pack_fk_or_validation
044_slug_namespace_constraint_triggers
045_publication_invariant_triggers_or_guard_functions

050_purchases
051_payment_attempts
052_payment_events
053_purchase_entitlements

060_access_tokens
061_access_sessions
062_email_deliveries
063_commerce_guard_functions

070_indexes
071_search_indexes
080_rls
081_storage_policies
090_seed_reference_data
```

The exact numbering may change during implementation.

---

# 49. Initial Seed Data

Seed only stable reference data.

Recommended:

```text
categories
models
common use cases
```

Do not seed:

```text
fake purchases
fake access tokens
production admin passwords
provider credentials
```

Admin Supabase Auth identity should be provisioned separately and linked to `admin_profiles`.

---

# 50. MVP Tables Summary

## Identity / Operations

```text
admin_profiles
admin_audit_logs
```

## Taxonomy / Content

```text
categories
models
tags
use_cases
media_assets

prompts
prompt_variables
prompt_images
prompt_models
prompt_tags
prompt_use_cases
prompt_slug_redirects
```

## Commerce

```text
packs
pack_prompts
pack_slug_redirects

purchases
payment_attempts
payment_events
purchase_entitlements
```

## Access

```text
access_tokens
access_sessions
email_deliveries
```

Total domain tables:

```text
24
```

This is intentionally relational and explicit rather than placing core business data into large JSON blobs.

---

# 51. Tables Explicitly Not Needed for MVP

Do not create yet:

```text
users
profiles
favorites
saved_prompts
subscriptions
subscription_plans
user_libraries
creator_profiles
creator_payouts
reviews
ratings
comments
recommendations
prompt_versions
entitlement_updates UI/workflow
bundles
```

Future functionality can add them when validated.

---

# 52. Main Authorization Query

Conceptually:

```sql
SELECT 1
FROM purchase_entitlements pe
JOIN purchases p
  ON p.id = pe.purchase_id
WHERE pe.purchase_id = :purchase_id
  AND pe.prompt_id = :prompt_id
  AND pe.revoked_at IS NULL
  AND p.payment_status = 'PAID'
  AND p.entitlement_status = 'ACTIVE'
LIMIT 1;
```

This is the source of truth for premium prompt authorization.

Do not authorize by:

```text
email
current pack membership
presence of access token in URL
client state
```

---

# 53. Main Public Prompt Query Principle

Free:

```text
PUBLISHED
+
FREE
→ may return full prompt
```

Premium locked:

```text
PUBLISHED
+
PACK_ONLY
+
no entitlement
→ safe metadata only
```

Premium entitled:

```text
PACK_ONLY
+
valid access session
+
purchase_entitlements match
+
purchase ACTIVE
→ protected body
```

An unpublished/unlisted prompt may still be returned to an entitled buyer even though it is removed from public discovery.

---

# 54. Purchase Snapshot Example

Current pack:

```text
Product Ads Vol. 01

A
B
C
D
```

Buyer purchases.

Database:

```text
purchase_entitlements

purchase_001 | A
purchase_001 | B
purchase_001 | C
purchase_001 | D
```

Later current pack becomes:

```text
A
B
C
E
```

Old buyer remains:

```text
A
B
C
D
```

New buyer receives:

```text
A
B
C
E
```

No historical pack-version table is necessary for MVP because `purchase_entitlements` itself is the durable membership snapshot.

---

# 55. Recommended Next Step

After approval of this schema design:

```text
DATABASE_SCHEMA.md
        ↓
SUPABASE_MIGRATIONS / SQL
        ↓
API_CONTRACT.md
        ↓
IMPLEMENTATION_PLAN.md
```

The next technical artifact should convert this design into exact PostgreSQL/Supabase migrations including:

- enum creation;
- tables;
- foreign keys;
- CHECK constraints;
- partial unique indexes;
- triggers;
- RLS enablement;
- storage policies;
- initial reference data.
