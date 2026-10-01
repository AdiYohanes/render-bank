# RenderBank Issue Tracker

Snapshot GitHub Issues per 1 Oktober 2026. GitHub tetap menjadi sumber status utama; checklist menandai issue yang ditutup, bukan PR atau implementasi yang sudah dibuat. Issue #1 adalah parent; #2–#8 adalah sub-issue yang bersama-sama menyelesaikan #1, bukan delapan pekerjaan terpisah dari foundation. Lihat [peta dependensi dan pembagian 44 story](docs/engineering/FOUNDATION_IMPLEMENTATION_PLAN.md#parent-story-ownership). Setelah seluruh sub-issue selesai, barulah #1 ditutup.

## Ringkasan

| Status | Jumlah |
|---|---:|
| Total issue | 8 (1 parent + 7 sub-issue) |
| Belum selesai | 8 (parent #1 dan sub-issue #2–#8) |
| Sudah selesai | 0 |

Semua issue saat ini berstatus **open** dan berlabel `ready-for-agent`.

## Belum selesai

### Parent issue

- [ ] [#1 Establish the RenderBank MVP foundation](https://github.com/AdiYohanes/render-bank/issues/1) — selesai setelah seluruh sub-issue #2–#8 dan gate #8 tuntas. Slice 0 adalah prasyarat dokumentasi, bukan sub-issue baru.

### Sub-issue dari #1

Urutan dependensi: #2 → #3 → #4 → (#5 dan #6 paralel) → #7 (setelah #6) → #8 (setelah #5 dan #7). Status checklist mengikuti penutupan issue di GitHub, bukan status implementasi pada branch ini.

- [ ] [#2 Replace the starter with a verifiable RenderBank shell](https://github.com/AdiYohanes/render-bank/issues/2)
- [ ] [#3 Establish the public Free Prompt data boundary](https://github.com/AdiYohanes/render-bank/issues/3)
- [ ] [#4 Protect Premium Prompts behind Prompt Pack metadata](https://github.com/AdiYohanes/render-bank/issues/4)
- [ ] [#5 Authorize Admin content and preview-artwork operations](https://github.com/AdiYohanes/render-bank/issues/5)
- [ ] [#6 Create the accountless Buyer persistence boundary](https://github.com/AdiYohanes/render-bank/issues/6)
- [ ] [#7 Complete paid purchases atomically and idempotently](https://github.com/AdiYohanes/render-bank/issues/7) — diimplementasikan lokal pada a519e81 dan 18a9af8; belum pushed, merged, atau closed; 24 tes database dan 12 tes aplikasi lulus.
- [ ] [#8 Seal the clean-checkout foundation delivery gate](https://github.com/AdiYohanes/render-bank/issues/8)

## Sudah selesai

Belum ada issue yang selesai.
