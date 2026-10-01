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

Seed rows are **Demo Content**, not tested launch inventory. Preview rows contain metadata but no image bytes; URLs for those examples do not resolve until validated artwork is uploaded in a later slice. This slice does not expose a discovery page or production-ready Prompts.

## License

Licensed under the [MIT License](LICENSE).
