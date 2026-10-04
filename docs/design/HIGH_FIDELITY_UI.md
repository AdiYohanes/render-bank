# RenderBank High-Fidelity UI Specification

**Document:** High-Fidelity UI Specification  
**Product:** RenderBank  
**Version:** 1.1  
**Status:** Revised Draft for Review  
**Last Updated:** 2026-09-29  
**Depends On:** `docs/product/PRD.md v1.0`, `docs/product/SITEMAP.md v1.2`, `docs/experience/USER_FLOWS.md v1.1`, `docs/experience/SCREEN_REQUIREMENTS.md v1.1`, `docs/design/DESIGN.md v1.1`

---

# 1. Purpose

Dokumen ini adalah candidate canonical visual handoff untuk MVP RenderBank: composition, responsive behavior, component state, accessibility, privacy, dan route-level states. Ini bukan source code dan tidak menambah product scope. Status canonical berlaku setelah explicit approval.

Tujuan:

- menerjemahkan approved requirements menjadi Figma/implementation-ready UI;
- menjaga public experience editorial dan admin experience operational;
- memastikan flow `discover → customize → copy` dan `buy → verified payment → secure access` tidak ambigu;
- mencegah visual state membocorkan premium data atau credential.

---

# 2. Visual Foundation and Tokens

RenderBank memakai **clean editorial minimalism with an acid-lime digital accent**: warm neutral canvas, dark confident type, image-first composition, subtle borders, low shadow, generous whitespace.

## Palette and surface system

| Token | Value / treatment | MVP usage |
|---|---|---|
| `primary` | `#D2FD17` | Primary CTA, selected control, restrained accent |
| `neutral-900` | `#0F172A` | Strong foreground |
| `neutral-700` | `#334155` | Secondary strong text |
| `neutral-500` | `#64748B` | Supporting text and metadata |
| `neutral-300` | `#CBD5E1` | Border and disabled outline |
| `neutral-100` | `#F0F4F6` | Secondary surface / disabled fill |
| `neutral-50` | `#FAFAF9` | Page canvas |
| `surface-primary` | white | Card, dialog, input surface |
| `success`, `warning`, `danger`, `info` | `#22C55E`, `#F59E0B`, `#EF4444`, `#3B82F6` | Semantic state only |
| `brand-alt` | `#A855F7` | Reserved/non-MVP; do not use decoratively |

Each semantic family needs surface, foreground, and border token. Primary lime is never the only signal for status or focus. Public UI uses whitespace before borders; admin may use more panels for scanability.

Required interaction tokens:

```text
--color-primary / hover / active / disabled / on-primary
--color-focus-ring
--color-control-surface / hover / active / disabled
--color-disabled-foreground
--color-input-border / input-border-focus
--color-success|warning|danger|info-surface / foreground / border
```

## Typography, radius, and spacing

Typeface is `Inter` with system fallback and `font-display: swap`. Load only used weights/ranges. Display values are desktop maxima and must scale down without orphaning words.

| Style | Size / line height | Weight |
|---|---:|---|
| Display 2XL | 72 / 90 | Bold |
| Display XL | 60 / 72 | Bold |
| Heading 1 | 36 / 48 | Semibold |
| Heading 2 | 30 / 40 | Semibold |
| Heading 3 | 24 / 32 | Semibold |
| Title | 18 / 28 | Medium |
| Body Large | 16 / 24 | Regular |
| Body | 14 / 20 | Regular |
| Caption | 12 / 16 | Regular |

Use 4px base grid. Approved spacing: `8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96`. Radius: `sm 8px`, `md 12px`, `lg 16px`, `xl 20px`, `pill 999px`. Public primary/secondary CTA uses pill; admin/form controls use `md`.

---

# 3. Responsive, Image, and Motion Contract

## Breakpoint baseline

