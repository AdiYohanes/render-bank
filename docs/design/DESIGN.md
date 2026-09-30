# RenderBank Design

**Document:** Design Direction & UI System  
**Product:** RenderBank  
**Version:** 1.1  
**Status:** Approved for MVP  
**Last Updated:** 2026-09-29  
**Source Reference:** `design-image.png`  
**Depends On:** `docs/product/PRD.md v1.0`, `docs/product/SITEMAP.md v1.2`, `docs/experience/USER_FLOWS.md v1.1`, `docs/experience/SCREEN_REQUIREMENTS.md v1.1`

---

# 1. Purpose

Dokumen ini mendefinisikan arah visual, prinsip UX, design tokens, dan pola komponen utama RenderBank.

Tujuan dokumen ini adalah menjadi jembatan antara:

```text
Product Requirements
↓
Screen Requirements
↓
Design Direction
↓
Wireframe
↓
Design System Implementation
↓
High-Fidelity UI
```

Dokumen ini bukan final pixel specification, tetapi cukup preskriptif untuk menjaga seluruh UI RenderBank tetap konsisten.

---

# 2. Design Positioning

RenderBank harus terasa seperti:

- premium creative library;
- visual inspiration platform;
- modern editorial product;
- curated AI creative resource.

RenderBank **tidak boleh terasa seperti**:

- enterprise SaaS;
- generic admin dashboard;
- traditional e-commerce marketplace;
- database prompt;
- AI chat application.

Core design statement:

> **The artwork leads. The interface supports it.**

Visual hasil AI adalah pusat pengalaman. UI harus tenang, bersih, dan tidak bersaing dengan karya visual.

---

# 3. Brand Personality

RenderBank memiliki personality:

### Curated

Terasa dipilih dengan sengaja, bukan hasil dump content.

### Modern

Clean, contemporary, dan relevan dengan AI creative tooling.

### Confident

Tidak membutuhkan terlalu banyak ornament atau copy.

### Experimental

Primary lime memberi sedikit karakter digital/creative tanpa membuat interface ramai.

### Accessible

High contrast, readable, predictable interaction.

---

# 4. Core Design Principles

## 4.1 Visual First

Images adalah elemen dengan visual weight tertinggi.

UI chrome dibuat minimal.

---

## 4.2 Content Over Decoration

Gunakan dekorasi hanya jika membantu hierarchy atau branding.

Hindari:

- gradient berlebihan;
- glassmorphism berlebihan;
- glow di setiap elemen;
- border dekoratif yang tidak diperlukan.

---

## 4.3 Strong Hierarchy

Setiap screen harus mudah dipindai.

Urutan hierarchy umum:

```text
Visual
↓
Title
↓
Primary Action
↓
Supporting Context
↓
Metadata
```

---

## 4.4 Consistency

Komponen yang sama harus memiliki behavior yang sama di seluruh aplikasi.

---

## 4.5 Efficiency

Core actions harus membutuhkan sedikit langkah.

Contoh:

```text
Prompt Detail → Copy Prompt
```

bukan:

```text
Prompt Detail → Modal → Login → Confirm → Copy
```

---

## 4.6 Accessibility

Color tidak boleh menjadi satu-satunya indikator status.

Text, icon, label, focus state, dan contrast harus membantu interpretasi.

---

# 5. Visual Direction

Base appearance:

- light interface;
- warm/off-white background;
- dark neutral text;
- subtle borders;
- acid lime sebagai primary brand accent;
- semantic colors digunakan hanya ketika memiliki arti;
- artwork menjadi sumber warna utama.

Public RenderBank harus terasa lebih editorial.

Admin RenderBank boleh terasa lebih utilitarian tetapi tetap menggunakan token yang sama.

`design-image.png` digunakan sebagai reference untuk foundations, primitives, dan admin patterns. Komposisi ERP seperti dashboard tiles, dense panels, sidebar, serta data grid tidak disalin ke public RenderBank. Public page composition harus dirancang khusus sebagai image-led editorial experience.

