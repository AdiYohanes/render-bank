# RenderBank Sitemap

**Document:** Sitemap  
**Product:** RenderBank  
**Version:** 1.2  
**Status:** Approved for MVP  
**Last Updated:** 2026-09-29

---

## 1. Purpose

Dokumen ini mendefinisikan struktur halaman RenderBank untuk MVP beserta aturan navigasi, indexing, premium access, dan transactional states yang memengaruhi struktur route.

Tujuannya adalah memastikan:

- struktur navigasi tetap sederhana;
- premium content dapat diakses dengan aman tanpa user account;
- payment flow tidak bergantung pada browser redirect sebagai source of truth;
- halaman SEO dan halaman privat dipisahkan dengan jelas;
- search dan filter memiliki URL strategy yang konsisten;
- buyer lama tetap memiliki hak yang jelas ketika isi pack berubah;
- struktur route tetap scalable untuk future user accounts dan personal library.

---

# 2. Product Roles

RenderBank MVP hanya mengenal tiga role utama.

## Visitor

User tanpa account yang dapat:

- browse;
- search;
- filter;
- membuka public Prompt Detail;
- copy free prompt;
- membuka Pack Detail;
- melakukan checkout.

## Buyer

Buyer tetap tidak memiliki account.

Identitas purchase disimpan menggunakan email, sementara premium access diberikan melalui:

1. secure access link;
2. token validation;
3. server-managed secure session.

Satu access token dan session hanya membuka satu purchase. Purchase lain dengan email yang sama tidak otomatis ikut terbuka.

## Admin

Admin memiliki authentication dan akses ke:

```text
/admin/*
```

Admin dapat mengelola content, packs, categories, dan purchases.

---

# 3. Sitemap Overview

```text
RenderBank
│
├── /
│   └── Home
│
├── /explore
│   ├── ?q=
│   ├── ?category=
│   ├── ?model=
│   ├── ?orientation=
│   └── ?access=
│
├── /category/[slug]
│   └── Category Landing
│
├── /prompts/[slug]
│   └── Prompt Detail
│
├── /packs
│   └── Prompt Pack Collections
│
├── /packs/[slug]
│   └── Pack Detail
│
├── /checkout/[pack]
│   └── Checkout
│
├── /payment
│   ├── /success
│   ├── /pending
│   ├── /failed
│   └── /cancelled
│
├── /access
│   └── /[token]
│       └── Token Validation Entry Point
│
├── /about
│   └── About RenderBank
│
├── /terms
│   └── Terms
│
├── /privacy
│   └── Privacy Policy
│
├── 404 / Not Found State
│
└── /admin
    ├── /login
    ├── /dashboard
    ├── /prompts
    ├── /prompts/new
    ├── /prompts/[id]/edit
    ├── /packs
    ├── /packs/new
    ├── /packs/[id]/edit
    ├── /categories
    └── /purchases
```

---

# 4. Public Navigation

Primary desktop navigation:

```text
RenderBank
Explore
Categories
Packs
Search
```

## Categories

`Categories` merupakan dropdown.

Setiap item langsung menuju:

```text
/category/[slug]
```

Contoh:

```text
/category/product
/category/advertising
/category/poster
/category/photography
```

Tidak ada dedicated route:

```text
/categories
```

pada MVP.

---

# 5. Mobile Navigation

Pada layar kecil, navigation harus tetap memberikan akses langsung ke:

- Explore;
- Categories;
- Packs;
- Search.

Recommended behavior:

```text
Header
├── RenderBank Logo
├── Search
└── Menu
    ├── Explore
    ├── Categories
    └── Packs
```

Categories dapat menggunakan:

- expandable menu; atau
- nested sheet/menu.

Mobile navigation tidak boleh menyembunyikan Search terlalu dalam karena discovery merupakan core experience.

---

# 6. Home

**Route**

```text
/
```

## Purpose

Home berfungsi sebagai:

- landing page;
- visual discovery entry point;
- introduction terhadap RenderBank;
- showcase prompt terbaik;
- entry point menuju premium packs.

## Main Sections

- Hero
- Featured Prompts
- Browse by Category
- Latest Drops
- Featured Packs
- Footer

