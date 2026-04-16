# Insight Board

Insight Board is a full-stack analytics dashboard for transaction monitoring, audit visibility, and demo-friendly admin workflows. The project combines a React frontend optimized for large datasets with an Express + Prisma backend that provides authentication, filtering, audit logging, and operational tooling.

## Architecture Overview

- `client/`: React 19 + TypeScript SPA built with Vite, React Router, TanStack Query, Tailwind CSS, and virtualized data tables.
- `server/`: Express + TypeScript API using Prisma ORM and SQLite in development.
- Shared flow: authenticated frontend requests backend APIs for overview metrics, transactions, presets, audit logs, and demo reset actions.

## Tech Stack

- Frontend: React, TypeScript, Vite, Tailwind CSS, TanStack Query, TanStack Virtual, React Hook Form, Zod, Recharts
- Backend: Express, TypeScript, Prisma, SQLite, JWT auth, Pino logging, Helmet, express-rate-limit
- Tooling: Vitest, ESLint

## Features

- JWT-based authentication with protected routes
- Role-aware UI and API authorization
- Overview dashboard with KPI cards and charts
- Virtualized transaction table with infinite scroll
- Server-side filtering, sorting, and CSV export
- Audit log history with expandable before/after payloads
- Saved filter presets
- Demo mode with admin reset flow
- Health check endpoint, structured logging, security headers, and rate limiting
- Dark mode with persisted theme preference

## Demo Credentials

- Email: `demo@insightboard.local`
- Password: `password123`

If your local seed/bootstrap differs, check [demo.ts](/Volumes/code/Insight-board/server/src/config/demo.ts) and the demo user bootstrap logic.

## Run the Project

1. Start the backend:

```bash
cd server
npm install
npx prisma migrate dev
npm run dev
```

2. Start the frontend in a second terminal:

```bash
cd client
npm install
npm run dev
```

3. Open the app:

```text
http://localhost:5173
```

The API runs on:

```text
http://localhost:4000
```

## Deploy the Backend

Run database schema changes as a deploy step, not inside the web server start
command. This keeps cold starts fast because `npm start` only launches the API.

```bash
cd server
npm run build
npm run deploy:migrate
npm start
```

Use `npm run deploy:push` only when you intentionally want Prisma to sync the
schema directly without migrations.

## Seed the Database

Use Prisma seed support from the backend:

```bash
cd server
npm install
npx prisma db seed
```

If you want a clean local database first:

```bash
cd server
rm -f prisma/dev.db
npx prisma migrate dev
npx prisma db seed
```

## Project Structure

```text
client/
  src/components
  src/context
  src/hooks
  src/pages
  src/api

server/
  src/routes
  src/middleware
  src/utils
  prisma
```