---

# 6. Color System

## 6.1 Core Palette

| Token | Value | Usage |
|---|---|---|
| `primary` | `#D2FD17` | Main brand accent, primary CTA, active controls |
| `neutral-900` | `#0F172A` | Primary text, strong foreground |
| `neutral-700` | `#334155` | Secondary strong text |
| `neutral-500` | `#64748B` | Supporting text, metadata |
| `neutral-300` | `#CBD5E1` | Borders, disabled outlines |
| `neutral-100` | `#F0F4F6` | Soft surfaces, disabled fill |
| `neutral-50` | `#FAFAF9` | App/page background |

## 6.2 Semantic Colors

| Token | Value | Usage |
|---|---|---|
| `success` | `#22C55E` | Success, paid, online, completed |
| `warning` | `#F59E0B` | Warning, pending, attention |
| `danger` | `#EF4444` | Error, failed, destructive |
| `info` | `#3B82F6` | Information, processing |
| `brand-alt` | `#A855F7` | Reserved; activate only when a clear product or brand role exists |

## 6.3 Color Usage Rules

Primary lime harus digunakan dengan disiplin.

Gunakan untuk:

- primary CTA;
- selected tab/filter;
- active navigation item;
- checked control;
- key visual accent;
- important interaction focus.

Jangan gunakan primary lime untuk:

- large page backgrounds;
- long text;
- every card;
- every badge.

Goal:

> Primary harus tetap terasa spesial.

`brand-alt` tidak digunakan pada MVP kecuali wireframe menunjukkan fungsi yang jelas. Jangan menggunakan purple hanya untuk menambah variasi dekoratif.

## 6.4 Interactive Color Tokens

Implementation harus menyediakan semantic interaction tokens:

```text
--color-primary
--color-primary-hover
--color-primary-active
--color-primary-disabled
--color-on-primary
--color-focus-ring

--color-control-surface
--color-control-hover
--color-control-active
--color-control-disabled
--color-disabled-foreground
--color-input-border
--color-input-border-focus
```

Component tidak boleh membuat warna hover, active, focus, atau disabled secara ad hoc.

## 6.5 Semantic Color Pairs

Setiap semantic family membutuhkan pasangan:

```text
--color-success-surface
--color-success-foreground
--color-success-border

--color-warning-surface
--color-warning-foreground
--color-warning-border

--color-danger-surface
--color-danger-foreground
--color-danger-border

--color-info-surface
--color-info-foreground
--color-info-border
```

Badge dan alert sebaiknya menggunakan light semantic surface, dark semantic foreground, serta border/icon bila diperlukan. Jangan mengasumsikan white text memiliki kontras memadai pada semua semantic base color.

---

# 7. Surface System

Recommended surfaces:

```text
Page Background
#FAFAF9

Primary Surface
#FFFFFF

Secondary Surface
Neutral-100 / subtle warm gray

Border
Neutral-300 at restrained opacity
```

Public UI:

- lebih sedikit border;
- lebih banyak whitespace;
- image-led.

Admin UI:

- boleh menggunakan lebih banyak panel dan borders untuk clarity.

---

# 8. Typography

Primary typeface:

> **Inter**

Reason:

- highly readable;
- neutral modern character;
- suitable for editorial + application UI;
- excellent interface legibility.

## Type Scale

| Style | Size / Line Height | Weight |
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

## Public Usage

Large Display typography boleh digunakan pada:

- Home hero;
- Pack campaign hero;
- major editorial section.

Display typography harus responsive, menggunakan fluid sizing atau breakpoint-adjusted sizes. Nilai desktop pada type scale adalah maximum reference, bukan ukuran mobile. Headline harus memiliki controlled line length dan tidak menghasilkan satu kata per baris pada layar kecil.

## Font Loading

Recommended:

- gunakan Inter variable font jika tersedia;
- muat hanya weight/range yang digunakan;
- gunakan system fallback stack;
- gunakan `font-display: swap`;
- wordmark dan navigasi tidak boleh bergantung pada blocking font load.

## Admin Usage

Admin tidak memerlukan Display scale.

Gunakan:

- Heading 2;
- Heading 3;
- Title;
- Body;
- Caption.

---

# 9. Typography Rules

Use:

- sentence case;
- short headings;
- concise labels.

Avoid excessive uppercase.

Uppercase hanya digunakan untuk:

- tiny eyebrow label;
- controlled brand treatment.

Body text maksimum width sebaiknya dijaga agar tetap mudah dibaca.

Inter tetap menjadi satu-satunya MVP typeface. Brand character berasal dari bold display scale, controlled tracking, editorial line breaks, distinctive wordmark, composition, dan whitespace. Typeface tambahan hanya dipertimbangkan jika visual exploration membuktikan kebutuhan yang jelas.

---

# 10. Spacing Philosophy

Gunakan 4px base grid.

Recommended spacing scale:

```text
4
8
12
16
20
24
32
40
48
64
80
96
```

Rules:

- related controls: 8–12px;
- field groups: 16–24px;
- card internal spacing: 16–24px;
- major sections: 64–96px desktop;
- mobile major sections: 40–64px.

Public pages harus memiliki whitespace lebih luas dibanding admin.

---

# 11. Border Radius

Recommended radius family:

```text
sm: 8px
md: 12px
lg: 16px
xl: 20px
pill: 999px
```

Usage:

- public primary CTA: pill;
- public secondary/ghost button: pill;
- admin and form button: radius-md;
- compact table action: radius-sm atau radius-md;
- icon button: circle/pill;
- badges/chips: pill;
- public image cards: 12–16px;
- admin panels: 12–16px;
- modal: 16–20px.

Jangan mencampur terlalu banyak radius dalam satu screen.

---

# 12. Borders & Shadows

Default UI tidak mengandalkan heavy shadow.

Preferred hierarchy:

```text
background separation
→ subtle border
→ very soft shadow only when needed
```

Use shadow for:

- dropdown;
- popover;
- floating menu;
- modal;
- elevated preview.

Cards sebaiknya tidak semua memiliki shadow.

---

# 13. Buttons

Button variants:

- Primary
- Secondary
- Ghost
- Destructive
- Icon

## Primary

Use:

- main action per section;
- `Explore Prompts`;
- `Copy Prompt`;
- `Buy Pack`;
- `Continue to Payment`;
- `Publish`.

Visual:

- primary lime background;
- neutral-900 text.

## Secondary

Neutral surface + restrained border.

Use for:

- supporting action;
- Cancel;
- secondary navigation action.

## Ghost

Minimal chrome.

Use for:

- tertiary action;
- toolbar action;
- simple navigation action.

## Destructive

Use only for:

- revoke;
- delete/archive when destructive;
- dangerous admin operations.

Never use destructive styling merely for Cancel.

---

# 14. Button Sizes

Recommended:

| Size | Usage |
|---|---|
| XS | Dense admin secondary action |
| SM | Toolbar / compact interaction |
| MD | Default |
| LG | Hero / purchase CTA |

Core public CTA should usually use MD or LG.

Mobile CTA and other primary interactive targets must provide at least `44 × 44` CSS pixels of interactive area where practical.

---

# 15. Button States

All buttons require:

- default;
- hover;
- active;
- focus-visible;
- disabled;
- loading when relevant.

Loading state must prevent duplicate submission for:

- checkout;
- admin save;
- publish;
- payment actions.

---

# 16. Button Groups

Use only when options are mutually related.

Examples:

- view mode;
- alignment;
- admin status mode.

Do not use segmented groups as decorative UI.

---

# 17. Status & Badges

Supported badge families:

### Content State

```text
Draft
Published
Unpublished
Archived
Unlisted
```

### Product Access

```text
Free
Premium
Unlocked
Unavailable
```

### Payment