## Primary Actions

- Explore Prompts
- Browse Free Prompts
- Open Prompt
- Open Category
- Open Pack

## SEO

```text
Index: Yes
Canonical: /
```

---

# 7. Explore

**Route**

```text
/explore
```

## Purpose

Halaman utama untuk mencari dan menjelajahi seluruh prompt.

Layout menggunakan visual grid atau masonry grid.

## Search Strategy

Search menggunakan query parameter:

```text
/explore?q=luxury+skincare
```

Search dapat digabungkan dengan filter:

```text
/explore?q=coffee&category=product&model=gpt-image&orientation=portrait
```

## Supported Query Parameters

Recommended MVP:

```text
q
category
model
orientation
access
```

## Core Features

- Search
- Category filter
- AI model filter
- Access filter
- Orientation filter
- Prompt grid
- Clear filters

## Empty State

Jika tidak ada hasil:

- tampilkan pesan yang jelas;
- sediakan `Clear Filters`;
- dapat menampilkan beberapa public prompts sebagai fallback.

Tidak boleh menjadi dead-end.

## SEO

`/explore` boleh di-index.

Namun kombinasi query/filter tidak dianggap sebagai dedicated SEO pages.

Recommended:

```text
Canonical: /explore
```

untuk dynamic search/filter states.

Dedicated Category pages digunakan untuk category SEO.

---

# 8. Category

**Route**

```text
/category/[slug]
```

## Example

```text
/category/product
/category/advertising
/category/poster
/category/social-media
```

## Purpose

Category page berfungsi sebagai:

1. discovery landing;
2. dedicated SEO page.

## Initial Categories

- Product
- Advertising
- Poster
- Social Media
- Photography
- Editorial
- Typography
- E-commerce

Kategori baru hanya dibuat jika inventory sudah cukup.

## Low Inventory State

Jika category memiliki sedikit content:

- category tetap dapat tersedia jika strategis;
- gunakan curated layout;
- hindari empty-looking page.

Category tanpa content sebaiknya tidak dipublish.

## SEO

```text
Index: Yes
Canonical: self
```

---

# 9. Prompt Detail

**Route**

```text
/prompts/[slug]
```

## Example

```text
/prompts/luxury-coffee-product-ad
```

## Purpose

Halaman inti untuk melihat sebuah prompt.

## Core Content

- Visual preview
- Prompt title
- Description
- Category
- Tags
- Recommended model
- Aspect ratio
- Orientation
- Use case
- Variables
- Generation notes
- How to use

## Free Prompt

User dapat:

```text
View full prompt
Copy Prompt
```

tanpa login.

## Premium Prompt — Unauthorized

Jika user tidak memiliki premium session:

- preview visual tetap dapat ditampilkan;
- safe metadata dapat ditampilkan;
- premium prompt body tetap locked;
- user diarahkan ke pack terkait.

CTA example:

```text
Get this prompt in Product Ads Vol. 01
```

## Premium Prompt — Authorized

Jika user memiliki valid purchase session untuk prompt tersebut:

- full prompt dibuka;
- Copy Prompt tersedia;
- premium-only metadata dapat ditampilkan.

## Access Rule

Token **tidak** dibawa di URL Prompt Detail.

Tidak menggunakan pola seperti:

```text
/prompts/example?token=...
/prompts/example/access-token
```

Authorization dilakukan menggunakan secure server-managed session.

## Related Prompts

Related Prompts adalah **P1**, bukan blocker MVP.

Jika dibuat pada MVP/P1, gunakan rule sederhana seperti:

- same category;
- shared tags.

Tidak membutuhkan recommendation engine.

## Slug Policy

Setelah prompt dipublish, slug sebisa mungkin tidak berubah.

Jika harus berubah:

- simpan old slug;
- redirect `301` ke slug baru.

## SEO

Public Prompt Detail:

```text
Index: Yes
Canonical: self
```

Premium prompt metadata yang indexable tidak boleh membocorkan paid prompt content.

---

# 10. Packs Index

**Route**

```text
/packs
```

## Purpose

Editorial landing page untuk seluruh premium collections.

Route ini tetap dipertahankan walaupun saat launch hanya ada satu pack.

