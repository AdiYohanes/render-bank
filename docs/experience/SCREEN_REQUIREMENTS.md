# RenderBank Screen Requirements

**Document:** Screen Requirements  
**Product:** RenderBank  
**Version:** 1.1  
**Status:** Approved for MVP  
**Last Updated:** 2026-09-29  
**Depends On:** `docs/product/PRD.md`, `docs/product/SITEMAP.md v1.2`, `docs/experience/USER_FLOWS.md v1.1`

---

# 1. Purpose

Dokumen ini mendefinisikan kebutuhan setiap screen utama RenderBank MVP.

Tujuannya adalah menerjemahkan PRD, sitemap, dan user flow menjadi requirement yang cukup jelas untuk:

- low-fidelity wireframe;
- visual direction;
- design system;
- high-fidelity design;
- technical architecture;
- implementation planning.

Dokumen ini fokus pada **apa yang harus tersedia di setiap screen**, bukan pada detail visual final.

---

# 2. Global Product Principles

Semua screen harus mengikuti prinsip berikut.

## 2.1 Visual First

Visual output adalah elemen utama discovery.

UI tidak boleh terasa seperti database prompt atau dashboard enterprise.

---

## 2.2 Low Friction

Free prompt harus dapat digunakan tanpa:

- login;
- registration;
- email gate;
- unnecessary modal.

---

## 2.3 Clear Access State

User harus selalu memahami apakah sebuah prompt:

- Free;
- Premium;
- Owned / Unlocked;
- Unavailable.

---

## 2.4 Mobile Friendly

Semua public screen harus nyaman digunakan dari mobile karena traffic berpotensi besar datang dari social media.

---

## 2.5 No Dead Ends

Error, empty, payment, dan access states harus selalu memiliki next action.

---

# 3. Global Navigation Requirements

## Desktop Header

Required:

- RenderBank logo / wordmark;
- Explore;
- Categories dropdown;
- Packs;
- Search entry.

Tidak ada:

- Login;
- Register;
- User avatar;
- Subscription CTA.

## Mobile Header

Required:

- logo;
- Search;
- menu trigger.

Menu minimal berisi:

- Explore;
- Categories;
- Packs.

Categories dapat berupa expandable list.

---

# 4. Global Footer Requirements

Required:

- Explore;
- Packs;
- About;
- Terms;
- Privacy.

Optional:

- social links;
- copyright;
- short brand description.

Footer tidak boleh terlalu berat.

---

# 5. Home Screen

**Route**

```text
/
```

## Purpose

Memperkenalkan RenderBank dengan cepat dan membawa user menuju discovery atau premium collection.

## Primary Goal

User memahami:

> RenderBank adalah curated AI visual prompt library.

dan melakukan salah satu action:

- Explore Prompts;
- buka prompt;
- buka category;
- buka pack.

## Required Sections

### 5.1 Hero

Required content:

- headline;
- supporting copy;
- primary CTA;
- optional secondary CTA;
- strong visual/example prompt composition.

Recommended copy direction:

```text
Don't prompt from scratch.
Discover tested prompts for better AI visuals.
```

Primary CTA:

```text
Explore Prompts
```

Secondary CTA:

```text
Browse Free Prompts
→ /explore?access=free
```

### 5.2 Featured Prompts

Required:

- curated prompt cards;
- visual preview;
- title;
- category;
- model;
- access indicator.

### 5.3 Browse by Category

Required:

- major categories;
- visual or editorial treatment;
- direct link ke `/category/[slug]`.

### 5.4 Latest Drops

Required if enough content exists.

Show:

- latest published prompts;
- clear recency signal if useful.

### 5.5 Featured Packs

Required when paid pack exists.

Show:

- pack cover;
- title;
- short description;
- price;
- pack CTA.

## Primary CTA

```text
Explore Prompts
```

## Secondary Actions

- Open Prompt
- Open Category
- Open Pack

## Empty / Early Launch State

Jika inventory masih sedikit:

- kurangi section;
- jangan tampilkan section kosong;
- gunakan curated highlights.

## Mobile Requirements

- hero CTA harus langsung terlihat;
- featured prompt grid tetap image-first;
- horizontal scrolling boleh digunakan untuk secondary collections jika lebih ringan;
- search tetap mudah diakses.

## SEO

Indexable.

---

# 6. Explore Screen

**Route**

```text
/explore
```

## Purpose

Menjadi main discovery workspace RenderBank.