```text
Paid
Processing
Failed
Cancelled
```

Internal `PENDING` maps to the user-facing label `Processing`; do not show both as separate UX states.

### Semantic

```text
Success
Warning
Danger
Info
Neutral
```

Badges should remain compact.

Avoid showing multiple badges when one label is sufficient.

---

# 18. Chips / Tags

Use for:

- category;
- model;
- tags;
- active filters.

Example:

```text
Product
GPT Image
Portrait
Free
```

Filter chips may be removable.

Prompt metadata chips should not dominate visual hierarchy.

---

# 19. Form Elements

Supported:

- text input;
- search input;
- textarea;
- select;
- checkbox;
- radio;
- toggle;
- range slider if later required.

All form fields require:

- label;
- default state;
- focus state;
- disabled state;
- error state;
- helper text where useful.

Error message should be specific.

Bad:

```text
Invalid
```

Better:

```text
Enter a valid email address.
```

---

# 20. Form Focus

Focus state must remain clearly visible against adjacent surfaces.

Primary lime alone may not provide sufficient contrast against white or off-white. Use an accessible derived focus color or layered treatment such as:

```text
dark outer ring
+
lime inner accent
```

Focus must not rely only on color, a subtle one-pixel border change, or lime against a light background.

---

# 21. Search

Search is a first-class RenderBank component.

Public search:

- clear;
- prominent;
- simple;
- optional search icon;
- URL-backed.

Placeholder example:

```text
Search prompts...
```

Search must support:

- submit;
- clear;
- loading;
- empty result.

---

# 22. Filters

Desktop:

- inline filter controls or compact dropdowns.

Mobile:

- drawer / bottom sheet.

Core filters:

- Category
- Model
- Orientation
- Access

Active filters should be obvious.

Provide:

```text
Clear Filters
```

when filters are active.

---

# 23. Tabs

Use sparingly.

Valid uses:

- admin content state;
- pack/content grouping if needed.

Do not use tabs if simple page sections are clearer.

Active tab may use primary lime emphasis.

---

# 24. Dropdown / Select

Use for:

- model;
- category;
- status;
- filter values.

Dropdown:

- selected item clearly highlighted;
- keyboard accessible;
- consistent iconography.

---

# 25. Overflow Menu

Use primarily in admin.

Possible actions:

```text
View
Edit
Duplicate
Archive
Delete
```

Destructive action appears visually separated.

Public prompt cards should generally not require overflow menus.

---

# 26. Navigation

## Public Navigation

Desktop:

```text
RenderBank
Explore
Categories
Packs
Search
```

Style:

- light;
- low chrome;
- no sidebar;
- preferably sticky only if it benefits discovery.

## Categories

Dropdown directly to category routes.

## Mobile

```text
Logo
Search
Menu
```

Menu contains:

- Explore
- Categories
- Packs

---

# 27. Admin Navigation

Admin may use sidebar navigation.

Recommended:

```text
Dashboard
Prompts
Packs
Categories
Purchases
```

Do not reuse public navigation structure in admin.

Admin navigation can be denser.

---

# 28. Prompt Cards

Prompt card adalah core visual primitive RenderBank.

## Required

- generated image;
- title;
- category;
- model;
- access badge.

## Design Rules

Image receives strongest visual weight.

Metadata remains compact.

Avoid:

- heavy card chrome;
- large shadows;
- too many icons;
- long descriptions.

Recommended hierarchy:

```text
Image
Title
Category / Model / Access
```

---

# 29. Prompt Grid

Explore should feel closer to visual discovery than catalog commerce.

Possible layouts:

- masonry;
- responsive editorial grid;
- mixed aspect ratio grid.

Priority:

1. visual quality;
2. scanning;
3. performance;
4. metadata clarity.

Do not force every image into the same crop if it weakens the creative output.

## Masonry Accessibility Rules

