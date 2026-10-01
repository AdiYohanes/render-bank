# RenderBank User Flows

**Document:** User Flows  
**Product:** RenderBank  
**Version:** 1.1  
**Status:** Approved for MVP  
**Last Updated:** 2026-09-29  
**Depends On:** `docs/product/PRD.md`, `docs/product/SITEMAP.md v1.2`

---

# 1. Purpose

Dokumen ini mendefinisikan alur utama pengguna RenderBank untuk MVP.

Tujuannya adalah memastikan:

- user dapat menemukan dan menggunakan free prompt dengan friction minimal;
- user dapat memahami dan membeli premium pack tanpa membuat account;
- payment tidak dianggap berhasil hanya berdasarkan browser redirect;
- premium access menggunakan secure session, bukan token yang dibawa ke setiap URL;
- buyer lama tetap memiliki akses terhadap entitlement yang dibeli;
- admin dapat mengelola prompt, pack, dan purchase dengan workflow sederhana;
- loading, empty, payment, access, dan error states memiliki perilaku yang jelas.

Dokumen ini menjelaskan **bagaimana user bergerak melalui produk**.

Detail layout per halaman akan dibahas dalam:

```text
docs/experience/SCREEN_REQUIREMENTS.md
```

Detail implementasi teknis akan dibahas dalam:

```text
docs/engineering/TECHNICAL_ARCHITECTURE.md
```

---

# 2. Product Roles

RenderBank MVP memiliki tiga role utama.

## 2.1 Visitor

Visitor adalah pengguna public tanpa account.

Visitor dapat:

- membuka Home;
- Explore prompts;
- menggunakan Search;
- menggunakan Filter;
- membuka Category;
- membuka Prompt Detail;
- copy free prompt;
- melihat premium prompt preview;
- membuka Pack Detail;
- melakukan checkout.

Visitor tidak memiliki:

- account;
- profile;
- saved prompts;
- personal library.

---

## 2.2 Buyer

Buyer adalah Visitor yang berhasil membeli premium pack.

Buyer tetap tidak memiliki account.

Buyer dikenali melalui:

```text
Purchase
+
Verified Payment
+
Entitlement
+
Secure Access Session
```

Email digunakan sebagai identitas transaksi, bukan sebagai login credential.

Buyer dapat:

- membuka secure access link;
- mendapatkan premium access session;
- melihat purchased pack dalam scope purchase tersebut;
- membuka purchased premium prompts;
- copy premium prompt yang menjadi entitlement-nya.

Satu access token dan secure session hanya membuka satu purchase. Purchase lain dengan email yang sama tidak otomatis ikut terbuka.

---

## 2.3 Admin

Admin adalah internal RenderBank operator.

Admin memiliki authentication sendiri.

Admin dapat:

- create/edit/publish prompt;
- create/edit/publish pack;
- manage categories;
- melihat purchases;
- resend access email;
- revoke/rotate access bila diperlukan.

---

# 3. User Flow Principles

Semua flow harus mengikuti prinsip berikut.

## 3.1 Shortest Path to Value

RenderBank harus mengutamakan jalur:

```text
See
↓
Open
↓
Customize
↓
Copy
```

Free prompt tidak boleh membutuhkan login.

---

## 3.2 Visual First

User seharusnya menemukan prompt melalui visual terlebih dahulu.

Prompt text tidak menjadi entry point utama discovery.

---

## 3.3 No Forced Registration

Tidak ada:

```text
Register
Login
Verify Email
Create Password
```

untuk menggunakan free prompt atau membeli pack.

---

## 3.4 Server-Verified Payment

Browser redirect dari payment provider tidak dianggap sebagai bukti payment success.

Premium entitlement hanya diberikan setelah payment state diverifikasi server-side.

---

## 3.5 Secure Premium Access

Access token hanya digunakan sebagai entry point.

Setelah tervalidasi:

```text
token
↓
secure session
↓
redirect
```

Token tidak dibawa ke Prompt Detail URL.

---

## 3.6 No Dead Ends

Search kosong, payment gagal, invalid access link, atau content unavailable harus selalu memberikan next action.

---

# 4. Flow Overview

Core MVP flows:

```text
1. Free Prompt Discovery
2. Search & Filter
3. Category Discovery
4. Premium Prompt Discovery
5. Pack Evaluation
6. Checkout
7. Payment Success
8. Payment Pending
9. Payment Failed
10. Payment Cancelled
11. Secure Access
12. Returning Buyer Access
13. Premium Prompt Usage
14. Invalid / Revoked Access
15. Admin Prompt Management
16. Prompt Variable Customization
17. Copy Prompt & Copy Failure
18. Public Share Link
19. Admin Prompt Management
20. Admin Pack Management
21. Admin Purchase Management
22. Unpublished Content Behavior
```

---

# 5. Free Prompt Discovery Flow

## Goal

User menemukan visual yang menarik dan dapat menggunakan prompt tanpa account.

## Entry Points

User dapat masuk dari:

- Home;
- Explore;
- Category;
- Google/Search Engine;
- Social Media;
- direct shared link.

## Main Flow

```text
Entry Point
    ↓
Prompt Card / Prompt URL
    ↓
Prompt Detail
    ↓
Lihat Visual Preview
    ↓
Lihat Prompt Information
    ↓
Full Free Prompt
    ↓
Review / Customize Variables
    ↓
Copy Composed Prompt
    ↓
Copied Confirmation
    ↓
User menggunakan prompt di external AI tool
```

## Success Condition

Flow dianggap berhasil ketika:

```text
prompt_copied
```

terjadi.

## Requirements

User tidak boleh:

- dipaksa login;
- dipaksa memberikan email;
- dipaksa membuka modal marketing;
- diarahkan ke checkout untuk free prompt.

## Prompt Variable Customization Flow

Jika prompt memiliki variables:

```text
Prompt Detail
 ↓
View variable fields
 ↓
Use default values or enter custom values
 ↓
Validate required variables
 ↓
Preview composed prompt
 ↓
Copy composed prompt
```

Rules:

- `Copy Prompt` menyalin composed prompt, bukan template dengan placeholder yang belum diganti;
- default value digunakan jika tersedia dan tidak diganti;
- required variable yang kosong menampilkan inline error;
- user dapat reset values ke default;
- variable values tidak dikirim ke analytics.

Prompt tanpa variable dapat langsung disalin.

## Copy Prompt Flow

```text
Copy Prompt
 ↓
Clipboard succeeds?
 ┌──────────┴──────────┐
 Yes                   No
 ↓                     ↓
Show Copied         Show copy error
 ↓                     ↓
prompt_copied       Allow manual selection
```

`prompt_copied` hanya dicatat setelah clipboard berhasil. Copied confirmation dan error harus diumumkan melalui accessible status.

## Public Share Link Flow

```text
Public Prompt Detail
 ↓
Copy Link
 ↓
Clipboard succeeds?
 ┌──────────┴──────────┐
 Yes                   No
 ↓                     ↓
Show Link Copied    Allow manual URL selection
 ↓
prompt_shared
```

Rules:

- link menggunakan canonical public Prompt Detail URL;
- link tidak boleh mengandung access token, purchase reference, atau buyer session data;
- premium prompt dapat dibagikan sebagai public locked page;
- recipient tidak memperoleh entitlement dari shared link;
- `prompt_shared` hanya dicatat setelah link berhasil disalin.

---

# 6. Home Discovery Flow

## Goal

User baru memahami apa itu RenderBank dan menemukan entry point yang menarik.

## Flow

```text
Home
 ↓
User melihat Hero
 ↓
Pilih salah satu:
 ├── Explore Prompts
 ├── Browse Free Prompts
 ├── Featured Prompt
 ├── Category
 └── Featured Pack
```

### Explore Path

```text
Home
 ↓
Explore Prompts
 ↓
/explore
```

### Browse Free Path

```text
Home
 ↓
Browse Free Prompts
 ↓
/explore?access=free
```

### Featured Prompt Path

```text
Home
 ↓
Featured Prompt
 ↓
Prompt Detail
```

### Category Path

```text
Home
 ↓
Category
 ↓
/category/[slug]
```

### Pack Path

```text
Home
 ↓
Featured Pack
 ↓
/packs/[slug]
```

---

# 7. Search Flow

## Goal

User menemukan prompt berdasarkan intent tertentu.

## Example

User mencari:

```text
luxury skincare
```

## Flow

```text
Explore
   ↓
Search input
   ↓
Submit melalui Enter / Search button
   ↓
/explore?q=luxury+skincare
   ↓
Search Results
   ↓
Prompt Card
   ↓
Prompt Detail
```

## Combined Search + Filter

Example:

```text
/explore?q=coffee&category=product&model=gpt-image&orientation=portrait
```

Flow:

```text
Search
 ↓
Filter
 ↓
URL state updated
 ↓
Results updated
 ↓
Open Prompt
```

## Empty Search State

```text
Search
 ↓
No results
 ↓
Show:
- No prompts found
- Clear Search
- Explore All
- Optional curated prompts
```

Tidak boleh blank page.

---

# 8. Filter Flow

## Goal

User mempersempit discovery tanpa berpindah ke banyak halaman.

## Available MVP Filters

- Category
- Model
- Orientation
- Access

## Flow

```text
Explore
 ↓
Select Filter
 ↓
URL query updated
 ↓
Results updated
 ↓
Prompt Card
 ↓
Prompt Detail
```

## Clear Filter

```text
Filtered Results
 ↓
Clear Filters
 ↓
/explore
```

## Empty Filter State

```text
Filter combination
 ↓
0 results
 ↓
Show:
- No prompts match these filters
- Clear Filters
```

---

# 9. Category Discovery Flow

## Goal

User menjelajahi prompt berdasarkan use case/category.

## Flow

```text
Navbar Categories
       ↓
Dropdown
       ↓
Select Category
       ↓
/category/[slug]
       ↓
Category Landing
       ↓
Prompt Grid
       ↓
Prompt Detail
```

## Important Behavior

Tidak ada route:

```text
/categories
```

pada MVP.

Jika category belum memiliki content yang layak, category tidak perlu dipublish.

---

# 10. Premium Prompt Discovery Flow

## Goal

User menemukan premium prompt dan memahami cara mendapatkannya.

## Flow

```text
Explore / Category / Direct URL
        ↓
Premium Prompt Card
        ↓
Prompt Detail
        ↓
Visual Preview
        ↓
Safe Metadata
        ↓
Premium Prompt Locked
        ↓
Included in Pack
        ↓
View Pack
        ↓
Pack Detail
```

## Locked Content Must Show

- visual preview;
- title;
- short description;
- recommended model;
- use case;
- primary sales pack containing prompt;
- CTA menuju Pack Detail.

Jika prompt tersedia dalam beberapa pack, admin menentukan satu `primary sales pack` untuk CTA utama. MVP tidak perlu menampilkan seluruh alternatif pack.

## Locked Content Must Not Expose

- full prompt;
- paid-only generation recipe;
- hidden premium variables jika dianggap premium;
- sensitive premium content dalam HTML/client payload.

---

# 11. Pack Evaluation Flow

## Goal

User memahami value sebuah premium collection sebelum membeli.

## Flow

```text
Pack Detail
   ↓
Lihat:
- Cover
- Description
- Visual examples
- Number of prompts
- Supported models
- Prompt previews
- Price
   ↓
Decision
 ┌───────────────┴───────────────┐
 Not Interested                  Buy
 ↓                               ↓
Back / Explore                Buy Pack
                              ↓
                          Checkout
```

## Success Condition

User melanjutkan ke:

```text
checkout_started
```

---

# 12. Checkout Flow

## Goal

Buyer menyelesaikan purchase dengan friction minimal.

## Flow

```text
Pack Detail
   ↓
Buy Pack
   ↓
/checkout/[pack]
   ↓
Review:
- Pack
- Price
   ↓
Input Email
   ↓
Validate Email
   ↓
Continue to Payment
   ↓
Payment Provider
```

## Checkout Required Data

```text
buyer_email
selected_pack
price
currency
```

## Not Required

- account;
- password;
- shipping;
- username;
- profile.

## Invalid Email

```text
Input Email
 ↓
Invalid format
 ↓
Inline Error
 ↓
Correct Email
```

User tetap berada di checkout.

## Server-Authoritative Checkout

Sebelum membuat payment attempt, server harus:

1. mengambil pack berdasarkan identifier route;
2. memastikan pack masih published dan purchasable;
3. menentukan price dan currency dari database;
4. mengabaikan client-submitted price atau currency.