| Viewport | Gutter / container | Grid and navigation transformation |
|---|---|---|
| `<640px` | 16px gutter | One-column reading; prompt grid 2 columns only when metadata remains legible; mobile header/menu; forms stack; admin tables become cards/scrollable only with labels |
| `640px+` | 20–24px gutter | Two-column supporting layouts; compact controls may align inline |
| `768px+` | 24–32px gutter | Tablet grid 3 columns where viable; filter sheet remains allowed; detail can use balanced columns |
| `1024px+` | 32px gutter | Desktop header; inline filters; 4-column prompt grid; admin sidebar; two-column prompt detail |
| `1280px+` | 40px gutter, 1280px content baseline | Editorial whitespace; text max 720–860px; visual grid up to 1440px |
| `1536px+` | 48px outer gutter, max 1440px content | Do not stretch body copy; retain 4-column grid unless card width needs a fifth column |

Mobile is not a scaled desktop: header, menu, filters, CTA placement, form groups, and table data must transform at the baseline above. DOM and keyboard order remain row-major and match visual reading order.

## Image contract

- Store/render intrinsic dimensions and explicit `width`/`height` or CSS `aspect-ratio` before image load; supported source ratios include portrait `4:5`, landscape `16:9`, square `1:1`, and original editorial ratios.
- Use responsive sources (`srcset`/`sizes` equivalent) and modern optimized formats with a safe fallback. Hero/LCP artwork loads eager with high priority; below-fold gallery/card images lazy-load.
- Show ratio-matched neutral placeholder/skeleton; load failure shows same reserved frame, concise fallback text, and no broken-image icon as the only cue.
- Crop is non-destructive: preserve original asset; default `object-fit: cover` only when focal point remains approved. Use `contain` or authored crop for artwork where cover would cut key creative content.
- Every meaningful image has contextual alt text; decorative treatment uses empty alt. Do not put raw prompt, buyer data, token, payment reference, or hidden premium detail in alt text.

## Motion

Allowed motion is 150–250ms: card hover, button press, dropdown/sheet/dialog, toast, subtle image fade. Respect `prefers-reduced-motion: reduce` by removing non-essential movement and shimmer. No parallax, decorative auto-animation, or slow page transition. Dark mode is out of scope for MVP; semantic tokens preserve a future upgrade path without requiring dark-theme frames now.

---

# 4. Shared Interaction, Overlay, and Accessibility Rules

## Component states

All interactive components define `default`, `hover` (pointer-capable only), `focus-visible`, `pressed/active`, `disabled`, and `loading` where action is asynchronous. Loading labels remain readable and prevent duplicate submit. Success/error state is communicated with icon + text, not color alone.

| Component | Required state behavior |
|---|---|
| Button | 44×44px minimum interactive area where practical; loading blocks repeat action; focus ring remains visible |
| Input/select | Visible label, helper text, error associated programmatically; error is specific; first invalid field receives focus on submit |
| Card/link | Entire declared card target is keyboard reachable; hover never reveals required information or action |
| Toast/live status | `role=status` for non-blocking copy/save result; inline error remains visible for corrective action |
| Dropdown/menu | Arrow keys move items, Enter/Space activates, Escape closes and returns focus to trigger |
| Dialog/sheet | Focus moves inside on open, is trapped while open, Escape closes unless destructive confirmation requires explicit choice, then focus returns to opener |

Global WCAG 2.1 AA contract: semantic headings/landmarks, keyboard operation, visible focus, labels/error association, non-color cues, 44×44 targets, meaningful alt text, live regions, focus return, and reduced-motion support. Never rely on placeholder as label.

## Public navigation and overlays

Desktop Categories dropdown opens with click, Enter, Space, or Arrow Down; supports Arrow navigation and Escape; each item links directly to `/category/[slug]`. It must not contain a `/categories` destination.

Mobile menu opens as an accessible sheet. Initial focus goes to its close control, menu contains Explore, expandable Categories, and Packs; Search stays visible in header and Enter submits to `/explore?q=`. Closing menu/filter sheet/dialog restores focus to originating control. Backdrop click closes non-destructive overlays.

---

# 5. Shared Public Shell

Desktop header is 64–72px: `[RenderBank] Explore Categories▼ Packs [Search]`. Use light surface, subtle bottom border, no public login/register/avatar, and optional sticky behavior only when it does not compete with artwork.