- DOM order must match keyboard and screen-reader reading order;
- avoid CSS columns when visual order differs from source order;
- focus order must remain predictable;
- lazy loading must not reorder cards;
- every image reserves layout space using explicit dimensions or `aspect-ratio`.

---

# 30. Prompt Detail

Prompt Detail should feel like:

> editorial case study + usable creative recipe

not a generic product SKU page.

Recommended hierarchy:

```text
Large Visual
↓
Title + Context
↓
Primary Action
↓
Prompt
↓
Variables
↓
Settings
↓
How to Use
```

For desktop, visual and prompt information may use a two-column layout when beneficial.

Mobile should collapse naturally to one column.

---

## 30.1 Variable Customization

Prompt Detail dengan variables membutuhkan:

```text
Variable Field
Variable Group
Required Variable Error
Reset to Defaults
Composed Prompt Preview
Copy Composed Prompt
```

Rules:

- field menggunakan label, description, placeholder/example, default value, dan required state;
- required error tidak bergantung pada warna saja;
- composed prompt preview harus berbeda jelas dari raw template;
- `Copy Prompt` ditempatkan dekat composed output;
- unresolved placeholders tidak boleh tersalin tanpa warning;
- variable values tidak pernah dikirim ke analytics;
- variable editor harus terasa seperti creative tool, bukan admin form.

## 30.2 Copy and Share Actions

Hierarchy:

```text
Primary: Copy Prompt
Secondary/Ghost: Copy Link
```

`Copy Link` menyalin canonical public Prompt Detail URL. Jangan pernah menyertakan access token, purchase reference, atau session data. Success dan failure feedback harus accessible.

---

# 31. Premium Locked State

Locked premium state must feel intentional, not broken.

Use:

- visible artwork;
- safe metadata;
- premium badge;
- concise lock message;
- pack CTA.

Example:

```text
Premium prompt
Included in Product Ads Vol. 01

[View Pack]
```

Do not blur a huge block of fake text merely as decoration.

---

# 32. Pack Cards

Pack cards should feel like curated editorial collections.

Required:

- cover;
- title;
- description;
- prompt count;
- price.

Use stronger art direction than normal prompt cards.

---

# 33. Pack Detail

Pack Detail may be more campaign-like than other screens.

Allowed:

- large hero artwork;
- editorial typography;
- staggered examples;
- visual storytelling.

Still preserve:

- clear price;
- one-time purchase label;
- obvious Buy CTA.

---

# 34. Cards

General information cards may use:

- white surface;
- subtle border;
- 12–16px radius;
- minimal shadow.

Use information cards mostly in admin.

Public experience should avoid dashboard-card overload.

---

# 35. Tables / Data Grid

Tables are primarily for admin.

Use for:

- Prompts list;
- Packs list;
- Purchases.

Table requirements:

- readable headers;
- compact but not cramped;
- status badge;
- action menu;
- responsive fallback.

On small screens, consider:

- horizontal scroll;
- stacked rows;
- priority-column hiding.

Do not use tables on the public prompt discovery experience.

---

# 36. Modal / Dialog

Use for actions requiring focused confirmation.

Examples:

- archive content;
- rotate or revoke an access token;
- suspend entitlement;
- destructive action;
- short confirmation.

## Confirmation Levels

### Low Risk

Example: archive a draft with no buyers. Use a simple confirmation.

### Medium Risk

Examples: unpublish purchased prompt, rotate token, archive sold pack. Use warning styling and explain the consequence.

### High Risk

Example: suspend entitlement. Use destructive styling, require explicit confirmation and an administrative reason.

Operational meaning:

- Rotate Access Token invalidates the old token but keeps entitlement;
- Revoke Compromised Token disables the token but keeps entitlement;
- Suspend Entitlement is a separate destructive action;
- Archive Pack stops future sales but preserves existing buyer access;
- Cancel always uses neutral styling.

Avoid using modal for:

- free prompt viewing;
- main checkout;
- core browsing.

---

# 37. Alerts / Toasts

Toast types:

- Success
- Warning
- Error
- Info

