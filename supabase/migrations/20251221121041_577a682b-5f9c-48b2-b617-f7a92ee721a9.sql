-- Add 'admin_only' to post_visibility enum
ALTER TYPE public.post_visibility ADD VALUE IF NOT EXISTS 'admin_only';