## Primary Goal

User menemukan prompt yang relevan secepat mungkin.

## Required Components

### 6.1 Search

Required:

- prominent search input;
- clear button;
- query state reflected in URL.

Example:

```text
/explore?q=luxury+skincare
```

### 6.2 Filter Controls

MVP filters:

- Category
- Model
- Orientation
- Access

Filter state harus reflected in URL.

### 6.3 Result Summary

Recommended:

- optional result count;
- active filter summary.

### 6.4 Prompt Grid

Required:

- visual card;
- responsive layout;
- progressive/lazy image loading.

### 6.5 Clear Filters

Visible when filters active.

## Prompt Card Requirements

Each card must show:

- preview image;
- title;
- category;
- model;
- Free/Premium state.

Optional:

- New badge.

## Search Empty State

Required:

```text
No prompts found.
```

Actions:

- Clear Search
- Explore All

Optional:

- curated fallback prompts.

## Filter Empty State

Required:

```text
No prompts match these filters.
```

CTA:

```text
Clear Filters
```

## Loading State

Use:

- image/card skeletons;
- filter remains interactive when possible.

Do not flash empty results before loading completes.

## Mobile Requirements

- filters can collapse into sheet/drawer;
- search remains visible;
- active filter count should be understandable;
- card tap targets must be large enough.

## SEO

Index `/explore`.

Dynamic query states canonical ke `/explore`.

---

# 7. Category Screen

**Route**

```text
/category/[slug]
```

## Purpose

Menjadi editorial discovery page untuk category tertentu dan landing SEO.

## Required Content

- category title;
- short category description;
- prompt grid;
- optional supporting editorial copy.

## Recommended Example

```text
Product
AI prompts for commercial product photography and advertising visuals.
```

## Required Actions

- Open Prompt
- Explore all prompts

## Low Inventory Behavior

Jika content sedikit:

- gunakan curated layout;
- jangan tampilkan empty-looking giant grid.

Jika tidak ada content layak:

- category tidak dipublish.

## Mobile Requirements

Sama dengan Explore tetapi lebih editorial dan sederhana.

## SEO

Indexable, self canonical.

---

# 8. Prompt Detail — Free

**Route**

```text
/prompts/[slug]
```

## Purpose

Menampilkan visual, context, dan reusable prompt secara lengkap.

## Primary Goal

User melakukan:

```text
Copy Prompt
```

## Required Sections

### 8.1 Visual Preview

Required:

- large primary image;
- appropriate aspect ratio;
- high-quality optimized asset.

Optional later:

- alternate outputs;
- carousel/gallery.

### 8.2 Prompt Header

Required:

- title;
- short description;
- category;
- model;
- aspect ratio;
- access state.

Optional:

- tags;
- use case.

### 8.3 Prompt Content

Required:

- full prompt;
- readable formatting;
- copy action.

Primary CTA:

```text
Copy Prompt
```

After click:

```text
Copied
```

No login modal.

### 8.4 Variables

Display only if prompt has variables.

Each variable requires:

- accessible label;
- description of what to replace;
- placeholder/example value;
- default value when available;
- required indicator when applicable;
- editable input;
- inline validation.

Variable interaction:

```text
Enter or accept variable values
↓
Validate required values
↓
Preview composed prompt
↓
Copy composed prompt
```

Required behavior:

- `Copy Prompt` copies the composed prompt, not an unresolved template;
- an empty required variable shows an inline error;
- user can reset values to defaults;
- prompt without variables can be copied directly;
- unresolved placeholders must not be copied without a warning;
- user-entered variable values are never sent to analytics.

### 8.5 Recommended Settings

Only render relevant settings.

Possible:

- model;
- aspect ratio;
- requires reference image;
- generation notes.

### 8.6 How To Use

Short, practical steps.

### 8.7 Related Prompts

P1, not launch blocking.

If implemented:

- same category;
- shared tags.

## Secondary Actions

- Copy Link
- Open Category

## Loading State

Do not render misleading prompt content before data resolved.

## Mobile Requirements

- Copy Prompt CTA must be easy to reach;
- prompt text must remain readable;
- image should not push core action too far below fold unnecessarily.

## SEO

Indexable.

---

# 9. Prompt Detail — Premium Locked

**Route**

```text
/prompts/[slug]
```

Same route as free prompt.

## Purpose

Menunjukkan value prompt tanpa membocorkan premium content.

## Required Visible Content

