-- Run this in Supabase SQL Editor to add education level and degree field columns
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS education_level text NOT NULL DEFAULT 'bachelors';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS degree_field text NOT NULL DEFAULT 'other';