Mobile header is `[RenderBank] [Search] [Menu]`. Footer is quiet: brand description plus `/explore`, `/packs`, `/about`, `/terms`, `/privacy`; stack on mobile.

Content tone is concise, confident, practical, English-first. Public UI is image-led editorial; admin is structured and utilitarian using the same foundations.

---

# 6. Home

**Route:** `/`

## Desktop and mobile composition

Hero uses either a left-copy/right-artwork collage or centered editorial copy plus image strip. Headline: **Don't prompt from scratch.** Supporting line: **Discover tested prompts for better AI visuals.** Primary CTA is `Explore Prompts` → `/explore`; secondary `Browse Free Prompts` → `/explore?access=free`.

Home order on mobile:

```text
Hero → Featured Prompts → Browse by Category → Latest Drops → Featured Packs
```

Hero CTA appears above fold; image may follow copy. Featured Prompts uses image-first cards (4 desktop, 3 tablet, 2 mobile). Browse by Category links directly to `/category/[slug]`, never a category index.

`Latest Drops` renders only when enough published prompts exist. `Featured Packs` renders only when a paid pack exists. Omit empty sections rather than leaving placeholder grid or orphan heading. One featured pack uses a campaign card with cover, title, prompt count, one-time purchase, server-rendered display price, and `View Pack`.

SEO: indexable, canonical `/`.

---

# 7. Explore and Category Discovery

## Explore

**Route:** `/explore`

Top area contains heading, supporting copy, prominent search, Category/Model/Orientation/Access controls, active-filter chips, and `Clear Filters`. URL is source of visible discovery state:

```text
/explore?q=luxury+skincare
/explore?q=coffee&category=product&model=gpt-image&orientation=portrait&access=free
```

Search submits by Enter or search control; clear removes only `q`. Each filter changes its respective query parameter; `Clear Filters` returns `/explore`. Preserve shared URL state on reload. Search/filter events never include raw premium prompt, variable values, buyer email, token, or purchase reference.

Use a conventional responsive grid by default: row-major DOM/focus order and stable reserved image space. Masonry is permitted only if visual order, DOM order, keyboard order, and screen-reader order remain identical; do not use CSS columns that reorder reading order.

Loading uses ratio-aware image/text skeletons while controls remain usable where safe; do not flash empty state. Distinguish:

- search empty: `No prompts found.` with `Clear Search` and `Explore All`;
- filter empty: `No prompts match these filters.` with `Clear Filters`;
- both may show curated public fallback without implying matched results.

Mobile keeps search first. `Filters {count}` opens a bottom sheet with draft controls, `Apply` updates URL/results, and `Reset` clears only filter controls. Sheet is keyboard/focus managed under shared rules.

SEO: `/explore` indexable; all query states canonical `/explore`.

## Category

**Route:** `/category/[slug]`

Category is a dedicated editorial/SEO landing: title, concise description, prompt grid, optional supporting copy, `Open Prompt`, and `Explore all prompts` → `/explore`. Desktop uses full editorial grid; mobile keeps simple heading then row-major card grid.

Low inventory uses a curated layout rather than a giant sparse grid. A category with no publishable content is not published. SEO: indexable, self-canonical.

---

# 8. Prompt Cards and Prompt Detail

## Prompt card

Card hierarchy: image, title, `Category · Model`, then one access label (`Free`, `Premium`, or `Unlocked`). `New` may appear when meaningful. Use transparent/page canvas where possible, no heavy permanent chrome. Desktop hover may scale image `1.01–1.02`; no hover-only content.

## Free and unlocked prompt detail

**Route:** `/prompts/[slug]`

Desktop: 55–60% large artwork and 40–45% header/action panel, followed by readable prompt content, Variable Editor when variables exist, recommended settings, and practical How To Use. Mobile order is:

```text
Visual → title + safe metadata → primary Copy Prompt → composed preview/prompt → Variable Editor → settings → How To Use → Copy Link
```

CTA stays in normal content flow or a bottom-safe sticky region with sufficient clearance above browser controls; it must not hide prompt text. Loading holds layout but does not render unresolved protected content.