- visual preview;
- title;
- short description;
- category;
- recommended model;
- aspect ratio/use case if safe;
- primary sales pack association;
- premium state.

Jika prompt tersedia dalam beberapa pack, tampilkan satu `primary sales pack` sebagai tujuan CTA utama. MVP tidak perlu menampilkan seluruh alternatif pack.

## Locked Section

Must clearly communicate:

```text
Premium prompt
Included in Product Ads Vol. 01
```

CTA:

```text
View Pack
```

## Must Not Expose

- full prompt;
- premium-only instructions;
- raw premium variables if protected;
- premium prompt body in HTML/client payload.

## UX Requirement

Locked state tidak boleh terasa seperti error.

User harus mengerti:

1. apa visualnya;
2. prompt ini premium;
3. pack mana yang menyediakannya;
4. langkah berikutnya.

## SEO

Indexable only with safe public metadata.

---

# 10. Prompt Detail — Premium Unlocked

**Route**

```text
/prompts/[slug]
```

## Preconditions

- secure buyer session valid;
- entitlement valid.

## Required Behavior

Same general layout and variable customization behavior as Free Prompt Detail, but:

- premium content visible;
- premium variables/settings visible;
- composed prompt preview available when variables exist;
- Copy Prompt enabled and copies the composed prompt.

## Ownership Indicator

Recommended small state:

```text
Unlocked
```

or:

```text
Included in your purchased pack
```

Avoid overly SaaS-like account UI.

## Unauthorized Session Behavior

If session missing/invalid:

- revert to locked state;
- do not show temporary content flash.

---

# 11. Packs Index

**Route**

```text
/packs
```

## Purpose

Editorial storefront untuk premium prompt collections.

## Required Sections

- page title;
- short explanation;
- published pack cards.

## Pack Card Required Content

- cover;
- title;
- short description;
- number of prompts;
- price;
- CTA.

## One-Pack Launch State

Jika hanya ada satu pack:

- gunakan hero/editorial presentation;
- route tetap dipertahankan;
- jangan tampilkan layout yang terlihat kosong.

## No Pack State

Jika belum ada pack tetapi route sudah live:

- curated coming-soon state;
- CTA Explore Free Prompts.

## SEO

Indexable.

---

# 12. Pack Detail

**Route**

```text
/packs/[slug]
```

## Purpose

Menjadi dedicated sales page untuk premium pack.

## Primary Goal

User melakukan:

```text
Buy Pack
```

## Required Sections

### 12.1 Pack Hero

Required:

- cover;
- pack title;
- one-line value proposition;
- price;
- primary CTA.

### 12.2 What You Get

Required:

- number of prompts;
- category/use cases;
- supported models;
- purchase type:

```text
One-time purchase
```

This should be explicit.

### 12.3 Visual Examples

Strong preview gallery of included output.

This is a major sales component.

### 12.4 Included Prompt Preview

Show enough to understand quality.

Can show:

- thumbnails;
- titles;
- safe descriptions.

Do not reveal locked prompt text.

### 12.5 Pack Description

Explain intended user/use case.

### 12.6 Access Explanation

Simple message:

```text
Pay once. Access your purchased prompts through a secure link sent to your email.
```

Avoid technical wording.

### 12.7 Purchase CTA

Primary:

```text
Buy Pack
```

## Optional Later

- FAQ;
- bundle recommendation;
- testimonial.

Not blocker MVP.

## Archived Pack State

If no longer sold:

- remove Buy CTA;
- communicate unavailable status;
- provide Explore Packs / Explore Prompts CTA.

## Mobile Requirements

- price + Buy CTA should remain obvious;
- long galleries must stay performant.

## SEO

Published: indexable.

---

# 13. Checkout Screen

**Route**

```text
/checkout/[pack]
```

## Purpose

Complete purchase with minimum friction.

## Required Content

### Order Summary

- pack title;
- pack image/cover;
- price;
- currency;
- one-time purchase label.

### Buyer Email

Required field:

```text
Email
```

Helper text should explain:

> Access link will be sent to this email.

### Primary CTA

Depending on payment integration:

```text
Continue to Payment
```

or:

```text
Pay Now
```

### Trust / Context

Optional short copy:

- secure payment;
- digital product;
- no subscription.

## Validation States

- empty email;
- invalid email;
- pack no longer purchasable;
- price changed before submit;
- payment initialization error.

Errors should be inline and actionable.

## Server-Authoritative Purchase Data

