# RenderBank
## Product Requirements Document — Final v1.0

**Status:** Final Draft  
**Product Type:** Web Application / Digital Product Platform  
**Primary Market:** Indonesia + Global  
**Primary Language:** English-first, dengan kemungkinan Bahasa Indonesia di tahap berikutnya  
**Business Model Awal:** Free Prompt + One-Time Purchase Prompt Packs  
**Subscription:** Tidak termasuk MVP  
**User Login:** Tidak termasuk MVP  
**Content Source:** Curated first-party prompts

---

# 1. Ringkasan Produk

RenderBank adalah platform visual untuk menemukan prompt AI image berkualitas tinggi yang sudah dikurasi dan diuji.

Fokus utamanya adalah membantu user membuat visual seperti:

- poster iklan
- product advertising
- product photography
- social media creative
- editorial visual
- e-commerce visual
- typography poster
- campaign visual
- lifestyle product image
- creative photography

RenderBank bukan sekadar kumpulan teks prompt.

Setiap prompt ditampilkan dengan contoh hasil visual sehingga user bisa menentukan kualitas prompt sebelum menggunakannya.

Core experience:

**Lihat visual → buka detail → pahami prompt → ubah variable → copy → generate di AI image generator.**

RenderBank tidak melakukan image generation sendiri pada MVP.

---

# 2. Product Vision

RenderBank ingin menjadi tempat utama bagi creator untuk mendapatkan inspirasi visual sekaligus mengetahui bagaimana visual tersebut dibuat menggunakan AI.

Visi sederhananya:

> **Pinterest untuk AI visual, tetapi setiap gambar memiliki resep prompt yang bisa digunakan.**

Core tagline:

> **Don't prompt from scratch.**

Supporting tagline:

> **Discover tested prompts for better AI visuals.**

---

# 3. Masalah yang Diselesaikan

## 3.1 Blank Prompt Problem

Banyak orang tahu visual seperti apa yang mereka inginkan, tetapi tidak tahu bagaimana menuliskan prompt yang bagus.

RenderBank memberikan titik awal yang sudah terbukti bekerja.

---

## 3.2 Trial-and-Error Mahal

Prompt berkualitas sering membutuhkan banyak percobaan.

Percobaan tersebut membuang:

- waktu
- token
- credit generation
- kuota AI
- energi eksperimen

RenderBank membantu user melewati sebagian proses trial-and-error tersebut.

---

## 3.3 Prompt Berkualitas Sulit Dicari

Prompt tersebar di:

- X
- Instagram
- Reddit
- Pinterest
- Discord
- YouTube
- marketplace prompt
- personal notes

RenderBank mengorganisasikannya dalam satu pengalaman yang terstruktur.

---

## 3.4 Prompt Text Sulit Dinilai

User sulit mengetahui kualitas prompt hanya dengan membaca teks.

RenderBank menggunakan visual-first discovery sehingga output menjadi bukti utama kualitas prompt.

---

# 4. Target User

## Primary

### AI Creator

Orang yang sering menggunakan AI image generator untuk eksplorasi visual.

### Content Creator

Creator yang membuat:

- Instagram content
- TikTok content
- carousel
- social ads
- thumbnails
- creative posts

### Small Business Owner

Pemilik usaha yang membutuhkan visual pemasaran tetapi tidak selalu menggunakan jasa designer.

### E-commerce Seller

Seller yang membutuhkan:

- product hero image
- product ads
- marketplace creative
- promotional image

### Designer / Creative

Designer yang menggunakan AI untuk:

- ideation
- moodboard
- visual exploration
- campaign concept

---

# 5. Positioning

RenderBank tidak diposisikan sebagai:

> Kumpulan prompt sebanyak mungkin.

RenderBank diposisikan sebagai:

> **Curated library of tested AI visual recipes.**

Nilai utama bukan sekadar prompt text.

Nilai RenderBank berasal dari kombinasi:

- prompt
- visual output
- eksperimen
- struktur
- variable
- model recommendation
- generation settings
- creative direction
- curation

---

# 6. Prinsip Produk

## Visual First

Image adalah elemen utama discovery.

Prompt text adalah informasi sekunder setelah user tertarik pada visual.

---

## Quality Over Quantity

Lebih baik memiliki:

**100 prompt berkualitas**

daripada:

**10.000 prompt tidak teruji.**

---

## Tested Prompts

