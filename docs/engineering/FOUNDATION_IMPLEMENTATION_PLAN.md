# RenderBank Foundation Implementation Plan

**Parent:** [#1 — Establish the RenderBank MVP foundation](https://github.com/AdiYohanes/render-bank/issues/1)
**Status:** Slice 0 contract proposed locally; #5 upload-policy wording needs review; implementation issues #2–#8 are open
**Review unit:** One existing GitHub sub-issue and one PR per implementation slice

## Context

Issue #1 spans starter cleanup, Supabase, public data, Admin policies, Buyer persistence, payment atomicity, and a clean-checkout gate. Splitting these boundaries keeps reviews focused. No Home/discovery screen, Admin UI, checkout page, provider integration, email sending, or Buyer access route belongs in this foundation.

The approved architecture and the former schema draft disagreed on protected Prompt content, public reads, Admin identity, and Storage. **Contract prerequisite (Slice 0):** reconcile and review these in [`DATABASE_SCHEMA.md`](DATABASE_SCHEMA.md) and [`TECHNICAL_ARCHITECTURE.md`](TECHNICAL_ARCHITECTURE.md) before SQL implementation. The contract adds `prompt_contents`, keeps `prompts` metadata safe, uses active `admin_profiles` for manually provisioned Admins, names `prompt-previews`, and defines the narrow payment-completion RPC. Versioned migrations become the executable source of truth as they land.

Issues [#2](https://github.com/AdiYohanes/render-bank/issues/2)–[#8](https://github.com/AdiYohanes/render-bank/issues/8) **already exist and are linked to #1**. Do not create another set of sub-issues. Slice 0 is a documentation prerequisite on its own branch; after review, implement the existing children in their dependency order.

## Dependency map

```text
0 Contract documentation
└── #2 RenderBank shell
    └── #3 Free Prompt data + local Supabase + clients
        └── #4 Premium Prompt + Pack metadata
            ├── #5 Admin + artwork ───────────────────┐
            └── #6 Buyer persistence ── #7 Paid RPC ──┴── #8 Delivery gate
```

The GitHub dependencies are **#3 after #2; #4 after #3; #5 and #6 after #4; #7 after #6; #8 after #5 and #7**. Only #5 and #6 are naturally parallel. Keep every intermediate PR green and avoid duplicate changes to migrations, generated types, or `package-lock.json`.

## Slice 0 — Finalize the persistence/security contract

**Type:** Documentation-only prerequisite; no extra GitHub issue.

- Promote the schema draft to [`DATABASE_SCHEMA.md`](DATABASE_SCHEMA.md); update `CLAUDE.md` and [`docs/README.md`](../README.md) routing without replacing unrelated user edits.
- Separate published safe Prompt metadata from Free-or-protected recipe data; restrict Premium variables as a unit. Define explicit public, active-Admin, and trusted-role access.
- Align local Demo Content, publication states, Admin Auth plus active profile, the `prompt-previews` bucket, and the 25-table model.
- Specify `complete_paid_purchase` inputs, output, grants, verified status, allowed transitions, event deduplication, snapshot lock, and rollback behavior in the schema document; point architecture to it.
- Align this plan to existing issues #2–#8 and assign each parent story once (table below).

**Acceptance:** no unresolved architecture/schema contradiction for these boundaries; documentation links resolve; all 44 parent stories have one owner. For #5, “authenticated-Admin-write policies” means active Admin authorization for approved content rows; object and asset writes are trusted-server-only after image-byte validation. Direct Admin JWT Storage writes bypass validation and remain denied. **Verify:** cross-reference the affected documents and mechanically validate story coverage; `git diff --check`.

## #2 — Replace starter with a verifiable RenderBank shell

**Scope:** Render a minimal English RenderBank status shell; remove starter copy, outbound template links, demo routes, theme switch, and dark-mode behavior. Add approved light-only semantic tokens, Inter/system typography, 4px spacing, radii, visible keyboard focus, and reduced-motion support. Establish non-mutating lint/typecheck/test/build commands and a minimal production root smoke check here, not in #8.

**Files:** `app/layout.tsx`, `app/page.tsx`, `styles/globals.css`, `config/site.ts`, starter-only routes/components, `package.json`, `package-lock.json`, smoke check.

**Done when:** production root responds with RenderBank identity, excludes starter branding, and has no Phase 2 product screen. **Verify:** lint check, typecheck, production build, root smoke, keyboard/reduced-motion check.

## #3 — Establish public Free Prompt data boundary

**Depends on:** #2.

**Scope:** Add local Supabase config, versioned SQL migrations, deterministic Free Prompt Demo Content, `.env.example`, generated `Database` types, and documented start/reset/type commands. Model taxonomy, media metadata, safe `prompts`, protected `prompt_contents`, variables, images, and relationships. Enable deny-by-default grants/RLS on every introduced table, then permit only published safe metadata and published Free recipe/variables. Build typed browser, request-scoped server, and `server-only` trusted clients with clear environment validation; avoid a Supabase abstraction. Public roles cannot mutate database/Storage. Ensure publication claims do not present Demo Content as tested launch inventory.

**Files:** `supabase/config.toml`, ordered `supabase/migrations/*.sql`, `supabase/seed.sql`, `supabase/tests/*`, generated types, `.env.example`, `lib/supabase/*`, `package.json`, `package-lock.json`, `README.md`.

**Done when:** reset and types are reproducible; Free content is readable as `anon`, unpublished/protected rows and mutations are denied, and trusted secrets cannot reach client code. **Verify:** `npm ci`, local reset, real-role policy tests, type drift, config/import-boundary tests, typecheck.

## #4 — Protect Premium Prompts behind Prompt Pack metadata

**Depends on:** #3.

**Scope:** Add Packs, ordered membership, Primary Sales Pack, canonical slug/redirect rules, lifecycle constraints, and Pack-only Demo Content. Extend explicit public policies for published safe Premium Prompt/Pack metadata while protecting Premium body, generation notes, and variable definitions. Enforce publication/member relationships and historical slug uniqueness without exposing protected joins.

**Files:** ordered migrations, seed, real-role SQL tests, regenerated types.

**Done when:** `anon` sees published Premium/Pack metadata only; direct recipe/variable reads and draft/archived reads fail; slug history cannot create collisions/chains. **Verify:** reset, real-role allow/deny and constraint tests, type drift.

## #5 — Authorize Admin content and preview artwork

**Depends on:** #4. **May run alongside:** #6.

**Scope:** Disable public Supabase Auth signup; document manual provisioning of Auth identity **and active `admin_profiles` row**. Add approved content/taxonomy policies for active Admins, not every authenticated user. Configure one public `prompt-previews` bucket with public read and trusted-server-only write; DB state controls which content references validated artwork. Trusted-server upload validates declared MIME/extension, size, decoded image bytes/dimensions, and generated paths before writing to the public bucket; Admin JWTs cannot upload directly. No Admin sign-in/upload UI or RBAC.

**Files:** Auth config, policy/Storage migrations, real-role tests, provisioning docs.

**Done when:** active Admin content mutations through RLS and server-validated artwork uploads succeed, direct browser-role object writes and inactive/unprofiled Auth mutations fail, and public artwork reads cannot expose protected content. **Verify:** local reset and real-role DB/Storage allow/deny tests.

## #6 — Create accountless Buyer persistence boundary

**Depends on:** #4. **May run alongside:** #5.

**Scope:** Add purchases, payment attempts/events, entitlement snapshots, hashed access tokens/sessions, and independent email-delivery records. Preserve authoritative Pack price/currency, immutable purchase terms, unique provider references and hashes, single-purchase sessions, and hard-delete restrictions. Trusted checkout initialization validates inputs and stores a **checkout-claim hash**; public reference alone is not access. No provider SDK, webhook route, checkout UI, token exchange, or buyer Auth. Keep business rules in small domain modules and routes compositional; add no generic Supabase adapter.

**Files:** ordered commerce migrations, generated types, narrow server/domain operations and tests as actually consumed.

**Done when:** public roles cannot read Buyer records, credentials are hash-only, purchase terms remain authoritative, mail status is independent, and pack edits cannot modify historical entitlement records. **Verify:** local reset, real-role/constraint and trusted-operation tests, type drift. Coordinate migration numbering and regenerated types with #5 before merge.

## #7 — Complete paid purchases atomically

**Depends on:** #6.

**Scope:** Implement the `complete_paid_purchase` RPC from [`DATABASE_SCHEMA.md` §39](DATABASE_SCHEMA.md#39-payment-transaction-boundary). Require verified normalized success facts, compare provider/product/amount/currency/state, lock attempt/purchase/Pack, serialize pack membership changes, and atomically record event, `PAID`, entitlement snapshot, and one candidate token hash. Grant execution only to `service_role`. Keep provider verification and raw-token email outside this slice.

**Files:** focused RPC/grant migrations, real-role transaction tests, regenerated types.

**Done when:** duplicate event returns `newly_completed = false` without extra entitlement/token; mismatches or invalid transitions roll back; a later Pack edit leaves the snapshot unchanged. **Verify:** successful path, duplicate, every mismatch class, unauthorized role, regression, and snapshot tests against local Supabase.

## #8 — Seal the clean-checkout delivery gate

**Depends on:** #5 and #7; this is the final integration PR.

**Scope:** Compose the checks already created in #2–#7 into one fail-fast command: locked install expectations, required configuration, local Supabase reset/seed, real-role DB/RLS/RPC tests, type drift, non-mutating lint, typecheck, tests, production build, and root smoke. Ensure trusted secrets are neither needed by nor emitted into public build output. Document Docker/Supabase prerequisites and actionable failure output without logging protected data. Use Node built-ins before adding a test/browser dependency.

**Files:** `package.json`, small scripts only where necessary, `README.md`, existing test suites.

**Done when:** a fresh checkout follows documented prerequisites, passes the single gate, and leaves the working tree unchanged. This gate precedes Phase 2 discovery work.

## Parent story ownership

The owning child issue carries each parent #1 story exactly once. A slice may test a dependency without taking ownership of its story.

| Child issue | Parent #1 stories |
|---|---|
| #2 | 1, 29–32, 43–44 |
| #3 | 2–8, 11, 24, 27–28, 33–34, 36 |
| #4 | 9, 15, 25–26 |
| #5 | 10, 12–13 |
| #6 | 14, 16–19, 21–23, 35 |
| #7 | 20, 38–41 |
| #8 | 37, 42 |

## Parent issue #1 Definition of Done

- [ ] Slice 0 contract is reviewed; existing #2–#8 are merged and linked from #1.
- [ ] Every original story has the single owner listed above.
- [ ] A locked clean install and local Supabase reset recreate the protected data model, policies, Storage contract, seed, and RPC with zero generated-type drift.
- [ ] Real-role policy tests prove public Free reads, safe Premium metadata, protected-data and mutation denial, and active-Admin boundaries.
- [ ] Transaction tests prove trusted-only atomic completion, duplicate idempotency, mismatch rollback, and durable entitlement snapshots.
- [ ] Three typed Supabase clients remain isolated; configuration fails clearly and no trusted secret enters a client bundle.
- [ ] The accessible light-only root identifies RenderBank without starter branding or Phase 2 UI.
- [ ] The one-command gate passes from clean checkout without changing tracked files.
