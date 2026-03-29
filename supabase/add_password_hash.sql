-- Run this in Supabase SQL Editor to add password_hash column
-- (only needed if you created the profiles table before this column was added)

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS password_hash text NOT NULL DEFAULT '';