Prompt idealnya hanya dipublish jika sudah diuji menggunakan model yang direkomendasikan.

---

## Low Friction

User harus bisa:

**lihat → klik → copy**

tanpa dipaksa membuat akun.

---

## Simple MVP

RenderBank versi awal hanya membangun fitur yang membantu memvalidasi demand.

Fitur kompleks ditunda sampai ada bukti kebutuhan.

---

# 7. Scope MVP

RenderBank MVP memiliki tiga tujuan:

1. Membuktikan orang tertarik membuka prompt berdasarkan hasil visual.
2. Membuktikan prompt RenderBank benar-benar digunakan.
3. Membuktikan orang bersedia membeli premium prompt pack.

---

# 8. Fitur MVP

## Public Features

- Homepage
- Explore prompts
- Categories
- Search
- Filter
- Prompt detail
- Copy prompt
- Free prompt
- Premium pack preview
- Prompt pack detail
- Checkout
- Payment
- Purchase success
- Secure pack access
- Share link

---

## Admin Features

- Admin authentication
- Create prompt
- Edit prompt
- Archive prompt
- Publish/unpublish prompt
- Upload preview image
- Manage category
- Manage tags
- Create prompt pack
- Add prompt ke pack
- Set harga
- Publish/unpublish pack
- View purchase sederhana

---

# 9. Fitur yang Tidak Masuk MVP

MVP tidak memiliki:

- user registration
- user login
- user profile
- favorites
- user dashboard
- subscription
- billing subscription
- marketplace
- creator profile
- community
- comments
- ratings
- AI image generation
- user-generated prompts
- revenue sharing
- advanced recommendation AI

Fitur tersebut hanya dipertimbangkan setelah produk menunjukkan traction.

---

# 10. User Authentication

## User Biasa

Tidak membutuhkan akun.

Free prompt dapat digunakan tanpa login.

User tidak perlu melewati:

**Register → Login → Verify Email → Copy Prompt**

Karena proses tersebut menambah friction.

---

## Admin

Admin tetap membutuhkan authentication karena memiliki akses mengelola konten dan transaksi.

---

# 11. Purchase Tanpa Account

User membeli premium pack menggunakan email.

Flow:

**Prompt Pack**

↓

**Buy**

↓

Masukkan email

↓

Payment

↓

Payment berhasil

↓

Secure Access Link dibuat

↓

Link dikirim ke email

↓

User membuka premium pack

Email menjadi identitas pembelian untuk tahap awal.

---

# 12. Future Account Compatibility

Walaupun belum memiliki user account, database harus dibuat agar pembelian lama bisa dikaitkan dengan akun di masa depan.

Contoh:

User pernah membeli menggunakan:

`user@email.com`

Nanti RenderBank memiliki sistem account.

User login dengan email yang sama.

System dapat menemukan transaksi lama dan otomatis menambahkan produk tersebut ke Library user.

Dengan demikian implementasi MVP tidak menjadi dead-end.

---

# 13. Homepage

Homepage harus menjelaskan RenderBank dalam beberapa detik.

## Hero

Headline:

> **Don't prompt from scratch.**

Supporting text:

> Discover tested prompts for creating better AI visuals.

CTA:

**Explore Prompts**

Secondary CTA:

**Browse Free Prompts**

---

## Featured Prompts

Grid visual prompt pilihan.

Setiap card menampilkan:

- preview image
- title
- category
- model
- Free / Premium badge

---

## Categories

Contoh:

- Advertising
- Product
- Poster
- Social Media
- Photography
- Editorial
- Typography
- E-commerce

---

## Latest Drops

Prompt terbaru.

Tujuan:

membuat homepage terasa hidup dan terus berkembang.

---

## Featured Packs

Promosi premium collections.

Contoh:

**Product Ads Vol. 01**

---

# 14. Explore Page

Explore adalah salah satu halaman paling penting.

Pengalaman yang diinginkan mendekati Pinterest atau visual gallery.

Prompt ditampilkan dalam:

- responsive grid
atau
- masonry grid

---

## Filter

Filter awal:

### Category

- Product
- Advertising
- Poster
- Social
- Photography
- Editorial
- Typography
- E-commerce

### Model

Contoh:

- GPT Image
- Gemini Image
- Midjourney
- Flux

Model harus berasal dari database agar mudah ditambah.

### Access

- Free
- Premium

### Orientation

- Portrait
- Landscape
- Square