Before payment initialization, the server must:

1. load the pack from the route identifier;
2. verify that it is published and purchasable;
3. determine authoritative price and currency from the database;
4. ignore client-submitted price and currency.

If the pack was archived, payment must not start. If the price changed, show the updated price and require confirmation before continuing.

## Submit Protection

While payment initializes:

- disable the primary CTA;
- show a clear processing state;
- repeated clicks must not create accidental duplicate attempts;
- reuse an active attempt when safe and supported by the payment provider.

## Must Not Include

- password;
- shipping address;
- profile fields;
- account creation;
- newsletter opt-in as mandatory.

## Mobile Requirements

- order summary concise;
- input and CTA visible without excessive scrolling.

## SEO

Noindex.

---

# 14. Payment Success Screen

**Route**

```text
/payment/success?ref=[opaque-purchase-reference]
```

## Purchase Reference Requirement

All payment status screens use an opaque purchase reference to locate the server-side purchase record.

The reference:

- is not an access token;
- is not a buyer email;
- is not a payment credential;
- is not an easily guessed incremental ID;
- is not displayed in the UI or sent to analytics;
- is used only by the server to retrieve and verify purchase state.

## Purpose

Confirm verified purchase and provide immediate route to content.

## Preconditions

Server purchase state = paid/settled.

## Required Content

- success indicator;
- purchase confirmation;
- purchased pack;
- masked destination email, for example `a***@example.com`;
- message that access email was sent;
- primary CTA.

Primary CTA:

```text
Open My Pack
```

## Secondary Action

```text
Explore More Prompts
```

## Email Failure State

If payment valid but email delivery fails:

- still show purchase success;
- keep `Open My Pack` available;
- optionally indicate email may take time / provide resend support later.

Do not turn purchase into failure.

## Reload Behavior

Page should be idempotent and show existing purchase state.

## SEO

Noindex.

---

# 15. Payment Pending Screen

**Route**

```text
/payment/pending?ref=[opaque-purchase-reference]
```

## Purpose

Communicate that payment is not final.

## Required Content

- clear pending state;
- explanatory copy;
- no premium access;
- status check action.

Primary CTA:

```text
Check Again
```

Secondary:

```text
Return to Pack
```

## State Transition

Possible redirects after recheck:

- success;
- failed;
- cancelled;
- remain pending.

## SEO

Noindex.

---

# 16. Payment Failed Screen

**Route**

```text
/payment/failed?ref=[opaque-purchase-reference]
```

## Purpose

Explain failed payment and support recovery.

## Required Content

- failed state;
- non-technical explanation;
- retry action.

Primary CTA:

```text
Try Again
```

Secondary:

```text
Return to Pack
```

## Must Not

- imply money was successfully received;
- grant access.

## SEO

Noindex.

---

# 17. Payment Cancelled Screen

**Route**

```text
/payment/cancelled?ref=[opaque-purchase-reference]
```

## Purpose

Handle deliberate or provider-level cancellation.

## Required Actions

- Try Again
- Return to Pack
- Explore Prompts

Tone should be neutral, not alarming.

## SEO

Noindex.

---

# 18. Access Token Validation Screen

**Route**

```text
/access/[token]
```

## Purpose

Temporary validation entry point.

This is not a content browsing page.

## Required UI

During validation:

```text
Validating your access...
```

Minimal branding only.

## Valid Outcome

```text
Create secure session
↓
Redirect /access
```

## Invalid Outcome

Show:

```text
This access link is invalid or no longer available.
```

Actions:

- Check purchase email
- Contact Support to resend the access link
- Return Home
- Explore Prompts

## Security and Session Requirements

On successful validation:

```text
Validate long-lived access token
↓
Create server-managed session
↓
Rotate session identifier
↓
Redirect to /access
```

Requirements:

- access token is not rotated during normal validation;
- token is removed from the destination URL;
- token is not displayed or sent to analytics;
- session cookie uses `HttpOnly`, `Secure`, and `SameSite=Lax`;
- session has an expiration;
- session opens one purchase only;
- no premium content before validation or authorization resolves;
- no share/copy token action;
- minimal third-party scripts.

## SEO

Noindex.

---

# 19. Access Home / Accountless Buyer Library

**Route**

```text
/access
```

## Purpose

Accountless buyer library without a public user account.

The browser session is temporary, but purchased entitlement remains permanent.

One session opens one purchase only. Purchases with the same buyer email are not merged automatically.