Header metadata may include category, model, aspect ratio, orientation, use case, and access state. Use chips sparingly. Recommended Settings only renders applicable model, aspect ratio, reference-image requirement, and generation notes.

### Variable Editor and composed output

Variables are P0 editable controls, not a definition-only list. For each variable render:

- visible label and variable key;
- concise description and example/placeholder;
- default value when supplied;
- required indicator; editable input; inline validation linked to the input.

Flow:

```text
Use default or enter value → validate required values → composed prompt preview → Copy Prompt
```

`Reset to Defaults` restores all defaults and clears their related validation state. The Composed Prompt Preview is visually distinct from raw template. `Copy Prompt` copies composed output, not unresolved template. Empty required values show inline error and focus first invalid field; unresolved placeholders block copy or show explicit warning with manual correction path. Prompts without variables copy directly.

### Copy and share behavior

On clipboard success, show `Copied` for 1.5–2 seconds plus accessible live feedback, then record `prompt_copied`. On clipboard failure, show inline `Couldn’t copy automatically. Select the text and copy it manually.` and expose selectable composed text; do not record success. Analytics is emitted only after successful clipboard write and excludes raw prompt and variable values.

Secondary `Copy Link` copies only canonical `/prompts/[slug]`, never access token, session identifier, query credential, buyer data, or purchase reference. Its success/failure follows the same live-feedback/manual selection pattern and records `prompt_shared` only after clipboard success.

### Premium locked and unlocked states

Premium Locked shows visual preview and safe metadata only, then a calm lock panel:

```text
Premium Prompt
Included in [admin-selected Primary Sales Pack]
[View Pack]
```

CTA points to exactly the selected `/packs/[slug]`. Do not expose full prompt, protected variables, premium instructions, or premium body in HTML/client payload/metadata. If multiple pack memberships exist, show only Primary Sales Pack for MVP.

Premium Unlocked uses the same detail and Variable Editor behavior as Free, with a subtle `Unlocked` indicator. Server-side entitlement must resolve before rendering protected body; missing/invalid session renders locked state without content flash. Related Prompts is P1 only; if added later, use same category/shared tags without recommendation engine.

SEO: public detail is indexable and self-canonical; premium indexable metadata remains safe.

---

# 9. Packs

## Packs index

**Route:** `/packs`

Hero: `Curated Prompt Packs` with concise premium-collection explanation. Published Pack Cards include cover, title, description, prompt count, price, and `View Pack`; use 2–3 desktop columns. With one pack, use a feature editorial layout rather than a lonely grid. With no packs, show curated coming-soon state and `Explore Free Prompts` → `/explore?access=free`.

SEO: indexable, canonical `/packs`.

## Pack detail

**Route:** `/packs/[slug]`

Campaign-like composition: cover, title, one-line value, number of prompts, supported models, one-time purchase, price, `Buy Pack`; visual examples; safe included-prompt previews; access explanation; repeated CTA near bottom. Mobile order: artwork, title, description, price, Buy CTA, What You Get, examples, included previews, repeat CTA.

Use `Lifetime access to purchased pack entitlement`, not subscription language. Permanent entitlement is separate from temporary secure browser session.

Archived/unavailable state removes Buy CTA and says the pack is no longer available, with `Explore Packs` and `Explore Prompts`. Existing buyer access remains available through entitled `/access` scope, including archived pack and legacy/unlisted prompts. An unlisted pack is absent from discovery but may be reachable by permitted direct URL; it is not represented as public active inventory.

Published pack SEO is indexable/self-canonical. Archived sales page must not continue selling.

---

# 10. Checkout

**Route:** `/checkout/[pack]`

Centered 520–640px desktop card; full-width concise mobile layout. Show cover, pack title, one-time purchase label, authoritative price/currency, Email input, helper `Access link will be sent to this email.`, and `Continue to Payment`. No account, password, profile, shipping, or required newsletter.

Checkout loads pack from route identifier server-side. Server verifies published/purchasable status and determines price/currency; client values are ignored. States:

| State | UI and recovery |
|---|---|
| Empty email | Inline `Enter your email address.` |
| Invalid email | Inline `Enter a valid email address.` |
| Archived/not purchasable | Do not initialize payment; show unavailable state with pack/explore recovery |
| Price changed | Show authoritative new price and currency; require explicit reconfirmation before payment |
| Email in use by in-progress checkout | Inline non-technical refusal; buyer restarts from the Pack page |
| Initializing | CTA disabled, readable loading label; duplicate clicks cannot create accidental attempts |
| Initialization error | Inline non-technical error, retain email and order summary, allow retry |

Reuse active payment attempt only when provider rules make it safe. SEO: noindex.

---

# 11. Payment Verification States

Payment routes are exactly:

```text
/payment/success
/payment/pending
/payment/failed
/payment/cancelled
```

An opaque purchase reference may be used server-side, for example `/payment/success?ref=[opaque-purchase-reference]`. It is not an access token, buyer email, payment credential, or guessable ID; it is not displayed, included in analytics, or copied into UI. Browser redirect is never payment proof. UI reads verified server purchase state only; duplicate webhook/event processing must not create duplicate entitlement.

User-facing vocabulary maps internal `PENDING` to **Processing**. No separate user-facing internal-state label exists. All payment pages are noindex.

| Verified server result | Screen UI | Recovery / transition |
|---|---|---|
| Paid | `/payment/success`: success indicator, purchased pack, masked email, `Open My Pack`, `Explore More Prompts` | Reload is idempotent. `Open My Pack` starts secure access flow; no duplicate purchase/entitlement |
| Processing | `/payment/pending`: `Payment is still processing`, no premium access, `Check Again`, `Return to Pack` | Recheck remains Processing or redirects to success, failed, or cancelled based on server state |
| Failed | `/payment/failed`: `Payment didn’t complete`, `Try Again`, `Return to Pack` | No access; retry returns to `/checkout/[pack]` |
| Cancelled | `/payment/cancelled`: neutral cancellation copy, `Try Again`, `Return to Pack`, `Explore Prompts` | No access |
| Unknown/not yet resolvable | Render `We couldn't verify your payment status.` inside the matched payment route; do not create a new route or describe it as Failed | `Check Again` and `Return to Pack`; do not grant access or claim an outcome |

Before a verified result resolves, show accessible live status `Checking your payment...`. If payment is verified Paid but access-email delivery fails, retain Success and `Open My Pack`; show calm notice that email delivery needs attention and Support/admin may resend. Never transform valid purchase into failure.

---

# 12. Secure Access and Entitlement

## Token validation

**Route:** `/access/[token]`

This is entry-only, minimal brand screen: `Validating your access...`; no public navigation, no token display, no copy/share action. Valid flow:

```text
Validate long-lived token → create server-managed secure session → rotate session identifier → redirect /access
```

Token leaves URL immediately after validation. Session cookie requires `HttpOnly`, `Secure`, `SameSite=Lax`, and expiration. Token is not rotated during normal validation, and token/content never enters analytics, client logs, URL destinations, or third-party scripts.

Invalid/unavailable copy avoids security details: `This access link is invalid or no longer available.` Actions: `Check purchase email`, `Contact Support`, `Return Home`, `Explore Prompts`.

## Accountless Buyer Library

**Route:** `/access`

Name the visual experience **Accountless Buyer Library**. It is a lightweight private purchase view, not SaaS dashboard or aggregated account library. One secure session opens one purchase scope only; purchases sharing an email are never merged automatically.

Show current purchased pack, cover/title, prompt count/list, and `Unlocked` item state. Prompt opens canonical `/prompts/[slug]`, where server validates entitlement again. Browser session is temporary; purchase-time entitlement is permanent.

No valid session must not look like empty library:

```text
Your access session has ended.
Your purchase is still available through the secure link sent to your email.
```

Actions: `Contact Support`, `Home`, `Explore Prompts`. Buyer-retention presentation keeps entitled legacy/unlisted prompts and archived packs accessible within entitlement snapshot while public discovery/sales may remove them.

