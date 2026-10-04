# RenderBank Issue Tracker

Snapshot per 2 Oktober 2026. [GitHub Issues](https://github.com/AdiYohanes/render-bank/issues) adalah sumber status issue; kolom **Implementasi lokal** melacak pekerjaan di branch `docs/foundation-contract`, bukan bukti issue telah ditutup atau PR telah digabung. [Progres #2–#8 juga dicatat pada parent #1](https://github.com/AdiYohanes/render-bank/issues/1#issuecomment-5928415948). [Rincian dependensi dan kepemilikan 44 story](docs/engineering/FOUNDATION_IMPLEMENTATION_PLAN.md#parent-story-ownership).

**Di mana issue lainnya?** [Parent #1](https://github.com/AdiYohanes/render-bank/issues/1) dan seluruh sub-issue **#2–#8** tercantum pada [tabel di bawah](#parent-dan-sub-issue); klik nomor masing-masing untuk membuka issue di GitHub. [PR Slice 0 #9](https://github.com/AdiYohanes/render-bank/pull/9) serta PR #2–#8 ([#10](https://github.com/AdiYohanes/render-bank/pull/10), [#11](https://github.com/AdiYohanes/render-bank/pull/11), [#12](https://github.com/AdiYohanes/render-bank/pull/12), [#13](https://github.com/AdiYohanes/render-bank/pull/13), [#14](https://github.com/AdiYohanes/render-bank/pull/14), [#15](https://github.com/AdiYohanes/render-bank/pull/15), [#16](https://github.com/AdiYohanes/render-bank/pull/16)) sudah merged; #2–#8 accepted dan closed. Gate final dari clone baru main `0895056` lulus, tetapi audit parent menemukan `admin_audit_logs` belum diimplementasikan (24 dari 25 tabel kontrak). Perbaikan gap dan penerimaan akhir parent masih pending. Tracker ini masih lokal/unstaged, belum diterbitkan ke main. Phase 2 Public Discovery berlanjut sebagai [#21](https://github.com/AdiYohanes/render-bank/issues/21) ([bagian Phase 2](#phase-2--public-discovery-completion)).

## Ringkasan

| Pelacakan | Progres |
|---|---:|
| Parent #1 | Open; Slice 0 dan #2–#8 di-review serta merged; #2–#8 accepted dan closed. Gate final main `0895056` lulus (26 tes database, 14 tes aplikasi, lint 0 error/1372 peringatan, build/secret scan/smoke/tree bersih), tetapi audit DoD menemukan tabel `admin_audit_logs` wajib belum ada (24 dari 25 tabel); perbaikan kontrak dan penerimaan akhir masih diperlukan |
| Sub-issue #2–#8 | 7 dari 7 closed di GitHub (#2–#8); 0 open |
| Implementasi lokal sub-issue | 7 dari 7 memiliki commit (#2–#8), semuanya merged |
| Belum diimplementasikan | 0 sub-issue |

Parent #1 masih **open**; #2–#8 **closed**. Slice 0 adalah prasyarat dokumentasi, bukan sub-issue kedelapan.

## Parent dan sub-issue

- [ ] [#1 Establish the RenderBank MVP foundation](https://github.com/AdiYohanes/render-bank/issues/1) — parent; Slice 0 dan #2–#8 sudah merged serta tertaut dari #1, semua child accepted/closed. Gate final `npm run foundation:check` dari clone baru main `0895056` lulus dengan working tree tetap bersih, tetapi [Definition of Done](docs/engineering/FOUNDATION_IMPLEMENTATION_PLAN.md#parent-issue-1-definition-of-done) belum lengkap: `DATABASE_SCHEMA.md` mensyaratkan `admin_audit_logs` dan 25 tabel, sementara migrasi/generated types baru mencakup 24 tabel. Perbaiki gap ini sebelum penerimaan akhir parent; gate saat ini belum mendeteksinya. Jangan tutup hanya berdasarkan commit lokal.

| Status GitHub | Sub-issue dari #1 | Dependensi | Implementasi lokal |
|---|---|---|---|
| Closed | [#2 Replace the starter with a verifiable RenderBank shell](https://github.com/AdiYohanes/render-bank/issues/2) | — | ✅ Accepted; [PR #10](https://github.com/AdiYohanes/render-bank/pull/10) merged sebagai `0872090` dari [`db2c1d1`](https://github.com/AdiYohanes/render-bank/commit/db2c1d1); clean-clone install, typecheck, lint, test, build, smoke lulus |
| Closed | [#3 Establish the public Free Prompt data boundary](https://github.com/AdiYohanes/render-bank/issues/3) | #2 | ✅ Accepted; [PR #11](https://github.com/AdiYohanes/render-bank/pull/11) merged sebagai `38dfd8c` dari [`e73e795`](https://github.com/AdiYohanes/render-bank/commit/e73e795) dan perbaikan type drift Windows [`c50d19c`](https://github.com/AdiYohanes/render-bank/commit/c50d19c); clean-clone reset/seed, 1 tes database real-role, type drift, typecheck, lint, tes aplikasi, build lulus |
| Closed | [#4 Protect Premium Prompts behind Prompt Pack metadata](https://github.com/AdiYohanes/render-bank/issues/4) | #3 | ✅ Accepted; [PR #12](https://github.com/AdiYohanes/render-bank/pull/12) merged sebagai `d9e0bce` dari [`0fd66a3`](https://github.com/AdiYohanes/render-bank/commit/0fd66a3) dan integrasi #3 (`9d8d636`); clean-clone reset/seed, tes database real-role, type drift, typecheck, lint, tes aplikasi, build lulus |
| Closed | [#5 Authorize Admin content and preview-artwork operations](https://github.com/AdiYohanes/render-bank/issues/5) | #4 | ✅ Accepted; [PR #13](https://github.com/AdiYohanes/render-bank/pull/13) merged sebagai `27955d2` dari head [`37ec785`](https://github.com/AdiYohanes/render-bank/commit/37ec785) (slice [`870679c`](https://github.com/AdiYohanes/render-bank/commit/870679c)); clean-clone `npm ci`, reset, 7 tes database/Storage, type drift, typecheck, lint (0 error; peringatan CRLF), 9 tes aplikasi, build, dan smoke lulus |
| Closed | [#6 Create the accountless Buyer persistence boundary](https://github.com/AdiYohanes/render-bank/issues/6) | #4 | ✅ Accepted; [PR #14](https://github.com/AdiYohanes/render-bank/pull/14) merged sebagai `d6fa456` dari head [`783ed50`](https://github.com/AdiYohanes/render-bank/commit/783ed50) (commit awal `5898d56`, `71443ca`, `9939117`); perbaikan retry checkout, provider event, dan lifecycle diverifikasi dari clone bersih: `npm ci`, reset, 18 tes database, type drift, typecheck, lint (0 error; peringatan CRLF), 13 tes aplikasi, build, smoke lulus |
| Closed | [#7 Complete paid purchases atomically and idempotently](https://github.com/AdiYohanes/render-bank/issues/7) | #6 | ✅ Accepted; [PR #15](https://github.com/AdiYohanes/render-bank/pull/15) merged sebagai `54b4dc8` dari `9862680` (slice [`a519e81`](https://github.com/AdiYohanes/render-bank/commit/a519e81), tes `18a9af8`, integrasi #6); clean-clone `npm ci`, reset, 26 tes database, type drift, typecheck, lint, 13 tes aplikasi, build, smoke, diff check lulus; review independen tidak menemukan blocker terverifikasi |
| Closed | [#8 Seal the clean-checkout foundation delivery gate](https://github.com/AdiYohanes/render-bank/issues/8) | #5 dan #7 | ✅ Accepted; [PR #16](https://github.com/AdiYohanes/render-bank/pull/16) merged sebagai `0895056` dari `f26c4e9` (slice `5b7cd0f`, integrasi main `54b4dc8`, fix casing secret Windows). Full gate corrected head lulus: locked install (0 vulnerability), reset/seed, 26 tes database, 14 tes aplikasi, type drift, typecheck, lint (0 error; 1372 peringatan), build tanpa trusted key, secret scan, smoke, tree stabil; review independen tidak menemukan blocker tersisa. Rerun awal berhenti karena Docker tidak berjalan; setelah Linux engine dijalankan, seluruh gate lulus |

#5 dan #6 dapat dikerjakan paralel setelah #4. Perbarui status GitHub dan kolom implementasi secara terpisah agar commit lokal tidak terlihat sebagai issue yang sudah selesai.

## Phase 2 — Public Discovery completion

| Pelacakan | Progres |
|---|---|
| Baseline | [PR #20](https://github.com/AdiYohanes/render-bank/pull/20) public discovery core merged (`a7c288d`, `701b991`, merge `3044f7c`) |
| Issue | [#21 Complete Phase 2 Public Discovery to contract](https://github.com/AdiYohanes/render-bank/issues/21) — open |
| Implementasi lokal | Branch `docs/foundation-contract`; implementasi [PR #22](https://github.com/AdiYohanes/render-bank/pull/22) (commit `97a3e7e`, reformat `8530703`) sudah di-push `701b991..8530703`; belum merged |
| Acceptance | Issue #21 ditutup hanya setelah PR #22 merged lulus full automated gate + focused browser checks |

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
- [x] Docs sync: DATABASE_SCHEMA contract, README wording, tracker ini (core sync; tracker refresh mengikuti milestone berikutnya)
- [ ] Evidence verifikasi: full gate lokal lulus (✓ otomatis); focused browser checks pending; merged/accepted pending

Tetap di Phase 3–6 (tidak masuk scope #21): Prompt Detail/Admin, storefront/checkout pack, buyer access, provisioning konten launch, analytics, monitoring, performance budget, audit aksesibilitas penuh.