RenderBank memperlakukan packs sebagai:

> curated collections

bukan conventional e-commerce catalog.

## Example Packs

- Product Ads Vol. 01
- Poster Lab Vol. 01
- Social Creative Vol. 01

## Empty / Limited Inventory

Jika baru tersedia satu pack:

- tampilkan pack tersebut sebagai hero collection;
- tampilkan teaser upcoming collections jika relevan;
- jangan hapus route `/packs`.

## SEO

```text
Index: Yes
Canonical: /packs
```

---

# 11. Pack Detail

**Route**

```text
/packs/[slug]
```

## Example

```text
/packs/product-ads-vol-01
```

## Purpose

Dedicated landing / sales page untuk sebuah premium prompt pack.

## Core Content

- Pack cover
- Title
- Description
- Number of prompts
- Supported models
- Visual examples
- Prompt previews
- Included categories
- Price
- Buy CTA

## Primary Action

```text
Buy Pack
```

## Pack Lifecycle

Pack dapat memiliki state:

```text
draft
published
unlisted
archived
```

### Published

Bisa ditemukan dan dibeli.

### Unlisted

Tidak muncul di public discovery, tetapi direct URL dapat tetap berfungsi jika diperlukan.

### Archived

Tidak dapat dibeli lagi.

Existing buyer tetap mempertahankan entitlement sesuai purchase policy.

## Slug Policy

Seperti Prompt Detail:

- hindari perubahan setelah publish;
- gunakan `301 redirect` jika slug berubah.

## SEO

Published pack:

```text
Index: Yes
Canonical: self
```

Unlisted/archived behavior ditentukan berdasarkan context, tetapi archived sales page tidak boleh tetap menjual product.

---

# 12. Checkout

**Route**

```text
/checkout/[pack]
```

## Purpose

Checkout sederhana tanpa account.

## Required Information

- Selected pack
- Price
- Buyer email

## Not Required

- account creation;
- password;
- profile;
- shipping address.

## Flow

```text
Pack Detail
    ↓
Checkout
    ↓
Payment Provider
```

## SEO

```text
Index: No
Directive: noindex
```

Checkout tidak boleh menjadi search landing page.

---

# 13. Payment States

Payment tidak hanya memiliki state `success`.

RenderBank harus mendukung:

```text
/payment/success
/payment/pending
/payment/failed
/payment/cancelled
```

Browser redirect dari payment provider **bukan bukti pembayaran**.

Server harus menentukan state berdasarkan payment record yang sudah diverifikasi.

Route payment dapat menerima opaque purchase reference untuk menemukan record yang perlu diperiksa, misalnya:

```text
/payment/success?ref=[opaque-purchase-reference]
```

Reference tersebut:

- bukan access token;
- bukan buyer email;
- bukan payment credential;
- hanya digunakan server untuk mengambil dan memverifikasi purchase state.

---

# 14. Payment Success

**Route**

```text
/payment/success
```

## Purpose

Menampilkan confirmed purchase state kepada user.

## Important Rule

Halaman ini tidak boleh menganggap query parameter atau browser redirect sebagai source of truth.

Sebelum menampilkan purchase success:

- server memeriksa purchase record;
- purchase record harus berasal dari verified provider state.

## Successful State

Example:

```text
Payment successful.

Your Product Ads Vol. 01 is ready.
```

Primary CTA:

```text
Open My Pack
```

## Reload Behavior

Jika user membuka ulang success page:

- tidak membuat purchase baru;
- tidak membuat entitlement duplicate;
- hanya membaca existing purchase state.

## Email Failure

Jika payment confirmed tetapi email gagal dikirim:

- user tetap bisa membuka premium access dari success page;
- delivery email dapat dikirim ulang oleh admin.

## SEO

```text
Index: No
Directive: noindex
```

---

# 15. Payment Pending

**Route**

```text
/payment/pending
```

## Purpose

Untuk payment yang belum memiliki final state.

Example:

```text
Your payment is still being processed.
```

Possible actions:

- Check Again
- Return to Pack

Pending state tidak boleh memberikan premium entitlement sebelum payment benar-benar confirmed.

## SEO

```text
Index: No
Directive: noindex
```

---

