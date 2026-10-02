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

Copy `.env.example` to `.env.local` and replace its placeholders with the local API URL, publishable key, and secret key from `npm exec -- supabase status`. Only `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` may be exposed to the browser; `SUPABASE_SECRET_KEY` is server-only. The current status shell does not need credentials until a Supabase client is used. Missing or malformed configuration fails at client creation. Do not commit `.env.local` or reuse local keys in a deployed environment.

Seed rows are **Demo Content**, not tested launch inventory. Seed preview rows contain metadata but no image bytes, so those example URLs remain unresolved until real validated artwork is uploaded and associated. This foundation does not expose a discovery page or production-ready Prompts.

## Admin provisioning and preview artwork

Public Supabase Auth signup is disabled in `supabase/config.toml`. Manually create an Auth user with trusted Supabase Admin tooling, then insert an active `admin_profiles` row with that user's Auth UUID (`user_id`). For example, using a trusted database session after creating the user: `insert into public.admin_profiles (user_id) values ('<auth-user-uuid>');`. Do not commit Admin passwords or put them in the seed. A valid Auth identity without an active profile has only public read access; disable an Admin immediately with `update public.admin_profiles set is_active = false where user_id = '<auth-user-uuid>';` in a trusted session.

Active Admin sessions may edit approved Prompt, Pack, and taxonomy rows through RLS, but cannot write Storage or `media_assets` directly. Server code calls `uploadPreviewArtwork(file)` from `lib/artwork/upload.ts` in a request with the Admin's Supabase Auth cookie. It verifies the current Auth user and active profile before using the trusted client, validates and re-encodes JPEG/PNG/WebP/AVIF input as WebP, then creates an opaque object path and the measured asset metadata. The public `prompt-previews` bucket serves uploaded bytes immediately; only explicit database associations to published content expose asset metadata. Upload does not publish a Prompt or Pack. Editorial review must ensure the visible image contains no Premium text, Buyer information, or credentials: byte validation cannot inspect semantic content. Do not add an Admin JWT object-upload policy; that bypasses the server's byte checks.

## License

Licensed under the [MIT License](LICENSE).
