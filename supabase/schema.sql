-- ============================================================
-- Career GPS — Supabase Database Schema (Hackathon MVP)
-- ============================================================
-- Run this in the Supabase SQL Editor to set up all tables.

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- -----------------------------------------------------------
-- 1. PROFILES — core user identity and background
-- -----------------------------------------------------------
create table public.profiles (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  name text not null,
  email text unique,
  education text not null,
  current_status text not null check (current_status in ('student', 'recent_graduate', 'working_professional', 'career_switcher')),
  weekly_study_hours integer not null default 0,
  weekly_work_hours integer not null default 0,
  sleep_quality text not null default 'fair' check (sleep_quality in ('poor', 'fair', 'good', 'great')),
  emotional_state text not null default 'neutral',
  current_goal text not null default ''
);

-- -----------------------------------------------------------
-- 2. USER_SKILLS — many-to-one from profile
-- -----------------------------------------------------------
create table public.user_skills (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  skill text not null,
  created_at timestamptz not null default now(),

  unique(profile_id, skill)
);

-- -----------------------------------------------------------
-- 3. USER_INTERESTS — many-to-one from profile
-- -----------------------------------------------------------
create table public.user_interests (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  interest text not null,
  created_at timestamptz not null default now(),

  unique(profile_id, interest)
);

-- -----------------------------------------------------------
-- 4. CAREER_RECOMMENDATIONS — LLM-generated career matches
-- -----------------------------------------------------------
create table public.career_recommendations (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),

  title text not null,
  fit_reason text not null,
  difficulty text not null check (difficulty in ('Easy', 'Medium', 'Hard')),
  growth text not null check (growth in ('Low', 'Medium', 'High')),
  stress_level text not null check (stress_level in ('Low', 'Medium', 'High')),
  starting_role text not null,
  progression jsonb not null default '[]',
  estimated_timeline jsonb not null default '{}'
);

-- -----------------------------------------------------------
-- 5. ROADMAPS — LLM-generated roadmap steps
-- -----------------------------------------------------------
create table public.roadmaps (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),

  current_stage text not null,
  next_30_days jsonb not null default '[]',
  next_3_months jsonb not null default '[]',
  next_6_months jsonb not null default '[]',
  next_12_months jsonb not null default '[]'
);

-- -----------------------------------------------------------
-- 6. BURNOUT_ASSESSMENTS — both deterministic + LLM
-- -----------------------------------------------------------
create table public.burnout_assessments (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),

  -- Deterministic scoring
  score integer not null default 0,
  level text not null check (level in ('low', 'medium', 'high')),
  risk_window text not null,
  factors jsonb not null default '[]',

  -- LLM-generated
  stress_level text not null check (stress_level in ('Low', 'Medium', 'High')),
  burnout_risk text not null check (burnout_risk in ('Low', 'Medium', 'High')),
  reasons jsonb not null default '[]',
  recommendations jsonb not null default '[]'
);

-- -----------------------------------------------------------
-- 7. CHECKINS — user follow-up interactions
-- -----------------------------------------------------------
create table public.checkins (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),

  message text not null,
  emotional_state text,

  -- LLM response
  acknowledgment text,
  insight text,
  updated_recommendations jsonb default '[]',
  updated_burnout jsonb default '{}',
  suggested_resources jsonb default '[]'
);

-- -----------------------------------------------------------
-- 8. RESOURCES — recommended learning materials
-- -----------------------------------------------------------
create table public.resources (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),

  title text not null,
  type text not null check (type in ('youtube', 'article', 'course', 'docs', 'project')),
  reason text not null,
  url text not null
);

-- -----------------------------------------------------------
-- Indexes for common queries
-- -----------------------------------------------------------
create index idx_career_recs_profile on public.career_recommendations(profile_id);
create index idx_roadmaps_profile on public.roadmaps(profile_id);
create index idx_burnout_profile on public.burnout_assessments(profile_id);
create index idx_checkins_profile on public.checkins(profile_id);
create index idx_resources_profile on public.resources(profile_id);

-- -----------------------------------------------------------
-- Row Level Security (enable when auth is added)
-- -----------------------------------------------------------
-- alter table public.profiles enable row level security;
-- create policy "Users can read own profile"
--   on public.profiles for select using (auth.uid() = id);
-- create policy "Users can update own profile"
--   on public.profiles for update using (auth.uid() = id);