# 16. Payment Failed

**Route**

```text
/payment/failed
```

## Purpose

Menjelaskan bahwa payment tidak berhasil.

Actions:

```text
Try Again
Return to Pack
```

Tidak membuat entitlement.

## SEO

```text
Index: No
Directive: noindex
```

---

# 17. Payment Cancelled

**Route**

```text
/payment/cancelled
```

## Purpose

Menangani user yang membatalkan proses pembayaran.

Actions:

```text
Return to Pack
Try Again
```

## SEO

```text
Index: No
Directive: noindex
```

---

# 18. Payment Verification Requirement

Walaupun detail implementasi masuk ke `docs/engineering/TECHNICAL_ARCHITECTURE.md`, sitemap menetapkan constraint berikut:

> Premium entitlement hanya boleh dibuat dari payment state yang sudah diverifikasi server-side.

Recommended source:

- verified payment webhook; atau
- trusted direct verification ke payment provider.

Browser redirect tidak boleh membuat purchase menjadi paid.

Duplicate webhook harus diproses secara idempotent dan tidak membuat entitlement duplicate.

---

# 19. Premium Access Entry

**Route**

```text
/access/[token]
```

## Purpose

Route ini hanya menjadi **secure entry point** untuk memvalidasi access token.

Token bukan permanent browsing credential.

## Expected Flow

```text
/access/[token]
       ↓
Server validates token
       ↓
Valid?
 ┌─────┴─────┐
 No           Yes
 ↓             ↓
Invalid        Create secure access session
Access         ↓
State          Redirect away from token URL
               ↓
            /access
```

## Important Rule

Setelah token berhasil divalidasi:

- server membuat secure access session;
- browser segera di-redirect dari URL token;
- token tidak ikut ke Prompt Detail URL.

---

# 20. Premium Access Home

**Route**

```text
/access
```

## Purpose

Accountless buyer library selama RenderBank belum memiliki user account.

Browser session bersifat sementara, tetapi purchased entitlement tetap permanen.

## Authorization

Halaman hanya dapat digunakan ketika secure premium session valid.

Satu session hanya memberikan akses ke satu purchase dan tidak menggabungkan purchase lain berdasarkan kecocokan email.

## Content

Menampilkan purchased pack dalam scope purchase tersebut.

User dapat:

```text
Purchased Pack
    ↓
Prompt List
    ↓
/prompts/[slug]
```

Prompt Detail kemudian memvalidasi entitlement melalui session.

## SEO

```text
Index: No
Directive: noindex
```

---

# 21. Access Token Lifecycle

Detailed implementation akan berada di technical architecture, tetapi product requirements menetapkan:

Token harus:

- cryptographically random;
- memiliki scope ke satu purchase;
- long-lived agar entitlement one-time purchase tetap dapat diakses;
- disimpan server-side dalam bentuk hash;
- dapat di-revoke;
- dapat di-rotate;
- tidak diteruskan ke Prompt Detail;
- tidak dikirim ke analytics;
- tidak dicatat pada client-side logging.

Purchased entitlement bersifat permanen. Jika token di-revoke, di-rotate, atau tidak lagi tersedia, admin dapat mengirim access link baru tanpa mengubah entitlement.

Secure browser session memiliki masa berlaku lebih pendek daripada access token. Setelah session berakhir, buyer dapat menggunakan kembali access link yang masih valid.

## Access Page Security

Untuk token entry dan premium access area:

```text
Referrer-Policy: no-referrer
Session cookie: HttpOnly; Secure; SameSite=Lax
```

Session harus memiliki expiration dan di-rotate setelah token berhasil divalidasi.

Hindari third-party scripts yang tidak diperlukan.

---

# 22. Buyer Entitlement Policy

RenderBank menggunakan **purchase-time entitlement snapshot**.

Ketika buyer membeli sebuah pack, mereka memperoleh entitlement terhadap prompt yang termasuk dalam pack pada saat pembelian.

Example:

Pada saat purchase:

```text
Product Ads Vol. 01
├── Prompt A
├── Prompt B
├── Prompt C
└── Prompt D
```

Buyer mendapatkan entitlement ke:

```text
A, B, C, D
```