---

# 15. Search

Search dapat mencari berdasarkan:

- title
- description
- category
- tags
- use case

Contoh:

`coffee advertising`

`luxury skincare`

`streetwear poster`

`food photography`

Search terms juga dicatat untuk mengetahui demand user.

---

# 16. Prompt Card

Prompt card berisi:

- preview image
- title
- category
- model
- Free/Premium indicator

Optional:

- New badge
- Popular badge

Tidak perlu menampilkan prompt text di card.

User harus tertarik karena visualnya terlebih dahulu.

---

# 17. Prompt Detail Page

Prompt Detail menjadi halaman inti produk.

## Visual Preview

Image ditampilkan besar.

Jika tersedia:

- multiple output
- alternative result
- different composition

---

## Prompt Information

Menampilkan:

- title
- short description
- category
- tags
- recommended AI model
- aspect ratio
- orientation
- intended use case

---

## Prompt

Untuk free prompt:

Prompt ditampilkan penuh.

Primary CTA:

**Copy Prompt**

---

## Variables

Prompt dapat memiliki variable seperti:

`{{product}}`

`{{brand_color}}`

`{{headline}}`

`{{environment}}`

User diberi penjelasan apa yang harus diganti.

---

## Recommended Settings

Jika relevan:

- model
- aspect ratio
- reference image
- image size
- generation note

---

## How To Use

Contoh:

1. Ganti variable.
2. Masukkan product/reference image jika diperlukan.
3. Copy prompt.
4. Generate pada model yang direkomendasikan.

---

## Related Prompts

Menampilkan prompt dengan kategori/style yang relevan.

---

# 18. Free Prompt Strategy

Free prompt tetap harus berkualitas.

Tujuan free prompt:

- membangun trust
- mendatangkan SEO traffic
- social media acquisition
- menunjukkan kualitas RenderBank
- mendorong user kembali

Free prompt tidak boleh sengaja dibuat buruk.

---

# 19. Premium Content Strategy

Premium harus memiliki value lebih tinggi, bukan hanya:

> prompt gratis tetapi text-nya disembunyikan.

Premium dapat memiliki:

- lebih banyak detail
- advanced composition
- multiple variations
- reference-image workflow
- lighting variation
- alternative camera angle
- structured variables
- commercial-ready visual
- tested settings

---

# 20. Monetization

MVP menggunakan:

## Free Prompts

Gratis.

---

## One-Time Purchase Prompt Packs

User membeli pack sekali dan mendapatkan akses ke pack tersebut.

Tidak ada subscription.

Contoh:

### Product Ads Vol. 01

20–30 prompt.

Rp49.000–Rp79.000.

---

### Social Creative Vol. 01

20–30 prompt.

Rp39.000–Rp69.000.

---

### Poster Lab Vol. 01

20–30 prompt.

Rp49.000–Rp79.000.

Harga tersebut merupakan hypothesis dan dapat diubah berdasarkan validasi pasar.

---

# 21. Volume Model

Prompt packs dapat menggunakan konsep volume.

Contoh:

**Product Ads Vol. 01**

Kemudian:

**Product Ads Vol. 02**

Kemudian:

**Product Ads Vol. 03**

User hanya membeli collection yang mereka inginkan.

Model ini memungkinkan recurring revenue tanpa subscription.

---

# 22. Bundle

Setelah memiliki beberapa pack, RenderBank dapat menyediakan bundle.

Contoh:

Product Ads Vol.01

Rp59.000

Poster Lab Vol.01

Rp49.000

Social Creative Vol.01

Rp49.000

Bundle:

**Creative Bundle — Rp119.000**

Bundle dapat menjadi monetisasi penting sebelum subscription.

---

# 23. Subscription

Subscription secara eksplisit:

**Tidak masuk MVP.**

Subscription hanya akan dipertimbangkan setelah:

- library premium besar
- terdapat banyak repeat buyers
- prompt baru rutin dipublish
- traffic stabil
- revenue sudah terbukti

Possible future trigger:

- 300–500+ premium prompts
- 30–50 new premium prompts per month
- repeat purchase tinggi

Subscription harus menjadi solusi bagi user yang sering membeli pack, bukan dipaksakan sejak awal.

---

# 24. Prompt Pack Page

Setiap pack memiliki landing page.

Isi:

- pack title
- cover visual
- short description
- number of prompts
- supported models
- preview outputs
- categories
- list/preview prompt
- price
- Buy CTA