## Required Content

- purchased pack within the current purchase scope;
- pack title;
- prompt list;
- clear unlocked state.

## Pack Representation

Can use:

- cover;
- pack title;
- prompt count;
- prompt grid/list.

## Prompt Item Required

- image;
- title;
- model/category if useful;
- unlocked state.

Click:

```text
/prompts/[slug]
```

## No Valid Session State

Do not show empty library.

Show:

```text
Your access session has ended.
Your purchase is still available through the secure link sent to your email.
```

Instruction:

```text
Open the access link from your purchase email.
```

CTA:

- Contact Support if the email/link is unavailable
- Home
- Explore

## Mobile Requirements

Should feel lightweight, not like SaaS dashboard.

## SEO

Noindex.

---

# 20. Invalid Access State

May appear inside `/access/[token]` flow.

## Required Content

- simple explanation;
- recovery path.

Avoid security details such as:

- token expired at exact timestamp;
- token hash mismatch;
- revoke reason.

---

# 21. About Screen

**Route**

```text
/about
```

## Purpose

Explain RenderBank's concept and quality philosophy.

## Required Sections

- what RenderBank is;
- why visual-first;
- how prompts are curated/tested;
- who it is for.

Optional:

- creator/founder note;
- content philosophy.

Keep concise.

---

# 22. Terms Screen

**Route**

```text
/terms
```

## Purpose

Legal/product terms.

Must eventually cover:

- digital purchases;
- usage rights;
- sharing restrictions;
- refund policy;
- access responsibility;
- acceptable use.

Design should prioritize readability.

---

# 23. Privacy Screen

**Route**

```text
/privacy
```

## Purpose

Explain handling of:

- email;
- payment metadata;
- analytics;
- cookies if applicable.

Readable, plain structure preferred.

---

# 24. 404 Screen

## Purpose

Recover from missing routes/content.

## Required Content

- clear `Page not found`;
- primary CTA:

```text
Explore Prompts
```

- secondary CTA:

```text
Home
```

Optional:

- featured prompts.

No dead end.

---

# 25. Generic Server Error Screen

## Purpose

Handle unexpected application failure.

## Required Content

- generic message;
- Retry;
- Home / Explore.

Must not expose:

- stack traces;
- IDs that reveal internal systems;
- secret values.

---

# 26. Admin Login Screen

**Route**

```text
/admin/login
```

## Purpose

Authenticate RenderBank administrator.

## Required Content

- login form;
- error state;
- loading state.

Public branding can be minimal.

## Success

Redirect:

```text
/admin/dashboard
```

## SEO

Noindex.

---

# 27. Admin Dashboard Screen

**Route**

```text
/admin/dashboard
```

## Purpose

Operational overview only.

## Recommended MVP Summary

- Total Prompts
- Published Prompts
- Draft Prompts
- Active Packs
- Purchases
- Basic Revenue

## Quick Actions

- New Prompt
- New Pack

## Not Required

- sophisticated charts;
- cohort analysis;
- CRM;
- complex revenue analytics.

---

# 28. Admin Prompts List

**Route**

```text
/admin/prompts
```

## Purpose

Manage all prompt records.

## Required Columns / Information

- title;
- status;
- access type;
- category;
- model;
- updated date.

## Required Actions

- Create Prompt
- Edit
- Publish / Unpublish where safe
- Archive

## Filters

Recommended:

- status;
- Free/Premium;
- category.

## Search

Recommended for admin if inventory grows.

Can be basic.

---

# 29. Admin Create Prompt

**Route**

```text
/admin/prompts/new
```

## Purpose

Create prompt as structured content.

## Required Fields

- Title
- Slug
- Short Description
- Description
- Prompt Template
- Access Type
- Category
- Tags
- Recommended Model(s)
- Aspect Ratio
- Orientation
- Use Case(s)
- Requires Reference Image
- Generation Notes
- Variables
- Preview Image(s)
- Status
- Primary Sales Pack when `Access Type = PACK_ONLY` and the prompt belongs to one or more packs

If pack membership is managed from Pack Edit, Prompt Edit must at least display the resolved primary sales pack and link to the related pack configuration.

## Required Actions

```text
Save Draft
Preview
Publish
```

Publish should only be available when minimum required data exists.

## Validation

Required fields must be explicit.

---

# 30. Admin Edit Prompt

**Route**

```text
/admin/prompts/[id]/edit
```

## Same Core Form as Create

Additional information:

- current status;
- published date;
- entitlement warning if purchased;
- slug history if applicable.

## Slug Change Warning

If published prompt slug changes:

- warn admin;
- system must create redirect.

## Unpublish Warning

If prompt belongs to buyer entitlement:

Display warning such as:

```text
This prompt has existing buyer entitlement.
Unpublishing will remove it from public discovery but will not remove buyer access.
```

---

# 31. Admin Packs List

**Route**

```text
/admin/packs
```

## Required Information

- title;
- status;
- price;
- prompt count;
- purchase count if available;
- updated date.

## Actions

- New Pack
- Edit
- Publish
- Archive

---

# 32. Admin Create Pack

**Route**

```text
/admin/packs/new
```

## Required Fields

- Title
- Slug
- Description
- Cover
- Price
- Currency
- Prompt Selection
- Prompt Order
- Status

## Required Actions

- Save Draft
- Preview
- Publish

## Prompt Selection UX

Must support:

- finding prompts;
- adding/removing prompts;
- ordering selected prompts.

Does not require drag-and-drop if simpler controls are adequate for MVP.

---

# 33. Admin Edit Pack

**Route**

```text
/admin/packs/[id]/edit
```

## Additional Requirements

If pack already has purchases:

Show notice:

```text
Existing buyers retain their purchase-time prompt entitlement.
```

Admin may:

- add new prompts for future purchases;
- remove prompts from future purchases;
- reorder current pack;
- archive pack.

Adding a prompt in MVP does not automatically grant it to existing buyers. Explicit free updates to existing entitlement snapshots are P1.

Removing prompt must not silently revoke existing buyer entitlement.

---

# 34. Admin Categories Screen

**Route**

```text
/admin/categories
```

## Purpose

Manage category structure.

## Required Information

- name;
- slug;
- status;
- prompt count.

## Actions

- create;
- edit;
- archive.

Avoid hard delete when content exists.

---

# 35. Admin Purchases Screen

**Route**

```text
/admin/purchases
```

## Purpose

Operational visibility into purchases.

## Required Information

- buyer email;
- pack;
- amount;
- currency;
- payment state;
- purchase date;
- access state.

## Required Actions

Recommended:

- View Purchase
- Resend Access Email
- Rotate Access Token
- Revoke Compromised Token
- Suspend Entitlement

### Rotate Access Token

- invalidate the old token;
- issue a new token;
- keep entitlement active;
- allow sending a replacement access email.

### Revoke Compromised Token

- invalidate the token;
- keep entitlement active;
- allow a replacement token to be issued later.

### Suspend Entitlement

This is a separate action for refund, chargeback, fraud, or legal/policy reasons. It must require confirmation and an administrative reason.

Token rotation or revocation must never silently remove entitlement.

## Purchase Detail

Can be drawer, modal, or dedicated detail in MVP.

Must show:

- payment reference;
- entitlement snapshot summary;
- access status;
- email delivery status if available.

---

# 36. Global Prompt Card Specification

Used on:

- Home;
- Explore;
- Category;
- Related Prompts;
- Access Library.

## Required

- image;
- title;
- category;
- recommended model;
- access state.

## Access Labels

Recommended:

```text
Free
Premium
Unlocked
```

Avoid too many badges.

## Interaction

Whole card or primary visual/title should open Prompt Detail.

---

# 37. Global Pack Card Specification

Used on:

- Home;
- Packs Index;
- optional related pack placements.

## Required

- cover;
- title;
- short description;
- prompt count;
- price.

Optional:

- model summary.

---

# 38. Global Search Behavior

Search should support user intent such as:

```text
coffee
luxury skincare
product photography
streetwear poster
```

## UX Requirements

- query persists in URL;
- clear button;
- Enter/submit works;
- search does not require login.

Search intelligence can remain basic for MVP.

---

# 39. Global Filter Behavior

## Active Filters

User must understand which filters are active.

Recommended:

- chips;
- count badge;
- visible reset.

## Mobile

Use bottom sheet/drawer if needed.

## Reset

One obvious action:

```text
Clear Filters
```

---

# 40. Global Copy and Share Interactions

## Copy Prompt

Button:

```text
Copy Prompt
```

Copy the composed prompt when variables exist.

On success:

```text
Copied
```

If clipboard operation fails:

- show an accessible error status;
- provide manual text selection/copy fallback;
- do not silently fail.

Record `prompt_copied` only after the clipboard operation succeeds. Never send raw prompt text or user-entered variable values to analytics.