Jika pack kemudian berubah menjadi:

```text
A, B, C, E
```

buyer lama **tetap memiliki entitlement ke Prompt D**.

## Free Updates

Admin dapat secara eksplisit memberikan prompt baru sebagai update kepada buyer lama.

Dengan demikian:

```text
Purchase Snapshot
+
Explicit Included Updates
=
Buyer Entitlement
```

Prompt yang sudah dibeli tidak boleh hilang tanpa kebijakan yang eksplisit.

---

# 23. Unpublished Content Behavior

## Prompt Unpublished

Jika prompt di-unpublish:

### Public visitor

Prompt tidak lagi muncul di public discovery.

### Existing buyer

Jika prompt termasuk entitlement buyer:

- access tetap tersedia;
- prompt dapat ditandai sebagai legacy/unlisted.

## Prompt Removed From Pack

Existing buyer tetap mempertahankan entitlement jika prompt termasuk dalam purchase snapshot.

Buyer baru mengikuti isi pack terbaru.

## Pack Unpublished / Archived

Pack tidak lagi dapat dibeli.

Existing buyer tetap dapat mengakses purchased entitlement melalui secure access session.

## Hard Delete

Hard delete content yang pernah dibeli sebaiknya dihindari.

Gunakan:

```text
unpublished
unlisted
archived
```

daripada physical deletion.

---

# 24. About

**Route**

```text
/about
```

## Purpose

Menjelaskan:

- apa itu RenderBank;
- philosophy;
- curated visual-first approach;
- bagaimana prompt diuji;
- target pengguna.

## SEO

```text
Index: Yes
Canonical: /about
```

---

# 25. Terms

**Route**

```text
/terms
```

## Purpose

Menyediakan ketentuan penggunaan.

Topics:

- digital product purchase;
- prompt usage;
- sharing restrictions;
- refund policy;
- acceptable use;
- access-link responsibility.

## SEO

```text
Index: Yes
Canonical: /terms
```

---

# 26. Privacy Policy

**Route**

```text
/privacy
```

## Purpose

Menjelaskan penggunaan data:

- buyer email;
- payment metadata;
- analytics;
- cookies jika digunakan.

## SEO

```text
Index: Yes
Canonical: /privacy
```

---

# 27. Error States

Minimal states yang harus tersedia.

## 404 Not Found

Untuk route/content yang tidak tersedia.

User harus mendapatkan:

- message;
- Explore CTA;
- Home CTA.

---

## Invalid / Expired Access Link

Jika `/access/[token]` tidak valid:

```text
Access link invalid or unavailable.
```

Actions:

- check purchase email;
- hubungi support untuk meminta access link dikirim ulang;
- return to RenderBank.

MVP tidak membutuhkan self-service access recovery.

---

## Payment Error

Jika status pembayaran tidak dapat diverifikasi:

- jangan memberikan entitlement;
- tampilkan safe retry/status message.

---

## Server Error

Application harus memiliki generic server error state.

Jangan mengekspos stack trace atau internal data.

---

# 28. Loading States

Harus ada loading state untuk:

- Explore prompts;
- Search;
- Filters;
- Category;
- Pack Detail;
- Checkout;
- Payment verification;
- Secure Access validation.

Loading state harus menunjukkan bahwa proses masih berlangsung, bukan terlihat seperti halaman kosong.

---

# 29. Empty States

Minimum:

## Search Empty

```text
No prompts found.
```

Actions:

- Clear Search
- Explore All

## Filter Empty

Actions:

- Clear Filters

## Category Empty

Category kosong sebaiknya tidak dipublish.

## Packs Empty

Route `/packs` tetap dipertahankan.

Gunakan editorial / coming soon state jika diperlukan.

---

# 30. Analytics Privacy

Public analytics dapat mengumpulkan event seperti:

- prompt view;
- prompt copy;
- search;
- filter;
- pack view;
- checkout start;
- purchase confirmation event.

Analytics tidak boleh menerima:

- access token;
- buyer email;
- payment reference;
- raw premium prompt data;
- sensitive purchase identifiers.

Premium/access pages sebaiknya menggunakan analytics seminimal mungkin.

---

# 31. SEO & Indexing Matrix

