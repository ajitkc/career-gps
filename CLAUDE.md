# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

All commands use **Bun** as the package manager/runtime:

- `make setup` — install deps (bun install) + create `.env.local` from `.env.example`
- `make dev` — start Next.js dev server with Turbopack
- `make build` — production build
- `make lint` — run ESLint
- `make typecheck` — run `bunx tsc --noEmit`
- `make clean` — remove `.next` and `node_modules`
- `make db` — print Supabase SQL migration instructions

## Tech Stack

- **Next.js 16** (App Router) with **React 19** and **TypeScript**
- **Tailwind CSS v4** with custom Material Design 3 tokens defined in `src/app/globals.css`
- **Supabase** (PostgreSQL) for auth and data — schema in `supabase/schema.sql`
- **Google Gemini 2.0 Flash** for AI analysis (toggled via `USE_MOCK` env var; mock mode is default)
- **Framer Motion** + **Three.js** for animations
- **Bun** as package manager (uses `bun.lock`)

## Architecture

### Routing & Layout

App Router with two route groups:
- `/` — public landing page
- `/login`, `/onboarding` — auth and profile setup
- `/(app)/*` — authenticated pages (dashboard, burnout, profile, careers, roadmap) wrapped by `AppShell`

### API Routes (`src/app/api/`)

All backend logic lives in Next.js API routes:
- `analyze` — generates career matches, roadmap, burnout score, resources via LLM
- `checkin` — processes chatbot messages
- `login`, `check-email` — auth
- `profile`, `update-profile`, `update-analysis` — CRUD
- `seed-demo` — test data seeding

### State Management

React Context (`src/lib/store.tsx`) with localStorage persistence (key: `career-gps-state`). Hydrates on mount, syncs to Supabase.

### LLM Integration (`src/lib/llm.ts`)

Dual mode controlled by `USE_MOCK` env var:
- `true` — deterministic mock data from `src/data/mock-response.ts` (20+ career templates with smart matching)
- `false` — Google Gemini API with retry/backoff logic

Prompts defined in `src/lib/prompts.ts`.

### Key Business Logic

- **Burnout scoring** (`src/lib/burnout.ts`) — deterministic 0-100 algorithm based on work hours, emotional state, sleep quality, ambition/capacity mismatch, and skill breadth
- **Mock career matching** (`src/data/mock-response.ts`) — careers tagged with skills/interests, filtered by education level

### Database

Supabase PostgreSQL with tables: profiles, user_skills, user_interests, career_recommendations, roadmaps, burnout_assessments, resources, checkins. Schema uses UUIDs, cascade deletes, JSONB for nested data. Migrations in `supabase/`.

### Path Alias

`@/*` maps to `./src/*` (configured in tsconfig.json).

### Components Organization

- `src/components/ui/` — reusable primitives (button, logo, cards)
- `src/components/app/` — app shell, career map, roadmap, chatbot
- `src/components/dashboard/`, `onboarding/`, `landing/` — page-specific components

### Environment Variables

Defined in `.env.example`: `USE_MOCK`, `GEMINI_API_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`.