Example:

```text
Prompt copied.
Prompt published successfully.
Access email resent.
Failed to save changes.
```

Toasts should be short and actionable when needed.

Do not use toast as the only place for critical payment information.

---

# 38. Tooltips & Popovers

Use for:

- unfamiliar icon explanation;
- compact admin shortcuts;
- extra contextual metadata.

Avoid tooltip dependency for essential information on mobile.

---

# 39. Image Treatment

Images are the most important visual asset in RenderBank.

Rules:

- preserve creative composition;
- avoid unnecessary overlays;
- optimize delivery;
- use responsive images;
- use meaningful alt text;
- avoid destructive crop where possible;
- provide explicit width/height or `aspect-ratio` to prevent layout shift;
- use responsive `srcset` and `sizes`;
- eager-load only the hero/LCP candidate image;
- lazy-load below-fold images;
- use a placeholder that preserves final layout;
- provide a deliberate fallback when an image fails.

Generated artwork should not be tinted with brand colors.

## Artwork Overlay Rules

- keep titles and long metadata outside images when possible;
- use gradient overlays only when required for legibility;
- image badges require stable contrast across varied artwork;
- hover overlays must not be the only way to discover an action;
- mobile interactions must never depend on hover.

---

# 40. Image Ratios

RenderBank must support at minimum:

```text
1:1
4:5
9:16
16:9
Landscape custom
Portrait custom
```

Cards may use variable aspect ratios.

Pack covers may use a controlled editorial ratio for consistency.

---

# 41. Public vs Admin Design

## Public

Prioritize:

- visual storytelling;
- whitespace;
- artwork;
- typography;
- discovery.

## Admin

Prioritize:

- speed;
- clarity;
- forms;
- tables;
- status;
- operational efficiency.

Both share:

- colors;
- typography;
- buttons;
- inputs;
- badges;
- spacing;
- accessibility rules.

---

# 42. Iconography

Use simple outline icons.

Recommended characteristics:

- consistent stroke;
- minimal detail;
- neutral visual weight.

Icons should support text, not replace understandable labels unless common.

Example:

Search icon is acceptable without visible label inside a clearly identifiable search control.

Destructive actions should generally include text in admin.

---

# 43. Accessibility

Minimum target:

> WCAG 2.1 AA

Requirements:

- keyboard navigation;
- focus-visible;
- adequate text contrast;
- semantic controls;
- form labels;
- error descriptions programmatically associated with fields;
- focus moves to an error summary or first invalid field after failed submit;
- alt text;
- interactive targets are at least `44 × 44` CSS pixels where practical;
- menus, sheets, and dialogs return focus to their trigger when closed;
- copied, loading, payment, and access feedback use accessible live status where appropriate;
- status never communicated only through color.

Primary lime must be paired with dark foreground.

Avoid lime text on white backgrounds for body copy.

---

# 44. Responsive Breakpoints

Recommended implementation baseline:

```text
Mobile: < 640
Small: 640+
Medium: 768+
Large: 1024+
XL: 1280+
2XL: 1536+
```

These may map to framework defaults.

Layout decisions should be content-driven, not breakpoint-driven only.

---

# 45. Desktop Layout

Public content max width may use approximately:

```text
1200–1440px
```

depending on screen.

Prompt grids may expand wider than text-heavy pages.

Long-form text should remain narrower.

---

# 46. Mobile Layout

Public pages use single-column hierarchy.

Priority order:

```text
Artwork
Title
Primary Action
Core Content
Supporting Metadata
```

Avoid:

- tiny multi-column cards;
- dense metadata;
- desktop-sized navigation;
- persistent overlays covering artwork.

---

## 46.1 Theme Scope

Dark mode is not included in MVP. Tokens remain semantic so a dark theme can be evaluated later without designing or implementing it now.

---

# 47. Motion

Motion should be subtle.

Allowed:

- hover transitions;
- dropdown enter/exit;
- toast;
- filter state;
- lightweight image/card transitions.