User harus dapat memahami kualitas pack sebelum membeli.

---

# 25. Checkout

Checkout harus sangat sederhana.

Minimum data:

- email
- selected product
- price

Flow:

**Buy Pack**

↓

**Checkout**

↓

**Payment**

↓

**Success**

↓

**Access Premium Pack**

Tidak perlu membuat akun.

---

# 26. Secure Access

Setelah purchase berhasil, RenderBank menghasilkan secure access token.

Contoh konsep:

`renderbank.com/access/[secure-token]`

Token tersebut harus:

- sulit ditebak
- tidak menggunakan incremental ID
- divalidasi server
- hanya membuka produk yang dibeli

Access link juga dikirim ke buyer email.

---

# 27. Content Categories

Initial categories:

## Product

Hero shot dan product photography.

## Advertising

Commercial advertisement dan campaign.

## Poster

Creative dan promotional poster.

## Social Media

Instagram, story, carousel, social creative.

## Photography

Portrait, lifestyle, fashion, architecture, etc.

## Editorial

Magazine dan editorial style.

## Typography

Typography-heavy visual.

## E-commerce

Marketplace dan ecommerce product visuals.

Kategori baru hanya dibuat jika inventory cukup.

---

# 28. Prompt Content Model

Struktur prompt:

```text
id

slug

title

short_description

description

prompt_template

access_type

category_id

tags[]

recommended_models[]

aspect_ratio

orientation

use_cases[]

requires_reference_image

generation_notes

variables[]

preview_images[]

status

published_at

created_at

updated_at
```

---

# 29. Variable Model

Variable:

```text
key
label
description
placeholder
default_value
required
```

Contoh:

```text
key: product

label: Product

placeholder: premium wireless headphones

required: true
```

Prompt:

```text
Create a premium advertising visual for {{product}}...
```

---

# 30. Prompt Pack Model

```text
id

slug

title

description

cover_image

price

currency

status

created_at

updated_at
```

Relation:

```text
pack_prompts

pack_id
prompt_id
sort_order
```

---

# 31. Purchase Model

```text
id

buyer_email

product_type

product_id

amount

currency

payment_provider

payment_reference

payment_status

access_token

created_at
```

Email harus disimpan dalam bentuk normalized.

Payment credentials sensitif tidak boleh disimpan.

---

# 32. Access Control

Prompt memiliki access type:

```text
FREE

PACK_ONLY

ADMIN
```

Future:

```text
PRO
```

Access control premium harus dilakukan server-side.

UI hiding saja tidak dianggap aman.

---

# 33. Admin CMS

Admin harus dapat mengelola RenderBank tanpa mengubah source code.

## Prompt

- create
- edit
- archive
- publish
- unpublish
- upload preview
- set category
- set tags
- set AI model
- set aspect ratio
- create variables
- write generation notes
- assign access

---

## Packs

- create
- edit
- add prompt
- remove prompt
- set order
- set price
- upload cover
- publish
- unpublish

---

## Purchases

Minimal:

- buyer email
- product
- amount
- status
- payment reference
- purchase date

---

# 34. Content Publishing Workflow

Internal workflow:

**Idea**

↓

**Write Initial Prompt**

↓

**Generate**

↓

**Iterate**

↓

**Select Best Output**

↓

**Structure Prompt**

↓

**Add Variables**

↓

**Add Metadata**

↓

**Quality Review**

↓

**Publish**

---

# 35. Quality Standard

Prompt hanya boleh dipublish jika:

- hasil visual kuat
- prompt sudah diuji
- preview sesuai dengan prompt
- variable mudah dimengerti
- model documented
- use case jelas
- tidak terlalu bergantung pada setting tersembunyi
- prompt masih dapat digunakan oleh orang lain

Premium prompt harus melewati standar lebih tinggi.

---

# 36. SEO

Public prompt page harus indexable.

Contoh:

`/prompts/luxury-coffee-advertising`

Category:

`/category/product`

Pack:

`/packs/product-ads-vol-01`

Setiap page memiliki:

- page title
- meta description
- OpenGraph image
- canonical URL
- semantic headings
- image alt text

Premium prompt text tidak boleh bocor melalui:

- HTML
- page source
- metadata
- structured data
- client bundle

jika belum dibeli.

---

# 37. Social Sharing

Public prompt harus mudah dibagikan.