SEO: `/access` and `/access/[token]` are noindex.

## Purchase snapshot rule

At purchase, buyer receives snapshot of prompts in that pack. Future pack additions/removals/reordering affect new purchases only. Removing/unpublishing content does not silently remove existing entitled access. Explicit free entitlement updates are P1, not launch baseline. Hard delete of purchased content is avoided in favor of Unpublished, Unlisted, or Archived.

---

# 13. Informational and Error Screens

Routes: `/about`, `/terms`, `/privacy`, and 404/not-found state.

- `/about`: concise editorial text, 760–840px max content, what RenderBank is, visual-first rationale, testing/curation, audience.
- `/terms` and `/privacy`: readable 760px legal layout with strong headings and no ornamental clutter.
- 404: `Page not found`, `Explore Prompts` and `Home` recovery actions.
- Generic server error: non-technical `Something went wrong. Please try again.`, `Retry`, `Home`, and `Explore Prompts`; never show stack trace, system IDs, credential, buyer data, or prompt content.

SEO: About/Terms/Privacy indexable with canonical `/about`, `/terms`, `/privacy`; 404 follows platform not-found behavior.

---

# 14. Admin Shell and Login

Admin routes:

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

Desktop Admin Shell has 220–240px sidebar: Dashboard, Prompts, Packs, Categories, Purchases, plus `Logout`. Canvas is neutral-50 with white content panels. At narrow widths use a focus-managed drawer and stacked form/table patterns.

`/admin/login` is a minimal, noindex form with loading state, safe invalid-credential error that does not reveal account existence, expired-session message, and success redirect to validated intended internal admin path or `/admin/dashboard`. Admin authentication/session is separate from buyer session.

`/admin/dashboard` uses only concise operational stat cards: Total Prompts, Published, Active Packs, Purchases, Revenue, with `New Prompt` and `New Pack`. No charts, cohort tooling, CRM, or advanced analytics in MVP.

---

# 15. Admin Prompt Operations

## Prompt list

**Route:** `/admin/prompts`

Table columns: Title, Status, Access, Category, Model, Updated, Actions. Provide New Prompt, Edit, Publish/Unpublish where safe, Archive; basic Status/Free-Premium/Category filtering and inventory-driven search are acceptable. On mobile, preserve each label/value association in stacked card form.

## Create and edit form

**Routes:** `/admin/prompts/new`, `/admin/prompts/[id]/edit`

Desktop 70/30 layout. Main: Title, Slug, Short Description, Description, Prompt Template, repeatable Variable configuration, Tags, Generation Notes, Preview Images. Each variable row supports key, label, description, example/placeholder, default, required state, add/remove, and explicit ordering. Sidebar: Status, Access Type, Category, Recommended Model(s), Aspect Ratio, Orientation, Use Case(s), Requires Reference Image, Primary Sales Pack, Publish controls.

Required actions: `Save Draft`, `Preview`, `Publish`. Publish appears only when minimum required data is valid. Image upload supports choose/drop, thumbnail, reorder, remove, primary indicator; reference-image requirement is explicit, not inferred.

Prompt Template editor is 320–420px visible height and distinguishes variable tokens. Primary Sales Pack is required/resolved when applicable to a pack-only prompt and membership exists; link to related Pack configuration. Admin Preview renders user-facing composed/locked outcome safely.

For published slug changes, show 301 redirect warning. For a prompt with buyer entitlement, unpublish warning states public discovery is removed but entitled buyer access remains. Do not hard-delete purchased content.

---

# 16. Admin Pack and Category Operations

## Pack list and form

**Routes:** `/admin/packs`, `/admin/packs/new`, `/admin/packs/[id]/edit`

List: Title, Status, Price, Prompts, Purchases, Updated, Actions; `New Pack` CTA. Form fields: Title, Slug, Description, Cover, Price, Currency, Prompt Selection, Prompt Order, Status. Actions: `Save Draft`, `Preview`, `Publish`.

Prompt Selection offers searchable finding, add/remove, and explicit order controls; drag-and-drop is not required. Preview shows public pack presentation before publish.