Avoid:

- excessive parallax;
- constant animation;
- slow cinematic transitions on core navigation.

Preferred duration:

```text
150–250ms
```

for standard UI interactions.

Respect `prefers-reduced-motion`. When enabled, remove or minimize nonessential transitions, parallax, and animated grid reflow while keeping state feedback understandable.

---

# 48. Interaction Feedback

Every interaction must provide feedback.

Examples:

```text
Copy Prompt → Copied
Save Draft → Saved
Publish → Published
Payment check → Checking...
Access token → Validating...
```

Never leave user wondering whether an action succeeded.

---

# 49. Content Density

Public:

> low-to-medium density

Admin:

> medium density

Prompt text can be dense by nature, so surrounding UI should remain calm.

---

# 50. Public Design Do

Do:

- let artwork dominate;
- use whitespace;
- keep labels concise;
- keep visual hierarchy obvious;
- use lime strategically;
- make Copy Prompt obvious;
- treat packs like collections;
- keep search accessible.

---

# 51. Public Design Don't

Do not:

- make every card lime;
- use dashboard tiles everywhere;
- force sidebar navigation;
- overload cards with metadata;
- hide free prompt behind login;
- use gradients/glows everywhere;
- make pack pages resemble conventional marketplace listings;
- use tiny prompt text.

---

# 52. Admin Design Do

Do:

- favor clear forms;
- use tables where efficient;
- expose status clearly;
- provide quick actions;
- preserve predictable navigation;
- show warnings before entitlement-impacting actions.

---

# 53. Admin Design Don't

Do not:

- prioritize visual spectacle over operation;
- use public masonry layout for content management;
- hide important status in hover-only UI;
- hard delete purchased content without explicit policy.

---

# 54. Component Inventory — MVP Public

Required:

```text
Header
Mobile Menu
Search
Filter
Prompt Card
Prompt Grid
Category Link/Card
Pack Card
Button
Badge
Chip
Prompt Content Block
Variable Field
Variable Group
Required Variable Error
Composed Prompt Preview
Reset Variables Action
Copy Button
Copy Link Action
Premium Locked Panel
Pack Preview Gallery
Image Error / Fallback
Input
Email Input
Payment Status
Access Status
Session Expired State
Toast
Footer
404 State
Error State
Loading Skeleton
Empty State
```

---

# 55. Component Inventory — MVP Admin

Required:

```text
Admin Sidebar
Admin Header
Button
Button Group
Badge
Chip
Input
Textarea
Select
Checkbox
Toggle
Search
Filter
Table
Pagination if needed
Overflow Menu
Modal
Toast
Image Upload
Prompt Form
Pack Form
Primary Sales Pack Select
Entitlement Warning
Rotate Token Dialog
Revoke Token Dialog
Suspend Entitlement Dialog
Reason Input
Price Changed Warning
Status Control
```

---

# 56. Components Not Required for MVP

Unless a later screen specifically needs them:

```text
Range Slider
Avatar System
User Profile Menu
Complex Breadcrumb System
Advanced Data Visualization
Calendar Picker
Rich Text Collaboration
Drag-and-Drop Builder
```

The source design system may contain these patterns, but RenderBank should not implement unused components simply for completeness.

---

# 57. Design Token Naming

Recommended semantic token approach:

```text
--color-primary
--color-background
--color-surface
--color-foreground
--color-muted
--color-border

--color-success
--color-warning
--color-danger
--color-info

--color-primary-hover
--color-primary-active
--color-primary-disabled
--color-on-primary
--color-focus-ring

--color-success-surface
--color-success-foreground
--color-success-border
--color-warning-surface
--color-warning-foreground
--color-warning-border
--color-danger-surface
--color-danger-foreground
--color-danger-border
--color-info-surface
--color-info-foreground
--color-info-border

--radius-sm
--radius-md
--radius-lg
--radius-pill

--space-1
--space-2
...
```