Minimum:

- Copy Link

Future:

- X
- Threads
- Facebook
- Pinterest

Social preview terutama menampilkan image hasil generation.

---

# 38. Analytics

Core analytics events:

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

---

# 39. Core Metrics

## Primary Product Metric

**Prompt Copy Rate**

Formula:

Prompt Copy / Prompt Detail Views

Ini membantu mengukur apakah prompt benar-benar berguna.

---

## Discovery

- Explore views
- Prompt card CTR
- category engagement
- search usage

---

## Content

- most viewed prompts
- most copied prompts
- most viewed categories
- zero-result searches

---

## Revenue

- pack views
- checkout conversion
- purchase conversion
- revenue
- average order value
- bundle conversion
- repeat buyers

---

# 40. Performance

RenderBank adalah image-heavy website sehingga optimasi image wajib.

Required:

- responsive images
- thumbnails
- lazy loading
- modern image format
- CDN/object storage
- caching

Target LCP:

**< 2.5 seconds** pada koneksi yang wajar.

---

# 41. Responsive

RenderBank harus mobile-first atau minimal mobile-friendly karena traffic besar berpotensi datang dari social media.

Core actions harus nyaman di mobile:

- explore
- search
- filter
- copy prompt
- view pack
- checkout

---

# 42. Accessibility

Target minimal:

WCAG 2.1 AA secara praktis.

Include:

- semantic HTML
- keyboard navigation
- focus states
- form labels
- adequate contrast
- descriptive alt text
- accessible buttons

---

# 43. Design Direction

RenderBank harus terasa seperti:

- visual inspiration platform
- premium creative library
- modern design portfolio

Bukan seperti:

- enterprise dashboard
- generic SaaS
- spreadsheet database
- ecommerce marketplace tradisional

Direction:

- image-dominant
- minimal UI
- strong typography
- generous whitespace
- neutral interface
- artwork menjadi sumber warna utama

---

# 44. Recommended Launch Inventory

Minimum viable public library:

**50 prompt**

Ideal public launch:

**75–100 prompt**

Suggested distribution:

- Product: 20
- Advertising: 15
- Poster: 15
- Social Media: 10
- Photography: 10
- Editorial: 10
- Typography: 10

Tidak perlu mengikuti angka secara kaku.

Quality lebih penting.

---

# 45. Initial Paid Packs

Recommended launch packs:

## Product Ads Vol. 01

Commercial product visuals.

---

## Poster Lab Vol. 01

Creative dan advertising posters.

---

## Social Creative Vol. 01

Social media visual.

Sebaiknya monetisasi dimulai dari satu pack terlebih dahulu.

Jika berhasil, baru lanjut pack berikutnya.

---

# 46. User Journey — Free

Social Media / Google

↓

RenderBank

↓

Explore

↓

User melihat image menarik

↓

Prompt Detail

↓

Copy Prompt

↓

Generate di AI tool

↓

Success

Tidak ada login.

---

# 47. User Journey — Paid

Social / Google / RenderBank

↓

Prompt Detail

↓

Melihat recommendation pack

↓

Pack Detail

↓

Buy

↓

Masukkan email

↓

Payment

↓

Success

↓

Secure Pack Access

↓

Prompt Premium dapat digunakan

---

# 48. Content Marketing Loop

RenderBank sangat cocok menggunakan content-led growth.

Flow:

**Buat AI image**

↓

Publish ke Instagram / Threads / X / TikTok

↓

Tunjukkan hasil visual

↓

CTA:

**Get the prompt on RenderBank**

↓

User masuk RenderBank

↓

Copy free prompt

↓

Explore lebih banyak

↓

Discover premium pack

↓

Purchase

Dengan demikian proses membuat prompt juga menjadi marketing content.

---

# 49. Risks

## Prompt Mudah Dicopy

Mitigation:

Jangan menjual hanya satu text string.

Value harus berasal dari:

- curation
- testing
- variation
- structured recipe
- visual proof
- organization

---

## User Tidak Mau Membayar Prompt

Mitigation:

Gunakan free prompt terlebih dahulu untuk membangun trust.

Validasi premium menggunakan small paid pack.

---

## Model AI Berubah

Mitigation:

Simpan:

- recommended model
- tested model
- last tested date

Future:

Prompt versioning.

---

## Terlalu Banyak Feature

Mitigation:

Ikuti non-goals MVP dengan disiplin.

