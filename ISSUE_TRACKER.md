# RenderBank Foundation Issue Tracker

Snapshot GitHub Issues per 4 Oktober 2026. GitHub Issues is the source of truth for issue status. [Parent #1](https://github.com/AdiYohanes/render-bank/issues/1) owns the foundation; [Slice 0 PR #9](https://github.com/AdiYohanes/render-bank/pull/9) established its reviewed contract. All seven native sub-issues are accepted, merged, and closed. Phase 2 Public Discovery is accepted and closed as [#21](https://github.com/AdiYohanes/render-bank/issues/21) via merged [PR #22](https://github.com/AdiYohanes/render-bank/pull/22) ([Phase 2 section](#phase-2--public-discovery-completion)).

[Parent #1: closed on 3 October 2026 after acceptance documentation PR #18 merged and all Definition of Done checks passed.](https://github.com/AdiYohanes/render-bank/issues/1) A fresh clone of merged `main` at `f6db98a6e4ad1acbaf21f85814e63e35037c407e` passed `npm run foundation:check` on 3 October 2026: locked install, typecheck, local reset/seed, 28 real-role database tests, generated-type drift, 15 application tests, production build without trusted credentials, public-output secret scan, root smoke, and unchanged working tree. Lint reported 0 errors/1,414 warnings (mostly Windows CRLF formatting). `npm ci` also reported five high-severity dependency advisories; the gate does not include an audit check. [Parent correction PR #17](https://github.com/AdiYohanes/render-bank/pull/17) merged as `f6db98a`: completed the 25-table baseline (`admin_audit_logs`), protected and atomically recorded Admin publication changes, required suspension reasons, blocked trusted credentials before client compilation, and strengthened real-role Admin tests. The [Definition of Done](docs/engineering/FOUNDATION_IMPLEMENTATION_PLAN.md#parent-issue-1-definition-of-done) and [GitHub progress comment](https://github.com/AdiYohanes/render-bank/issues/1#issuecomment-5928415948) record the acceptance evidence. GitHub is the source of truth for live issue state.

| Sub-issue | Depends on | Merged implementation | GitHub state |
|---|---|---|---|
| [#2 RenderBank shell](https://github.com/AdiYohanes/render-bank/issues/2) | Slice 0 | [PR #10](https://github.com/AdiYohanes/render-bank/pull/10) | Closed |
| [#3 Free Prompt boundary](https://github.com/AdiYohanes/render-bank/issues/3) | #2 | [PR #11](https://github.com/AdiYohanes/render-bank/pull/11) | Closed |
| [#4 Premium Prompt/Pack](https://github.com/AdiYohanes/render-bank/issues/4) | #3 | [PR #12](https://github.com/AdiYohanes/render-bank/pull/12) | Closed |
| [#5 Admin/artwork](https://github.com/AdiYohanes/render-bank/issues/5) | #4 | [PR #13](https://github.com/AdiYohanes/render-bank/pull/13) | Closed |
| [#6 Buyer persistence](https://github.com/AdiYohanes/render-bank/issues/6) | #4 | [PR #14](https://github.com/AdiYohanes/render-bank/pull/14) | Closed |
| [#7 Atomic paid completion](https://github.com/AdiYohanes/render-bank/issues/7) | #6 | [PR #15](https://github.com/AdiYohanes/render-bank/pull/15) | Closed |
| [#8 Clean-checkout gate](https://github.com/AdiYohanes/render-bank/issues/8) | #5, #7 | [PR #16](https://github.com/AdiYohanes/render-bank/pull/16) | Closed |

## Phase 2 — Public Discovery completion

| Pelacakan | Progres |
|---|---|
| Baseline | [PR #20](https://github.com/AdiYohanes/render-bank/pull/20) public discovery core merged (`a7c288d`, `701b991`, merge `3044f7c`) |
| Issue | [#21 Complete Phase 2 Public Discovery to contract](https://github.com/AdiYohanes/render-bank/issues/21) — **closed** |
| Implementasi | [PR #22](https://github.com/AdiYohanes/render-bank/pull/22) merged sebagai squash `264b4e1` (4 Oktober 2026), termasuk resolusi merge dengan PR #17/18 (`323ca66`) dan renumber `202610010009_public_discovery.sql` → `202610010010` (`8636e35`) |
| Acceptance | Full gate lulus di merged `main` `264b4e1` (db:reset 11 migration + seed, db:test 32/32, types zero-drift, npm test 21/21, typecheck, lint 0 error, build, smoke, tree bersih); focused HTTP checks lulus (chip semantics, noindex interim, sitemap/robots, JSON-LD, no secret markers) — [closing comment](https://github.com/AdiYohanes/render-bank/issues/21) |

Checklist #21 (lihat issue untuk versi otoritatif):

- [x] Mobile Menu dan Explore Filters sebagai HeroUI v3 drawers fokus-terkelola
- [x] Desktop Categories dropdown keyboard-operable menggantikan `<details>`
- [x] Loading skeleton rasio-aware (Home/Explore/Category) tanpa empty-state flash
- [x] Curation Home: kontrak data `featured_order`, hero artwork, Latest Drops terpisah, featured-pack campaign card
- [x] Artwork frame menghormati dimensi tersimpan; hanya kandidat LCP yang eager
- [x] Chip filter aktif Explore; `Clear Filters` hanya saat filter aktif
- [x] Layout compact kategori inventaris rendah (1–2 prompt)
- [x] Search RPC menolak input langsung >100 karakter (domain `bounded_search_text`)
- [x] Kegagalan query kategori header tidak menjatuhkan route statis (Suspense + fallback)
- [x] SEO: OpenGraph aman, JSON-LD minim (WebSite/CollectionPage/ItemList), `robots.ts`, `sitemap.ts` dibatasi route Phase 2
- [x] Docs sync: DATABASE_SCHEMA contract, README wording, tracker ini
- [x] Evidence verifikasi: full gate lulus di merged main; focused HTTP verification lulus; PR #22 merged

Tetap di Phase 3–6 (tidak masuk scope #21): Prompt Detail/Admin, storefront/checkout pack, buyer access, provisioning konten launch, analytics, monitoring, performance budget, audit aksesibilitas penuh.