If purchases exist, show warning:

```text
Existing buyers retain their purchase-time prompt entitlement.
```

Adding/removing/reordering changes current pack for new buyers only; it never silently changes old snapshots. Explicit free updates are P1. Archive prevents new sales but preserves buyer access.

## Categories

**Route:** `/admin/categories`

List Name, Slug, Prompt Count, Status, Actions. Provide `Create`, Edit, Archive. Avoid hard delete when content exists; archive/reassign safely instead.

---

# 17. Admin Purchase Operations

**Route:** `/admin/purchases`

List Buyer, Pack, Amount/Currency, Payment State, Date, Access State, Actions. Purchase Detail can be drawer/modal and must show payment reference, entitlement snapshot summary, access status, and email delivery status. It is internal-only; do not expose this data in public UI/analytics.

Operations are distinct and require clear confirmation:

| Action | Effect | Required guard |
|---|---|---|
| Resend Access Email | Send current/replacement secure link | Show delivery result without exposing token |
| Rotate Access Token | Old token invalid; issue replacement; entitlement remains active | Confirm replacement and offer secure email send |
| Revoke Compromised Token | Invalidate compromised token; entitlement remains active; replacement may be issued later | Confirm token-only effect |
| Suspend Entitlement | Separate destructive entitlement action for refund, chargeback, fraud, or legal/policy reason | Confirmation plus mandatory administrative reason |

Do not combine token operation with entitlement suspension. Use status vocabulary precisely: Draft, Published, Unpublished, Archived, Unlisted; Free, Premium, Unlocked, Unavailable; Paid, Processing, Failed, Cancelled.

---

# 18. Shared Search, Filter, Badge, Toast, and Modal Specs

Search is 44–48px high, 12px radius, clear placeholder `Search prompts...`, submit/clear/loading/empty capable. Filter desktop controls are compact dropdowns; active state uses restrained lime tint/border plus text. Mobile is `Filters {count}` sheet with Apply/Reset.

Badge families are compact and semantic:

```text
Content: Draft, Published, Unpublished, Archived, Unlisted
Access: Free, Premium, Unlocked, Unavailable
Payment: Paid, Processing, Failed, Cancelled
```

Toasts appear top-right desktop and top/bottom mobile for 3–5 seconds. Critical errors remain inline. Modal is 420–560px, used for archive confirmation, Rotate Access Token, Revoke Compromised Token, Suspend Entitlement, and other destructive admin actions; never main purchase flow.

---

# 19. Route, SEO, Privacy, and State Matrix

## Route and indexing matrix

| Route | Primary state | SEO |
|---|---|---|
| `/` | Home | Index, canonical `/` |
| `/explore` | Search/filter discovery | Index, canonical `/explore` |
| `/category/[slug]` | Category landing | Index, self-canonical |
| `/prompts/[slug]` | Free, locked, or entitled unlocked detail | Index safe public metadata, self-canonical |
| `/packs` | Published packs / coming soon | Index, canonical `/packs` |
| `/packs/[slug]` | Published, unlisted permitted direct view, archived unavailable | Published self-canonical; no active sales CTA when archived |
| `/checkout/[pack]` | Checkout validation/payment init | noindex |
| `/payment/success` | Verified Paid / email delivery variant | noindex |
| `/payment/pending` | Processing / unknown verification variant | noindex |
| `/payment/failed` | Failed | noindex |
| `/payment/cancelled` | Cancelled | noindex |
| `/access/[token]` | Validation or invalid access | noindex |
| `/access` | One-purchase Accountless Buyer Library/session ended | noindex |
| `/about`, `/terms`, `/privacy` | Informational/legal | Index, self route canonical |
| 404 | Missing route/content | Platform not-found |
| `/admin/*` routes listed in Section 14 | Login/operational admin | noindex |

No public `/library`, `/categories`, login, registration, user profile, or payment-unknown route exists in MVP.

## Privacy boundary

