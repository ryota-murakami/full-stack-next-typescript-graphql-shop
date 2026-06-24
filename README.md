# Full-Stack Next TypeScript GraphQL Shop

Modern e-commerce demo built with Next.js App Router, GraphQL Yoga, Prisma, PostgreSQL, Apollo Client, Tailwind CSS, and shadcn/ui.

## Stack

- Frontend: Next.js 16, React 19, TypeScript 6, Tailwind CSS 4, shadcn/ui
- Backend: GraphQL Yoga 5, Express 5, Prisma 7, PostgreSQL 16
- State and data: Apollo Client 4, Zustand
- Testing: Playwright E2E
- Local services: Docker Compose PostgreSQL on `localhost:5434`, Mailpit on `localhost:8025`

## Quick Start

```bash
pnpm install
pnpm db:up
pnpm prisma:generate
pnpm prisma:migrate
pnpm db:seed
pnpm dev
```

Open:

- Frontend: http://localhost:3000
- GraphQL: http://localhost:4000/graphql
- Mailpit: http://localhost:8025
- PostgreSQL: `postgresql://shop:shopdev@localhost:5434/fullstack_shop`

Seeded local users:

- Admin: `admin@fullstack.shop` / `password123`
- User: `user@fullstack.shop` / `password123`

## Environment

Backend env lives in `backend/.env`.

```env
DATABASE_URL="postgresql://shop:shopdev@localhost:5434/fullstack_shop"
APP_SECRET="your-super-secret-key-change-in-production"
FRONTEND_URL="http://localhost:3000"
PORT=4000
STRIPE_SECRET=""
MAIL_HOST="localhost"
MAIL_PORT=1025
MAIL_USER=""
MAIL_PASS=""
```

Frontend env is optional for local development.

```env
NEXT_PUBLIC_GRAPHQL_ENDPOINT="http://localhost:4000/graphql"
NEXT_PUBLIC_STRIPE_TEST_TOKEN="tok_visa"
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=""
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=""
```

Checkout starts without Stripe keys, but completing payment requires a Stripe test secret in `backend/.env`. Image upload is disabled until Cloudinary cloud name and unsigned upload preset env vars are configured.

## Commands

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Start frontend and backend dev servers |
| `pnpm build` | Build both apps and copy backend GraphQL schema to `dist` |
| `pnpm lint` | Run ESLint CLI across workspaces |
| `pnpm typecheck` | TypeScript checks across workspaces |
| `pnpm db:up` | Start PostgreSQL and Mailpit |
| `pnpm db:down` | Stop local services |
| `pnpm db:reset` | Recreate local database volume |
| `pnpm db:seed` | Seed local users and demo catalog |
| `pnpm prisma:generate` | Generate Prisma client for backend |
| `pnpm prisma:migrate` | Apply local Prisma migrations |
| `pnpm --filter full-stack-shop-frontend test:e2e -- --workers=1` | Run Playwright E2E |

Before starting servers in agent workflows, run `kill-port` for ports `3000` and `4000`.

## Local Feature Notes

- Protected pages (`/sell`, `/orders`, `/order/[id]`, `/update/[id]`, `/permissions`) redirect unauthenticated users to `/signin?next=...`.
- Password reset sends email to Mailpit by default. Open http://localhost:8025 and follow the reset link.
- Checkout calls the real `createOrder` GraphQL mutation with `NEXT_PUBLIC_STRIPE_TEST_TOKEN` (`tok_visa` by default). Set `STRIPE_SECRET=sk_test_...` to complete the Stripe charge.
- Cloudinary upload uses `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` and `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`; missing config shows a user-facing form error.
- GraphQL exposes expected auth, permission, validation, missing mail, and missing Stripe errors during local development while production keeps Yoga masking enabled for unexpected failures.

## Issue Tracker

All project work is tracked in GitHub Issues:
https://github.com/ryota-murakami/full-stack-next-typescript-graphql-shop/issues