| Route | Index | Canonical |
|---|---|---|
| `/` | Yes | `/` |
| `/explore` | Yes | `/explore` |
| `/explore?...` | Avoid separate indexing | `/explore` |
| `/category/[slug]` | Yes | Self |
| `/prompts/[slug]` | Yes when public page exists | Self |
| `/packs` | Yes | `/packs` |
| `/packs/[slug]` | Yes when published | Self |
| `/checkout/[pack]` | No | N/A |
| `/payment/*` | No | N/A |
| `/access` | No | N/A |
| `/access/[token]` | No | N/A |
| `/admin/*` | No | N/A |
| `/about` | Yes | `/about` |
| `/terms` | Yes | `/terms` |
| `/privacy` | Yes | `/privacy` |

Private and transactional pages must use appropriate `noindex` handling.

---

# 32. Models & Tags Management

Untuk MVP tidak dibuat dedicated routes:

```text
/admin/models
/admin/tags
```

Models dan tags dikelola inline melalui Prompt Edit.

Jika operational complexity meningkat, dedicated management pages dapat ditambahkan kemudian.

---

# 33. Admin Area

Semua internal management berada pada:

```text
/admin/*
```

Seluruh admin area:

```text
Index: No
```

dan membutuhkan authenticated admin session.

---

# 34. Admin Login

**Route**

```text
/admin/login
```

Purpose:

Admin authentication.

---

# 35. Admin Dashboard

**Route**

```text
/admin/dashboard
```

Possible summary:

- total prompts;
- published prompts;
- draft prompts;
- packs;
- purchases;
- basic revenue.

Advanced analytics bukan bagian MVP.

---

# 36. Admin Prompt Management

## List

```text
/admin/prompts
```

Filters:

- Draft
- Published
- Unpublished
- Archived
- Free
- Premium
- Category

## Create

```text
/admin/prompts/new
```

## Edit

```text
/admin/prompts/[id]/edit
```

Admin mengelola:

- title;
- slug;
- description;
- prompt template;
- variables;
- category;
- tags;
- models;
- preview images;
- access type;
- generation notes;
- publication state.

---

# 37. Admin Pack Management

## List

```text
/admin/packs
```

## Create

```text
/admin/packs/new
```

## Edit

```text
/admin/packs/[id]/edit
```

Admin mengelola:

- title;
- slug;
- description;
- cover;
- price;
- prompts;
- ordering;
- state.

Pack editing harus menghormati existing buyer entitlement snapshot.

---

# 38. Admin Categories

**Route**

```text
/admin/categories
```

Actions:

- create;
- rename;
- change slug;
- archive.

Category yang sudah memiliki content sebaiknya tidak di-hard-delete.

---

# 39. Admin Purchases

**Route**

```text
/admin/purchases
```

Information:

- buyer email;
- purchased pack;
- amount;
- currency;
- payment state;
- payment reference;
- purchase date;
- access status.

Admin harus dapat melakukan minimal operational actions seperti:

- melihat purchase;
- resend access email;
- revoke/rotate access jika diperlukan.

Tidak membutuhkan CRM.

---

# 40. Explicitly Excluded Public Routes

Tidak dibuat pada MVP:

```text
/login
/register
/profile
/settings
/dashboard
/library
/favorites
/subscription
/pricing
/creators
/community
/categories
```

## Reason

RenderBank MVP tidak memiliki:

- user accounts;
- subscription;
- creator marketplace;
- community.

Harga tersedia langsung pada Pack Detail.

---

# 41. Core Navigation Flows

## Free Prompt Discovery

```text
Home / Search Engine / Social
        ↓
Explore / Category
        ↓
Prompt Detail
        ↓
Copy Prompt
```

---

## Premium Discovery

```text
Explore / Prompt Detail
        ↓
Pack Detail
        ↓
Checkout
```

---

## Successful Purchase

```text
Checkout
   ↓
Payment Provider
   ↓
Verified Server Payment State
   ↓
/payment/success
   ↓
Secure Access Link
   ↓
/access/[token]
   ↓
Token Validation
   ↓
Secure Session
   ↓
/access
   ↓
Premium Prompt Detail
```

---

## Pending Payment