## Copy Public Link

Button:

```text
Copy Link
```

Required behavior:

- copy the canonical public `/prompts/[slug]` URL;
- never include an access token, opaque purchase reference, or session data;
- premium prompts share their public locked page and do not grant entitlement;
- show an accessible `Link copied` status on success;
- provide manual URL selection if clipboard access fails;
- record `prompt_shared` only after the clipboard operation succeeds.

---

# 41. Loading State Standards

## Public Grid

Use skeletons/placeholders.

## Payment Verification

Use explicit status text:

```text
Checking your payment...
```

## Access Validation

Use:

```text
Validating your access...
```

## Admin Save

Disable duplicate submit while saving.

---

# 42. Empty State Standards

Every empty state should include:

1. what happened;
2. why it may have happened when useful;
3. next action.

Examples:

### Explore

```text
No prompts found.
Clear your search or explore all prompts.
```

### Filter

```text
No prompts match these filters.
```

### Packs

```text
New curated packs are coming soon.
Explore free prompts in the meantime.
```

---

# 43. Access State Standards

Prompt access states:

```text
FREE
PREMIUM_LOCKED
PREMIUM_UNLOCKED
UNAVAILABLE
```

The UI must never confuse:

```text
Premium Locked
```

with:

```text
Error
```

---

# 44. Payment State Standards

Payment states displayed to users:

```text
PROCESSING
PAID
FAILED
CANCELLED
UNKNOWN_ERROR
```

Internal provider-specific states may be mapped into these UX states.

Mapping rule:

```text
Internal PENDING → User-facing Processing
```

`UNKNOWN_ERROR` uses the current payment status route and does not require a new route. Show:

```text
We couldn't verify your payment status.
```

Actions:

- Check Again;
- Return to Pack.

Do not grant entitlement or describe the payment as failed while its state is unknown.

---

# 45. Responsive Design Requirements

## Mobile First Priorities

On mobile, prioritize:

1. Visual
2. Title/context
3. Primary CTA
4. Prompt content
5. Secondary metadata

Do not make metadata push the main action excessively downward.

## Touch Targets

Buttons and interactive controls must be comfortably tappable.

## Filters

Should not consume most of the viewport.

## Prompt Text

Readable without horizontal scrolling.

## Mobile Prompt Action

`Copy Prompt` must remain easy to reach. A simple sticky action may be used when it does not cover prompt content or browser controls. For prompts with variables, keep the action close to the composed prompt preview.

---

# 46. Accessibility Requirements

Minimum:

- semantic headings;
- keyboard navigation;
- focus states;
- accessible labels;
- image alt text;
- sufficient contrast;
- status changes understandable beyond color alone;
- forms have explicit validation messages;
- `Copied`, `Link copied`, errors, loading, and payment status changes use accessible live status where appropriate;
- validation errors are programmatically associated with their fields;
- after failed submit, focus moves to an error summary or the first invalid field;
- menu, filter sheet, and dialog can be closed by keyboard and return focus to their trigger;
- payment and access states are not communicated by color or icon alone.

---

# 47. SEO Requirements by Screen

## Indexable

```text
/
/explore
/category/[slug]
/prompts/[slug]
/packs
/packs/[slug]
/about
/terms
/privacy
```

## Noindex

```text
/checkout/[pack]
/payment/*
/access
/access/[token]
/admin/*
```

Public premium Prompt Detail must not expose premium content through metadata or page source.

---

# 48. Analytics Requirements by Screen

## Home

Recommended:

```text
home_viewed
featured_prompt_clicked
featured_pack_clicked
```

## Explore

```text
explore_viewed
search_performed
filter_applied
prompt_clicked
```

## Prompt Detail

```text
prompt_viewed
prompt_copied
prompt_shared
pack_cta_clicked
```

## Pack Detail

```text
pack_viewed
checkout_started
```

## Payment

```text
purchase_completed
purchase_failed
```

`purchase_completed` is recorded only after the server reads a verified paid state and must be deduplicated by purchase/event identifier. `purchase_failed` must reflect a valid failed payment state, not merely a visit to the failed route.

## Privacy

Never send:

- buyer email;
- access token;
- payment reference;
- opaque purchase reference;
- raw premium prompt content;
- user-entered variable values.

---

# 49. Out of Scope Screen Requirements

Do not design MVP screens for:

```text
User Login
User Register
User Profile
Favorites
Saved Prompts
User Settings
Subscription Pricing
Subscription Billing
Creator Profiles
Creator Dashboard
Community
Ratings
Comments
AI Generator
```

These features are not part of MVP.

---

# 50. Screen Priority

## P0 — Required for MVP

Public:

- Home
- Explore
- Category
- Free Prompt Detail
- Premium Locked Prompt Detail
- Premium Unlocked Prompt Detail
- Packs Index
- Pack Detail
- Checkout
- Payment Success
- Payment Pending
- Payment Failed
- Payment Cancelled
- Access Validation
- Access Home
- 404
- Generic Error

Admin:

- Login
- Dashboard
- Prompts List
- Create Prompt
- Edit Prompt
- Packs List
- Create Pack
- Edit Pack
- Categories
- Purchases

## P1 — Can Follow Core MVP

- Related Prompts section
- explicit free updates for existing buyers
- richer search suggestions
- advanced admin filtering
- purchase detail dedicated screen
- richer pack FAQ
- content recommendation modules

---

# 51. Recommended Wireframe Order

Untuk mengurangi rework, wireframe sebaiknya dibuat dalam urutan berikut:

```text
1. Prompt Detail — Free
2. Prompt Detail — Premium Locked
3. Explore
4. Home
5. Pack Detail
6. Checkout
7. Payment States
8. Access Home
9. Packs Index
10. Category
11. Admin Prompt Form
12. Admin Pack Form
13. Admin Lists
14. Error / Empty States
```

Reason:

Prompt Detail dan Explore adalah inti pengalaman RenderBank.

Pack Detail + Checkout adalah inti monetisasi.

Admin baru mengikuti setelah content model public cukup jelas.

---

# 52. Decisions Locked for Design

Design work harus mempertahankan keputusan berikut:

1. RenderBank adalah visual-first.
2. Free prompt dapat dicopy tanpa login.
3. Tidak ada public user account pada MVP.
4. Tidak ada subscription pada MVP.
5. Premium dijual sebagai one-time prompt pack.
6. Premium Prompt Detail tetap menggunakan route yang sama seperti free prompt.
7. Locked premium content tidak boleh bocor.
8. Purchase tidak memerlukan account creation.
9. Access token hanya digunakan untuk validation entry.
10. `/access` bertindak sebagai accountless buyer library; session sementara, entitlement permanen.
11. Satu access token dan session hanya membuka satu purchase.
12. Session cookie menggunakan `HttpOnly`, `Secure`, dan `SameSite=Lax` serta memiliki expiration.
13. Access token long-lived dan tidak dirotasi pada validasi normal.
14. Existing buyer entitlement tetap berlaku walaupun pack berubah.
15. `/packs` tetap ada walaupun inventory sedikit.
16. Search/filter state berada di `/explore`.
17. Checkout price dan currency ditentukan server-side.
18. Payment status screens menggunakan opaque purchase reference.
19. Copy Prompt menyalin composed prompt dan hanya mencatat analytics setelah clipboard berhasil.
20. Shared links selalu menggunakan canonical public URL tanpa credential atau purchase reference.
21. Related Prompts adalah P1.
22. Explicit free updates untuk existing buyers adalah P1.
23. Transactional/private pages tidak didesain sebagai SEO landing pages.

---

# 53. Review Questions

Sebelum wireframe dimulai, review harus memastikan:

1. Apakah Home terlalu kompleks atau sudah cukup ringan?
2. Apakah Explore cukup kuat sebagai main discovery surface?
3. Apakah Prompt Detail memberikan value yang jelas tanpa terlalu banyak metadata?
4. Apakah locked premium state cukup menarik tanpa membocorkan content?
5. Apakah Pack Detail menjelaskan value one-time purchase dengan jelas?
6. Apakah Checkout terlalu panjang?
7. Apakah `/access` terasa sederhana walaupun tanpa user account?
8. Apakah admin form cukup efisien untuk publish banyak prompt?
9. Apakah mobile flow tetap singkat?
10. Apakah ada screen yang tidak benar-benar diperlukan untuk MVP?

---

# 54. Next Step

Setelah `docs/experience/SCREEN_REQUIREMENTS.md` disetujui:

```text
Low-Fidelity Wireframes
↓
Visual Direction
↓
Design System
↓
High-Fidelity UI
↓
Technical Architecture
```

Screen Requirements ini menjadi baseline untuk wireframe dan tidak menetapkan final visual styling.
