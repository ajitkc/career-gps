# Career GPS

AI-powered career guidance platform that generates personalized career roadmaps, burnout assessments, and milestone tracking based on your skills, interests, and education.

Built with Next.js 16, Supabase, Gemini AI, and a premium dark UI.

## Team members

Team 68

- Ajit KC
- Suranjan Rana Magar
- Barshad Panday

## Features

- **Personalized Career Paths** — 3-5 career suggestions matched to your skills, interests, and degree field
- **Interactive Journey Map** — 2D node-based career map with animated car navigation, tooltips, and path highlighting
- **Milestone Blueprint** — Time-bound roadmap from Day 1 to Year 1 with task checklists
- **Burnout Monitor** — Deterministic scoring based on work hours, sleep quality, and emotional state
- **AI Chatbot** — Career assistant that provides guidance, burnout tips, and can update your career track
- **Editable Profile** — Update skills, interests, routine, and watch career suggestions regenerate in real-time
- **Login / Signup** — Email + password authentication with Supabase persistence

## Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 with custom design tokens
- **Database**: Supabase (PostgreSQL)
- **AI**: Google Gemini 2.0 Flash (with personalized mock fallback)
- **Animation**: Framer Motion, Three.js (landing page highway)
- **Fonts**: Instrument Sans + Instrument Serif

## Quick Start

### Prerequisites

- [Bun](https://bun.sh/) (v1.0+) or Node.js (v18+)
- A [Supabase](https://supabase.com/) project
- (Optional) A [Google Gemini API key](https://ai.google.dev/)

### 1. Clone & Install

```bash
git clone https://github.com/ajitkc/career-gps.git
cd career-gps
bun install
```

### 2. Environment Variables

Copy the example and fill in your values:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# Set to true to use mock data (no API key needed for demo)
USE_MOCK=true

# Gemini API (optional — only needed when USE_MOCK=false)
GEMINI_API_KEY=your-gemini-api-key

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your-supabase-key
```

### 3. Database Setup

Run the schema in your Supabase SQL Editor:

```bash
# Main schema (run first)
cat supabase/schema.sql

# Migrations (run if updating an existing DB)
cat supabase/add_password_hash.sql
cat supabase/add_education_fields.sql
```

### 4. Run

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Using Make (alternative)

```bash
make setup   # Install deps + create .env.local
make dev     # Start dev server
make build   # Production build
make db      # Print DB setup instructions
```

## Project Structure

```
src/
├── app/
│   ├── page.tsx                 # Landing page
│   ├── login/page.tsx           # Login page
│   ├── (app)/
│   │   ├── dashboard/page.tsx   # Main journey dashboard
│   │   ├── burnout/page.tsx     # Burnout monitor
│   │   ├── profile/page.tsx     # Editable profile
│   │   ├── careers/page.tsx     # Career deep-dive
│   │   └── roadmap/page.tsx     # Milestone roadmap
│   └── api/
│       ├── analyze/route.ts     # Career analysis (Gemini/mock)
│       ├── checkin/route.ts     # Chatbot check-in
│       ├── login/route.ts       # Authentication
│       ├── check-email/route.ts # Duplicate check
│       ├── update-profile/      # Profile updates
│       └── update-analysis/     # Career track updates
├── components/
│   ├── app/
│   │   ├── AppShell.tsx         # Authenticated layout
│   │   ├── CityCareerMap.tsx    # Interactive SVG career map
│   │   └── AssistantBubble.tsx  # AI chatbot
│   ├── onboarding/
│   │   └── OnboardingFlow.tsx   # 6-step signup
│   └── ui/                      # Design system components
├── lib/
│   ├── llm.ts                   # Gemini AI / mock handler
│   ├── prompts.ts               # AI prompt templates
│   ├── supabase.ts              # Database helpers
│   ├── store.tsx                # React Context + localStorage
│   ├── burnout.ts               # Burnout scoring algorithm
│   └── auth.ts                  # Password hashing
├── data/
│   └── mock-response.ts         # Personalized mock data generator
├── types/
│   └── index.ts                 # Full TypeScript type system
└── supabase/
    └── schema.sql               # Database schema
```

## Mock vs AI Mode

- **`USE_MOCK=true`** (default): Uses a personalized mock data generator that matches careers to your skills, interests, and education field. Instant responses, no API key needed. Great for demos.
- **`USE_MOCK=false`**: Calls Google Gemini 2.0 Flash for fully AI-generated career analysis. Requires a valid `GEMINI_API_KEY`. Note: free tier has daily quota limits.

## License

MIT