```text
Payment Provider
   ↓
Server State = Pending
   ↓
/payment/pending
   ↓
Check Again
```

---

## Failed Payment

```text
Payment Provider
   ↓
Server State = Failed
   ↓
/payment/failed
   ↓
Try Again
```

---

## Cancelled Payment

```text
Payment Cancelled
   ↓
/payment/cancelled
   ↓
Return to Pack / Try Again
```

---

## Returning Buyer

```text
Purchase Email
   ↓
/access/[token]
   ↓
Validate
   ↓
Secure Session
   ↓
/access
   ↓
Purchased Pack
   ↓
Premium Prompt
```

---

# 42. Security & Privacy Constraints

Sitemap-level requirements:

1. Access token hanya digunakan pada validation entry point.
2. Premium browsing menggunakan server-managed session.
3. Payment harus diverifikasi server-side.
4. Payment webhook/event processing harus idempotent.
5. Sensitive routes menggunakan `noindex`.
6. Access token tidak dikirim ke analytics.
7. Buyer email tidak dikirim ke public analytics.
8. Premium prompt content tidak boleh bocor melalui metadata/client bundle.
9. Access page menggunakan strict referrer handling.
10. Existing buyer entitlement tidak bergantung pada current pack membership.
11. Satu premium session hanya membuka satu purchase.
12. Session cookie menggunakan `HttpOnly`, `Secure`, dan `SameSite=Lax`.
13. Payment route menggunakan opaque purchase reference, bukan access token atau buyer identity.

Detail implementasi akan ditentukan dalam:

```text
docs/engineering/TECHNICAL_ARCHITECTURE.md
```

---

# 43. Sitemap Design Principles

## Simple

Public navigation tetap kecil.

## Visual First

Prompt discovery adalah core experience.

## No Forced Account

Free prompt dapat digunakan tanpa login.

## Secure Premium Access

Token hanya merupakan entry mechanism, bukan persistent URL credential.

## Server-Verified Payment

Browser redirect bukan source of truth.

## SEO Friendly

Public content memiliki dedicated indexable routes.

## Buyer-Safe

Purchased content tidak hilang hanya karena pack berubah.

## Future Compatible

Struktur memungkinkan future:

- user account;
- personal library;
- saved prompts;
- subscription;
- creator marketplace.

---

# 44. Future Routes — Not MVP

Potential future routes:

```text
/login
/account
/library
/saved
/settings
/subscription
/creators/[username]
```

Hanya ditambahkan setelah kebutuhan tervalidasi.

---

# 45. Final MVP Route List

## Public / Indexable

```text
/
/explore
/category/[slug]
/prompts/[slug]
/packs
/packs/[slug]
/about
```

## Transactional / Private

```text
/checkout/[pack]

/payment/success
/payment/pending
/payment/failed
/payment/cancelled

/access
/access/[token]
```

## Legal

```text
/terms
/privacy
```

## Admin

```text
/admin/login
/admin/dashboard
/admin/prompts
/admin/prompts/new
/admin/prompts/[id]/edit
/admin/packs
/admin/packs/new
/admin/packs/[id]/edit
/admin/categories
/admin/purchases
```

---

# 46. Sitemap Status

Sitemap v1.2 menjadi baseline untuk dokumen berikutnya:

1. `docs/experience/USER_FLOWS.md`
2. `docs/experience/SCREEN_REQUIREMENTS.md`
3. low-fidelity wireframe
4. visual direction
5. design system
6. `docs/engineering/TECHNICAL_ARCHITECTURE.md`

Keputusan yang sudah dianggap locked untuk MVP:

- tidak ada public user account;
- tidak ada subscription;
- premium purchase bersifat one-time;
- payment diverifikasi server-side;
- access token hanya digunakan sebagai validation entry point;
- premium browsing menggunakan secure session yang terbatas pada satu purchase;
- purchased entitlement permanen, sementara browser session memiliki expiration;
- buyer mendapatkan purchase-time entitlement snapshot;
- payment route menggunakan opaque purchase reference;
- search/filter menggunakan `/explore` query parameters;
- `/packs` tetap ada walaupun inventory awal kecil;
- private dan transactional routes tidak di-index.