Jika pack diarsipkan sebelum submit, payment tidak dimulai. Jika harga berubah, tampilkan harga terbaru dan minta user mengonfirmasi kembali.

## Submit Protection

Ketika checkout diproses:

- tombol submit dinonaktifkan sementara;
- repeated submit tidak boleh membuat accidental duplicate payment attempt;
- active attempt dapat digunakan kembali jika aman dan didukung provider.

---

# 13. Payment Processing Model

Payment flow harus dipahami sebagai dua jalur paralel:

```text
Browser Journey
+
Server Payment Verification
```

## Browser Journey

```text
Checkout
 ↓
Payment Provider
 ↓
Return / Redirect
```

## Server Journey

```text
Payment Provider
 ↓
Verified Webhook / Direct Verification
 ↓
Purchase State Updated
 ↓
Entitlement Created if Paid
```

Browser redirect tidak boleh mengubah payment menjadi success.

## Payment Route Reference

Payment status routes menggunakan opaque purchase reference, misalnya:

```text
/payment/success?ref=[opaque-purchase-reference]
```

Reference tersebut:

- bukan access token;
- bukan buyer email;
- bukan payment credential;
- tidak berupa incremental identifier yang mudah ditebak;
- hanya digunakan server untuk mengambil dan memverifikasi purchase state.

Aturan yang sama berlaku untuk route success, pending, failed, dan cancelled.

---

# 14. Payment Success Flow

## Preconditions

Payment sudah diverifikasi sebagai paid/settled sesuai provider.

## Flow

```text
Payment Provider
   ↓
Browser returns
   ↓
/payment/success
   ↓
Server reads purchase state
   ↓
State = PAID
   ↓
Show Purchase Success
   ↓
Open My Pack
   ↓
Secure Access Flow
```

## Success Page Content

- confirmation;
- pack purchased;
- masked buyer email, misalnya `a***@example.com`;
- `Open My Pack`;
- information bahwa access link juga dikirim melalui email.

## Reload Behavior

```text
/payment/success
 ↓
Reload
 ↓
Read existing purchase
 ↓
Do not duplicate purchase
 ↓
Do not duplicate entitlement
```

---

# 15. Payment Pending Flow

## Goal

Menangani payment yang belum final.

## Flow

```text
Payment Provider
   ↓
Return to RenderBank
   ↓
Purchase state = PROCESSING (shown as Pending)
   ↓
/payment/pending
   ↓
Show Processing State
   ↓
Check Again
   ↓
Server checks current purchase state
```

Possible outcomes:

```text
PROCESSING → remain pending
PAID       → redirect success
FAILED  → redirect failed
CANCELLED → redirect cancelled
```

Premium access tidak diberikan selama purchase masih `PROCESSING` (UI: Pending).

---

# 16. Payment Failed Flow

## Flow

```text
Payment
 ↓
State = FAILED
 ↓
/payment/failed
 ↓
Explain payment did not complete
 ↓
Actions:
- Try Again
- Return to Pack
```

## Retry

```text
Try Again
 ↓
Checkout
 ↓
Start new/retry payment according to provider rules
```

Tidak ada entitlement.

---

# 17. Payment Cancelled Flow

## Flow

```text
User cancels payment
 ↓
/payment/cancelled
 ↓
Show cancellation state
 ↓
Actions:
- Try Again
- Return to Pack
- Explore
```

Tidak ada entitlement.

---

# 18. Duplicate Payment Event Flow

## Scenario

Payment provider mengirim webhook lebih dari satu kali.

## Expected Behavior

```text
Webhook Event
 ↓
Server checks existing event/purchase state
 ↓
Already processed?
 ┌──────────┴──────────┐
 Yes                   No
 ↓                     ↓
Ignore safely       Process
                      ↓
                 Update state
                      ↓
                 Create entitlement once
```

User tidak melihat duplicate purchases atau duplicate entitlement.

Detail implementation masuk technical architecture.

---

# 19. Successful Purchase → Secure Access Flow

## Goal

Buyer mendapatkan premium access tanpa membawa token ke seluruh website.

## Flow

