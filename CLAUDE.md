# Project: Personal Finance Manager (portfolio project)

## Stack
- Next.js (App Router) + TypeScript strict
- PostgreSQL on Neon, Prisma ORM
- Auth.js (NextAuth) with credentials provider
- Tailwind CSS, Recharts, Zod
- Deployed on Vercel

## Rules
- Money is stored as integer (IDR, no decimals). Never use Float for money.
- Format currency as Indonesian Rupiah: Rp 1.250.000
- Every database query must be scoped to the logged-in user (userId).
- Validate all inputs with Zod on the server.
- Use Server Actions for mutations, Server Components for data fetching where possible.
- Every new UI must support dark mode and be responsive (mobile first).
- Every list needs a loading skeleton and an empty state. Every mutation shows a toast.
- Keep components small and reusable. Put shared logic in /lib, UI primitives in /components/ui.
- UI text in English.
- Only build what the current prompt asks. Do not start the next feature on your own.
- After finishing a task: run type check and lint, fix errors, then summarize what changed and which files were touched.

## Env vars
- DATABASE_URL (pooled connection, runtime)
- DIRECT_URL (direct connection, migrations)
- AUTH_SECRET
- CRON_SECRET (protects /api/cron/recurring)