Premium content, access token, buyer email, opaque payment/purchase reference, session identifier, and variable values must not appear in unauthorized UI, HTML/page source, public metadata, structured data, share URL, client payload/bundle, analytics, third-party logging, image alt text, or error copy. Access surfaces use `Referrer-Policy: no-referrer` and minimal third-party scripts. Public share always uses canonical prompt URL. Analytics records only approved event outcome after success where relevant and never raw sensitive values.

## Screen-state matrix

| Surface | Loading | Empty/unavailable | Error/recovery | Authorization |
|---|---|---|---|---|
| Home | Reserve artwork/card space | Omit conditional sections | Generic recovery | Public |
| Explore/Category | Ratio-aware skeleton | Search/filter empty or unpublished category prevention | Clear/reset/explore | Public |
| Prompt Detail | No content flash | Locked/unavailable public state | Copy manual-selection fallback | Server entitlement for premium |
| Packs | Skeleton | Coming soon / archived | Explore recovery | Buyer legacy access preserved |
| Checkout | Disabled submit | Archived/not purchasable | Inline validation/init retry | Public |
| Payment | Verifying variant | N/A | Recheck/pack recovery | Verified server purchase state |
| Access | Validation/session check | Session ended | Email/Support/Home/Explore | One purchase only |
| Admin | Row/form loading | Contextual empty | Safe inline errors | Admin session only |

---

# 20. Completion Checklist

A screen is high-fidelity ready only when all applicable items are defined:

```text
□ Desktop and mobile composition at required breakpoints
□ Keyboard operation, focus-visible, Escape/focus return for overlays
□ Typography, spacing, target size, labels, error/live feedback
□ Image ratio, responsive source, loading, fallback, alt, crop behavior
□ Primary and secondary CTA including loading/duplicate-submit state
□ Empty, error, unavailable, and authorization state
□ Copy/share success and manual fallback where relevant
□ Server-authoritative payment/access behavior where relevant
□ One-purchase session scope and permanent entitlement distinction
□ SEO canonical/noindex behavior
□ Privacy boundary for premium content, token, email, reference, variables
□ Reduced-motion behavior
□ docs/design/DESIGN.md component/token alignment and no out-of-scope feature
```

---

# 21. P0 Screen Priority and Figma Frame Order

P0 priority is core-first: Prompt Detail, Explore, Home, Category, Pack/Checkout/Payment, Access, then Admin. Related Prompts and explicit entitlement updates remain P1.

```text
01 Prompt Detail Free — Desktop
02 Prompt Detail Free — Mobile
03 Prompt Detail Premium Locked — Desktop
04 Prompt Detail Premium Locked — Mobile
05 Prompt Detail Premium Unlocked
06 Prompt Detail Copy Failure / Manual Selection
07 Explore — Desktop
08 Explore — Mobile Filter Sheet
09 Home — Desktop
10 Home — Mobile
11 Category — Desktop/Mobile
12 Packs Index — One Pack / Coming Soon
13 Pack Detail — Desktop
14 Pack Detail — Mobile
15 Pack Detail — Archived/Unavailable
16 Checkout — Desktop
17 Checkout — Mobile / Price Change / Initialization Error
18 Payment Success
19 Payment Success — Email Delivery Failure
20 Payment Processing / Unknown Verification Variant
21 Payment Failed
22 Payment Cancelled
23 Access Validation
24 Access Invalid
25 Accountless Buyer Library
26 Access Session Ended
27 Admin Login
28 Admin Dashboard
29 Admin Prompt List/Form/Preview
30 Admin Pack List/Form/Preview
31 Admin Categories
32 Admin Purchases / Token and Entitlement Actions
33 404 / Generic Error / Shared Empty and Loading States
```

---

# 22. Final Direction

RenderBank should communicate a premium visual prompt library closer to a curated creative publication than traditional SaaS. Artwork leads; interface supports. Public screens remain minimal, fast, accessible, and decisive. Admin screens remain clear and operational without overbuilding.

---

# 23. Next Step

After this document receives explicit approval, continue to `docs/engineering/TECHNICAL_ARCHITECTURE.md` to define server verification, secure session, entitlement snapshot, payment idempotency, media delivery, and implementation contracts.
