# RenderBank

RenderBank is a visual-first library of curated, tested AI image prompts. The MVP supports public prompt discovery, one-time prompt-pack purchases, and secure accountless buyer access.

Start with the [documentation map](docs/README.md) for product, experience, design, and engineering specifications.

## Stack

- Next.js 16 with the App Router
- TypeScript
- HeroUI v3
- Tailwind CSS v4
- Supabase PostgreSQL, Auth, and Storage
- Vercel

## Local development

Requires Node.js 22+, npm, and Docker Desktop with its daemon running. Supabase CLI is pinned as a development dependency; no global installation is needed.

```bash
npm ci
npm run db:start
npm run db:reset
npm run db:test
npm run db:types:check
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). `npm run db:reset` destroys **local** Supabase data, applies committed migrations, and loads deterministic Demo Content; do not point it at a remote project. To regenerate types after a migration, run `npm run db:types`, then commit `lib/supabase/database.types.ts`. `npm run db:types:check` compares regenerated output without writing to disk. Run `npm exec -- supabase stop` to stop local services.

Copy `.env.example` to `.env.local` and replace its placeholders with the local API URL, publishable key, and secret key from `npm exec -- supabase status`. Only `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` may be exposed to the browser; `SUPABASE_SECRET_KEY` is server-only. Public discovery now needs the local API URL and publishable key to render; the server-only secret key remains unnecessary for browsing. Set `NEXT_PUBLIC_SITE_URL` to the deployed origin for canonical URLs (local development defaults to `http://localhost:3000`). Missing or malformed Supabase configuration fails at client creation. Do not commit `.env.local` or reuse local keys in a deployed environment.

## Foundation delivery gate

Before Phase 2 Public Discovery, run the single fail-fast gate from a checkout with Node.js 22+, npm, and Docker Desktop running:

```bash
npm run foundation:check
```

The command runs `npm ci` from the committed lockfile, typecheck and non-mutating lint, checks Docker and local Supabase, resets the **local** database and Demo Content, runs real-role policy/Storage/RPC tests, checks generated database types without rewriting them, then runs all application tests, a production build, a public-output trusted-key scan, and the production root smoke check. It starts local Supabase when needed; no Dashboard changes, remote project, `.env.local`, payment provider credentials, or hand-created schema are required. The build receives local public URL/publishable values from the CLI and deliberately omits the Supabase, payment, email, and session server credentials regardless of environment-variable casing (including Windows); it does not log local keys. Remove `.env`, `.env.local`, `.env.production`, and `.env.production.local` before running the gate: Next.js could otherwise override public build values or load a trusted key. A clean checkout needs none of these files. Each stage is labeled; if one fails, address its error and rerun the command. `npm ci` and Supabase reset can change local dependencies and **local database rows** respectively, but the gate compares Git status before and after to catch file changes. Stop services with `npm exec -- supabase stop` when finished.

Seed rows are **Demo Content**, not tested launch inventory. Home, Explore, and Category show their safe metadata; seed preview rows have no image bytes, so the UI displays a labeled reserved-frame fallback until real validated artwork is uploaded. Demo rows carry `featured_order` values that exercise Home curation and are likewise unvalidated examples. Prompt detail and Prompt Pack destinations are interim noindex previews, not usable recipes or a storefront; purchases remain unavailable.

## Phase 2 delivery gate

Public Discovery builds on the foundation gate. After any Phase 2 change (discovery curation, filter shell, SEO surface), run the full sequence locally with Docker Desktop running:

```bash
npm run db:reset
npm run db:test
npm run db:types
npm run db:types:check
npm test
npm run typecheck
npm run lint
npm run build
npm run smoke
```

`npm run db:reset` re-applies migrations including the Phase 2 completion migration (featured `prompts.featured_order`, partial index, and the `bounded_search_text` domain that rejects oversized direct search input at the database level). The smoke check asserts protected recipe markers never reach public HTML, `robots.txt` excludes later-phase routes, and `sitemap.xml` stays limited to indexable Phase 2 routes (`/`, `/explore`, `/about`, active category routes). Focused browser verification covers keyboard operability of the header dropdown and drawers, filter chip semantics, and skeleton loading states; those interactions rely on HeroUI's built-in focus management.

## Admin provisioning and preview artwork

Public Supabase Auth signup is disabled in `supabase/config.toml`. Manually create an Auth user with trusted Supabase Admin tooling, then insert an active `admin_profiles` row with that user's Auth UUID (`user_id`). For example, using a trusted database session after creating the user: `insert into public.admin_profiles (user_id) values ('<auth-user-uuid>');`. Do not commit Admin passwords or put them in the seed. A valid Auth identity without an active profile has only public read access; disable an Admin immediately with `update public.admin_profiles set is_active = false where user_id = '<auth-user-uuid>';` in a trusted session.

Active Admin sessions may edit approved Prompt, Pack, and taxonomy rows through RLS, but cannot write Storage or `media_assets` directly. Server code calls `uploadPreviewArtwork(file)` from `lib/artwork/upload.ts` in a request with the Admin's Supabase Auth cookie. It verifies the current Auth user and active profile before using the trusted client, validates and re-encodes JPEG/PNG/WebP/AVIF input as WebP, then creates an opaque object path and the measured asset metadata. The public `prompt-previews` bucket serves uploaded bytes immediately; only explicit database associations to published content expose asset metadata. Upload does not publish a Prompt or Pack. Editorial review must ensure the visible image contains no Premium text, Buyer information, or credentials: byte validation cannot inspect semantic content. Do not add an Admin JWT object-upload policy; that bypasses the server's byte checks.

## License

Licensed under the [MIT License](LICENSE).
