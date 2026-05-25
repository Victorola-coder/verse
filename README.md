# Verse

A minimalist quote-sharing experience with real-time feed, drafts, and image export.

## Stack

- Next.js App Router
- Prisma + Postgres (Supabase)
- Supabase Storage + Realtime
- Zustand (UI state)
- TanStack Query + axios (server data)
- Tailwind CSS

## Setup

1. Copy env:

```bash
cp .env.example .env.local
```

2. Create a Supabase project. Add to `.env.local`:

- `DATABASE_URL` — session pooler (port **6543**, `?pgbouncer=true`)
- `DIRECT_URL` — direct connection (port **5432**)
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`

3. In Supabase Dashboard:

- **Storage**: create public bucket `quote-images`
- **Database → Replication**: enable realtime for `quotes` and `quote_likes`

4. Push schema and seed:

```bash
bun install
bun run db:push
bun run db:seed
```

5. Run:

```bash
bun dev
```

## API routes (first-party)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/quotes` | List quotes (`?category=`, `?featured=true`) |
| POST | `/api/quotes` | Publish quote |
| POST | `/api/quotes/[id]/like` | Toggle like |
| GET | `/api/drafts` | List your drafts |
| POST | `/api/drafts` | Create draft |
| GET/PATCH/DELETE | `/api/drafts/[id]` | Draft CRUD |
| POST | `/api/upload/quote-image` | Upload background (Supabase Storage) |

All mutating routes require `X-Session-Id` header (set automatically by `lib/api.ts`).

## Structure

```
app/api/          # Route handlers
lib/
  prisma.ts       # Singleton client
  supabase.ts     # Storage + realtime
  services/       # DB logic
  hooks/          # React Query
  store/          # Zustand UI state
prisma/           # Schema + seed
```