---

# 50. MVP Acceptance Criteria

MVP dianggap siap jika:

1. Visitor dapat membuka RenderBank tanpa login.
2. Visitor dapat browse semua free/public prompt.
3. Visitor dapat mencari prompt.
4. Visitor dapat filter prompt.
5. Visitor dapat membuka Prompt Detail.
6. Visitor dapat copy free prompt.
7. Admin dapat login.
8. Admin dapat membuat dan edit prompt.
9. Admin dapat upload preview image.
10. Admin dapat publish/unpublish prompt.
11. Admin dapat membuat premium pack.
12. Pack memiliki landing page.
13. User dapat melakukan checkout tanpa account.
14. User dapat membayar menggunakan payment provider.
15. Payment success membuat purchase record.
16. Buyer mendapatkan secure access link.
17. Premium content hanya dapat dibuka dengan authorization yang valid.
18. Core analytics berjalan.
19. Public prompt page SEO-friendly.
20. Website responsive pada mobile dan desktop.

---

# 51. Development Priority

## P0 — Wajib

- Homepage
- Explore
- Prompt Detail
- Category
- Search
- Copy Prompt
- Admin CMS
- Prompt Pack
- Checkout
- Payment
- Secure Access
- Analytics dasar
- Responsive

---

## P1 — Setelah Core Stabil

- Advanced filtering
- Related prompts
- multiple preview image
- better search
- bundle
- social sharing
- enhanced SEO

---

## P2 — Future

- user login
- saved prompts
- user library
- subscription
- creator marketplace
- community
- ratings
- personalized recommendations
- built-in generation

---

# 52. Validation Milestones

## Milestone 1 — Usage

Pertanyaan:

Apakah orang tertarik menggunakan prompt?

Signal:

Prompt copy rate.

---

## Milestone 2 — Return Usage

Pertanyaan:

Apakah orang kembali ke RenderBank?

Signal:

Returning visitor rate.

---

## Milestone 3 — Purchase

Pertanyaan:

Apakah orang mau membayar?

Signal:

Paid pack conversion.

---

## Milestone 4 — Repeat Purchase

Pertanyaan:

Apakah user yang membeli satu pack mau membeli pack lain?

Signal:

Repeat buyer rate.

Ini adalah signal penting sebelum mempertimbangkan subscription.

---

# 53. Evolusi Produk

Tahap awal:

**Curated Free Prompt Library**

↓

**Paid Prompt Packs**

↓

**Multiple Packs**

↓

**Bundles**

↓

**User Accounts**

jika kebutuhan muncul

↓

**Personal Library**

↓

**Subscription**

jika repeat purchase dan inventory sudah cukup besar

↓

**Creator Marketplace**

jika RenderBank sudah mempunyai audience dan demand

---

# 54. Product Moat

RenderBank tidak boleh bergantung pada kerahasiaan prompt.

Moat jangka panjang berasal dari:

## Taste

Kemampuan memilih visual yang benar-benar bagus.

## Curation

Tidak semua prompt layak masuk RenderBank.

## Testing

Prompt sudah dicoba.

## Dataset

Semakin banyak hubungan antara:

prompt ↔ model ↔ visual result ↔ use case.

## Organization

Prompt lebih mudah ditemukan daripada dari social media.

## Distribution

Traffic dari content, SEO, dan social media.

## Brand

RenderBank menjadi tempat terpercaya untuk mencari AI visual recipe.

---

# 55. Final Product Definition

RenderBank adalah:

> **Platform visual untuk menemukan prompt AI image berkualitas tinggi yang sudah dikurasi dan diuji, sehingga creator dapat membuat visual yang lebih baik tanpa memulai prompt dari nol.**

Core promise:

> **See it. Copy it. Customize it. Create it.**

---

# 56. Keputusan Final MVP

**Brand**

RenderBank

**Primary Content**

AI Image Prompt

**Content Source**

Curated first-party content

**Discovery**

Visual-first

**Free Content**

Yes

**User Login**

No

**Admin Login**

Yes

**User Favorites**

No

**Paid Product**

Prompt Packs

**Payment Type**

One-time purchase

**Subscription**

No

**Marketplace**

No

**Built-in Image Generator**

No

**Primary Validation**

Prompt usage + paid pack conversion

**Long-Term Goal**

Menjadi curated AI creative library yang dapat berkembang dari image prompts menjadi broader AI creative recipes.