```text
/payment/success
      ↓
Open My Pack (purchase reference + checkout claim cookie)
      ↓
Server validates PAID purchase, active entitlement, and claim hash
      ↓
Invalid → Access denied
Valid   → Create purchase-scoped secure session
          ↓
          Set fresh HttpOnly session cookie
          ↓
          Redirect /access
```

## Important Rules

Setelah checkout claim dan purchase valid:

- raw access token tidak diperlukan pada success page dan tidak ikut ke destination URL;
- secure session dibuat server-side;
- session identifier baru dibuat setiap exchange; session lama untuk cookie tersebut di-revoke jika ada;
- session cookie menggunakan `HttpOnly`, `Secure`, dan `SameSite=Lax`;
- session memiliki expiration;
- premium access bergantung pada session + entitlement;
- session hanya membuka satu purchase;
- token tidak dikirim ke analytics.

Success-page claim exchange hanya berlaku selama checkout claim cookie masih valid; purchase reference saja tidak memberikan access. Email link tetap memakai `/access/[token]` untuk kunjungan berikutnya. Access token bersifat long-lived dan tidak dirotasi pada validasi normal. Token hanya di-revoke atau di-rotate melalui tindakan admin atau alasan keamanan. Purchased entitlement tetap permanen meskipun browser session berakhir.

---

# 20. Purchase Email Access Flow

## Goal

Buyer dapat kembali mengakses purchase di kemudian hari tanpa account.

## Flow

```text
Purchase Completed
 ↓
Access Email Sent
 ↓
Buyer opens email
 ↓
Open Purchased Pack
 ↓
/access/[token]
 ↓
Validate Token
 ↓
Create / Refresh Secure Session
 ↓
Redirect /access
```

Jika email gagal dikirim, buyer tetap dapat masuk dari success page pada initial purchase selama checkout claim cookie masih valid; setelah itu, operator perlu membantu pengiriman link pengganti.

---

# 21. Access Home Flow

## Route

```text
/access
```

## Goal

Berfungsi sebagai accountless buyer library.

Browser session bersifat sementara, tetapi purchased entitlement tetap permanen.

## Flow

```text
/access
 ↓
Validate secure access session
 ↓
Valid?
 ┌────────────┴────────────┐
 No                        Yes
 ↓                         ↓
Access unavailable       Show purchased pack
                           ↓
                       Prompt List
                           ↓
                    Premium Prompt Detail
```

## Session Scope

Session hanya boleh membuka satu purchase dan content dalam entitlement snapshot purchase tersebut. Purchase lain dengan buyer email yang sama tidak otomatis digabungkan.

---

# 22. Premium Prompt Usage Flow

## Preconditions

Buyer memiliki valid secure session dan entitlement.

## Flow

```text
/access
 ↓
Purchased Pack
 ↓
Select Prompt
 ↓
/prompts/[slug]
 ↓
Server checks entitlement
 ↓
Authorized?
 ┌────────┴─────────┐
 No                 Yes
 ↓                  ↓
Locked State      Full Premium Prompt
                    ↓
                 Copy Prompt
                    ↓
                 Copied
```

Authorization tidak boleh hanya dilakukan di client.

---

# 23. Returning Buyer With Existing Session

## Flow

```text
Buyer returns
 ↓
Open RenderBank premium prompt/access page
 ↓
Secure session still valid?
 ┌──────────┴──────────┐
 Yes                   No
 ↓                     ↓
Access allowed       Show Session Expired
                          ↓
                     Re-open access link from email
                          ↓
                     Contact support if unavailable
```

Session expiration tidak menghapus purchased entitlement. MVP tidak membutuhkan login atau self-service recovery flow.

---

# 24. Invalid Access Token Flow

## Flow

```text
/access/[token]
 ↓
Server validation
 ↓
Invalid / unavailable / revoked
 ↓
Invalid Access State
 ↓
Actions:
- Check purchase email
- Contact support to resend access link
- Return Home
- Explore
```

Tidak boleh mengekspos:

- alasan security detail;
- internal token status;
- purchase identifiers.

---

# 25. Revoked / Rotated Access Flow

## Scenario

Admin merotasi atau revoke access token.

## Behavior

Old token:

```text
/access/[old-token]
 ↓
Invalid Access
```

New token:

```text
/access/[new-token]
 ↓
Valid
 ↓
Secure Session
```

## Access Administration Semantics

### Rotate Token

```text
Old token invalid
New token issued
Entitlement remains
```

### Revoke Compromised Token

```text
Token invalid
Entitlement remains
Admin may issue replacement
```

### Suspend Entitlement

Entitlement suspension merupakan tindakan terpisah dan hanya dilakukan untuk alasan seperti refund, chargeback, fraud, atau tindakan legal/policy. Tindakan ini membutuhkan alasan administratif.

Existing secure session behavior ditentukan technical architecture berdasarkan reason for revocation atau suspension.

---

# 26. Purchased Pack Entitlement Flow

RenderBank menggunakan purchase-time snapshot.

## Purchase Moment

```text
Pack contains:
A
B
C
D
```

Purchase entitlement:

```text
Buyer owns access to:
A
B
C
D
```

## Pack Changes Later

Pack becomes:

```text
A
B
C
E
```

Existing buyer tetap memiliki:

```text
A
B
C
D
```

New buyer mendapat current pack snapshot:

```text
A
B
C
E
```

## Explicit Free Update — P1

Kemampuan memberikan prompt baru kepada existing buyers merupakan P1, bukan launch blocker.

Jika nanti admin menambahkan E sebagai free update:

```text
Existing Buyer
 ↓
Entitlement Update
 ↓
A B C D E
```

MVP Admin Pack Edit hanya mengubah current pack untuk buyer baru dan tidak memodifikasi existing snapshots.

---

# 27. Unpublished Prompt Flow

## Public Visitor

```text
Prompt unpublished
 ↓
Removed from Explore / Category
 ↓
Direct public URL
 ↓
Unavailable / 404-like public state
```

## Existing Buyer

Jika prompt termasuk entitlement:

```text
Buyer
 ↓
Premium Access
 ↓
Legacy / Unlisted Prompt
 ↓
Still Accessible
```

Prompt tidak boleh hilang dari buyer hanya karena tidak lagi dipromosikan.

---

# 28. Prompt Removed From Pack Flow

## Existing Buyer

```text
Prompt removed from current pack
 ↓
Check entitlement snapshot
 ↓
Prompt existed at purchase?
 ↓
Yes
 ↓
Buyer retains access
```

## New Buyer

New buyer hanya mendapatkan current pack snapshot.

---

# 29. Archived Pack Flow

## Public

```text
Pack archived
 ↓
Not purchasable
 ↓
Removed from active Packs discovery
```

## Existing Buyer

```text
Existing Buyer
 ↓
/access
 ↓
Archived Pack
 ↓
Purchased prompts remain accessible
```

---

# 30. Search / Filter URL Sharing Flow

## Goal

User dapat membagikan discovery state.

Example:

```text
/explore?q=coffee&category=product&model=gpt-image
```

Flow:

```text
User copies URL
 ↓
Recipient opens URL
 ↓
RenderBank reads query params
 ↓
Same search/filter state restored
```

SEO tetap menggunakan canonical `/explore`.

---

# 31. 404 Flow

## Flow

```text
Unknown route / missing public content
 ↓
404
 ↓
Show:
- Page not found
- Explore Prompts
- Home
```

No dead end.

---

# 32. Server Error Flow

## Flow

```text
Unexpected server error
 ↓
Generic Error State
 ↓
Do not expose technical details
 ↓
Actions:
- Retry
- Home
- Explore
```

---

# 33. Loading State Flows

Loading state diperlukan ketika:

- Explore loads;
- filter changes;
- search executes;
- Pack loads;
- Checkout initializes;
- payment state verifies;
- access token validates;
- secure session checks.

Example:

```text
/access/[token]
 ↓
Validating access...
 ↓
Success / Invalid
```

Jangan menampilkan locked premium content sesaat sebelum authorization selesai.

---

# 34. Admin Login Flow

## Flow

```text
/admin/login
 ↓
Enter credentials
 ↓
Authenticate
 ↓
Valid?
 ┌────────┴────────┐
 No                Yes
 ↓                 ↓
Show error      /admin/dashboard
```

Admin session terpisah dari buyer access session.

## Admin Authentication Edge States