Components should consume semantic tokens rather than raw colors where possible.

---

# 58. Design System Architecture

Recommended hierarchy:

```text
Foundations
├── Color
├── Typography
├── Spacing
├── Radius
├── Border
├── Shadow
└── Motion

Primitives
├── Button
├── Input
├── Badge
├── Chip
├── Checkbox
├── Radio
├── Toggle
└── Select

Patterns
├── Search
├── Filter
├── Navigation
├── Dropdown
├── Modal
├── Toast
└── Table

Product Components
├── Prompt Card
├── Prompt Grid
├── Prompt Detail
├── Variable Editor
├── Composed Prompt Preview
├── Premium Locked Panel
├── Pack Card
├── Pack Hero
├── Accountless Access Library
└── Admin Prompt Form
```

---

# 59. Source Design Adaptation for RenderBank

The provided reference design system was originally expressed as an ERP-style application system.

RenderBank adopts the same foundations:

- lime primary;
- neutral palette;
- Inter typography;
- rounded controls;
- subtle surfaces;
- semantic status colors;
- clean forms;
- simple navigation;
- concise badges.

However, RenderBank changes application emphasis.

## Keep Strongly

- Color System
- Typography
- Buttons
- Badges
- Chips
- Inputs
- Search / Filters
- Dropdown
- Modal
- Toast
- Clean navigation language

## Use Primarily in Admin

- Sidebar
- Data Grid
- Pagination
- Overflow actions
- dense information cards

## Replace for Public RenderBank

ERP dashboard emphasis is replaced by:

- visual prompt grid;
- editorial hero;
- image-led prompt card;
- prompt detail recipe;
- curated pack presentation.

---

# 60. Design Direction Summary

RenderBank visual language can be summarized as:

> **Clean editorial minimalism with an acid-lime digital accent.**

Core characteristics:

```text
Warm neutral canvas
+
Dark confident typography
+
Acid lime interaction accent
+
Large AI artwork
+
Minimal chrome
+
Consistent rounded controls
```

---

# 61. Locked Design Decisions

Unless intentionally revised:

1. Primary brand color is `#D2FD17`.
2. Main typography is Inter.
3. Public RenderBank uses a light visual-first experience.
4. Artwork receives more visual weight than UI chrome.
5. Public site does not use ERP-style sidebar navigation.
6. Admin may use sidebar + table patterns.
7. Primary buttons use lime with dark foreground.
8. Semantic colors retain conventional meaning.
9. Prompt cards are image-first.
10. Prompt Detail feels editorial, not marketplace-like.
11. Pack Detail may use stronger campaign composition.
12. UI avoids heavy shadows and excessive gradients.
13. Mobile remains a first-class design target.
14. Free prompt flow remains visually frictionless.
15. Premium locked state is intentional and clear, not error-like.
16. Copy Prompt copies the composed prompt when variables exist.
17. Copy Link is secondary to Copy Prompt and always uses the canonical public URL.
18. Focus treatment must remain visible against light surfaces; lime alone is insufficient.
19. Masonry preserves DOM, keyboard, and screen-reader order.
20. Access Library is accountless and scoped to one purchase per secure session.
21. Access token is long-lived and is not rotated during normal validation.
22. Dark mode is not part of MVP.
23. Motion respects `prefers-reduced-motion`.
24. Public interactive targets are at least `44 × 44` CSS pixels where practical.

---

# 62. Next Design Step

After approval of this document:

```text
docs/design/DESIGN.md
↓
Low-Fidelity Wireframes
↓
Design System Component Spec
↓
High-Fidelity UI
```

Low-fidelity wireframes should validate structure and hierarchy before final visual polish.

The first screens recommended for wireframing are:

```text
1. Prompt Detail — Free
2. Prompt Detail — Premium Locked
3. Explore
4. Home
5. Pack Detail
6. Checkout
7. Payment States
8. Accountless Access Library
9. Admin Prompt Form
10. Admin Pack Form
```