- unauthenticated access ke `/admin/*` diarahkan ke `/admin/login`;
- setelah login berhasil, admin dapat kembali ke intended admin page yang sudah divalidasi sebagai internal path;
- expired session diarahkan ke login dengan pesan yang aman;
- login error tidak mengungkap apakah identifier admin tertentu terdaftar;
- admin dapat logout dan session dihentikan server-side;
- rate limiting dan credential security ditentukan di technical architecture.

---

# 35. Admin Create Prompt Flow

## Goal

Admin dapat membuat prompt dari draft hingga published.

## Flow

```text
/admin/prompts
 ↓
Create Prompt
 ↓
/admin/prompts/new
 ↓
Add:
- Title
- Description
- Prompt Template
- Category
- Tags
- Models
- Variables
- Generation Notes
- Preview Images
- Access Type
 ↓
Save Draft
 ↓
Preview
 ↓
Quality Review
 ↓
Publish
```

## Possible Outcomes

```text
Save Draft
Publish
Cancel
```

---

# 36. Admin Edit Prompt Flow

```text
/admin/prompts
 ↓
Select Prompt
 ↓
Edit
 ↓
Update content
 ↓
Save
 ↓
Optional Publish / Unpublish
```

## Slug Change

If published slug changes:

```text
Old Slug
 ↓
301 Redirect
 ↓
New Slug
```

Sebaiknya slug published tidak sering berubah.

---

# 37. Admin Unpublish Prompt Flow

```text
Prompt Edit
 ↓
Unpublish
 ↓
System checks:
Has existing buyer entitlement?
```

Outcome:

### No buyer entitlement

Prompt dapat menjadi unpublished normal.

### Has buyer entitlement

Prompt menjadi unavailable publicly tetapi tetap accessible sebagai legacy/unlisted content bagi entitled buyer.

Hard delete harus dihindari.

---

# 38. Admin Create Pack Flow

## Flow

```text
/admin/packs
 ↓
Create Pack
 ↓
Add:
- Title
- Description
- Cover
- Price
- Currency
 ↓
Select Prompts
 ↓
Arrange Order
 ↓
Preview Pack
 ↓
Publish
```

---

# 39. Admin Edit Pack Flow

```text
/admin/packs
 ↓
Select Pack
 ↓
Edit
 ↓
Add / Remove / Reorder Prompts
 ↓
Save
```

## Important Rule

Changing current pack membership tidak boleh menghapus existing buyer entitlement snapshot.

---

# 40. Admin Archive Pack Flow

```text
Pack Edit
 ↓
Archive Pack
 ↓
Remove from active sales
 ↓
Prevent new purchase
 ↓
Keep existing buyer access
```

---

# 41. Admin Purchase Review Flow

## Flow

```text
/admin/purchases
 ↓
Select Purchase
 ↓
View:
- Buyer Email
- Pack
- Amount
- Currency
- Payment State
- Payment Reference
- Purchase Date
- Access Status
```

Possible operational actions:

- resend access email;
- rotate access token;
- revoke a compromised token;
- suspend entitlement separately when justified by refund, chargeback, fraud, or legal/policy action.

Token rotation atau revocation tidak menghapus entitlement. No CRM required.

---

# 42. Access Email Failure Flow

## Scenario

Payment berhasil tetapi transactional email gagal dikirim.

## Buyer Experience

```text
Payment Success
 ↓
Open My Pack
 ↓
Secure Access
```

Buyer tetap bisa menggunakan purchase pada current browser selama checkout claim cookie masih valid; `Open My Pack` menukar claim tersebut menjadi purchase-scoped session tanpa menunggu email.

## Admin Experience

```text
/admin/purchases
 ↓
Purchase
 ↓
Resend Access Email
```

Email failure tidak boleh membatalkan valid purchase.

---

# 43. Pack Not Available Flow

## Scenario

Visitor membuka pack yang sudah tidak dijual.

Possible behavior:

```text
Pack URL
 ↓
Archived / Unavailable State
 ↓
Show:
- Pack no longer available
- Explore Packs
- Explore Prompts
```

Jika pack masih perlu dipertahankan untuk SEO/editorial reasons, CTA purchase harus dihilangkan.

---

# 44. Analytics Events by Flow

Recommended events:

## Discovery

```text
home_viewed
explore_viewed
category_viewed
search_performed
filter_applied
prompt_viewed
```

## Prompt Usage

```text
prompt_copied
prompt_shared
```

## Premium

```text
premium_prompt_viewed
pack_viewed
checkout_started
```

## Payment

```text
purchase_completed
purchase_failed
```

`purchase_completed` hanya dicatat setelah server membaca verified `PAID` state dan harus dideduplicate berdasarkan purchase/event identifier. `purchase_failed` hanya dicatat dari payment state yang valid, bukan sekadar kunjungan ke route failed.

Pending/cancel states dapat dicatat jika berguna.

## Important Privacy Rule

Analytics tidak boleh menerima:

- buyer email;
- access token;
- payment reference;
- raw premium prompt content;
- user-entered variable values.

---

# 45. Primary Success Flows

RenderBank MVP memiliki dua critical happy paths.

## Critical Flow A — Free Usage

```text
Discover
 ↓
Prompt Detail
 ↓
Copy Prompt
```

Target:

sesingkat mungkin.

---

## Critical Flow B — Paid Usage

```text
Discover Premium Prompt
 ↓
Pack Detail
 ↓
Checkout
 ↓
Verified Payment
 ↓
Secure Access
 ↓
Premium Prompt
 ↓
Copy Prompt
```

Semua design decision harus menjaga dua flow ini tetap sederhana.

---

# 46. Flow Priority

## P0 — Must Work at Launch

- Home discovery
- Explore
- Search
- Filter
- Category
- Free Prompt Detail
- Variable customization
- Copy Prompt and copy failure fallback
- Public Share Link
- Premium Prompt Lock
- Pack Detail
- Checkout
- Payment success
- Payment pending
- Payment failed
- Payment cancelled
- Secure access token validation
- Secure buyer session
- Premium Prompt access
- Admin login
- Admin create/edit prompt
- Admin create/edit pack
- Admin purchase review

## P1 — Important, Not Launch Blocking

- Related prompts
- explicit free updates for existing buyers
- sophisticated empty recommendations
- advanced email recovery
- richer admin analytics
- additional access convenience features

---

# 47. Flow Decisions Locked for MVP

The following decisions are considered locked unless PRD or Sitemap is intentionally revised:

1. Free prompts do not require login.
2. Public user accounts do not exist in MVP.
3. Premium products are purchased as one-time prompt packs.
4. Premium prompt discovery leads to Pack Detail before checkout.
5. Browser redirect is not payment proof.
6. Payment entitlement is created only after verified server-side payment.
7. Payment supports success, pending, failed, and cancelled states.
8. Access token is only used for initial validation.
9. Premium browsing uses secure server-managed session.
10. Token is not carried into Prompt Detail URLs.
11. `/access` acts as an accountless buyer library; session sementara, entitlement permanen.
12. Satu access token dan session hanya membuka satu purchase.
13. Session cookie menggunakan `HttpOnly`, `Secure`, dan `SameSite=Lax` serta memiliki expiration.
14. Access token long-lived dan tidak dirotasi pada validasi normal.
15. Payment routes menggunakan opaque purchase reference.
16. Checkout price dan currency ditentukan server-side.
17. Buyer entitlement uses purchase-time pack snapshot.
18. Existing buyers keep access to purchased prompts if pack contents later change.
19. Unpublished purchased prompts remain accessible to entitled buyers.
20. Packs may stop selling without removing existing buyer access.
21. Search and filter state is represented through `/explore` query parameters.
22. Search/filter empty states must provide recovery actions.
23. Admin workflow remains operationally simple for MVP.
24. Copy Prompt menyalin composed prompt dan hanya mencatat event setelah clipboard berhasil.
25. Shared links selalu menggunakan canonical public URL tanpa credential atau purchase reference.

---

# 48. Next Document

Setelah `docs/experience/USER_FLOWS.md` disetujui, dokumen berikutnya adalah:

```text
docs/experience/SCREEN_REQUIREMENTS.md
```

Dokumen tersebut akan menerjemahkan setiap flow menjadi kebutuhan konkret per screen, termasuk:

- page purpose;
- required sections;
- primary CTA;
- secondary actions;
- states;
- responsive behavior;
- content requirements;
- access behavior.
