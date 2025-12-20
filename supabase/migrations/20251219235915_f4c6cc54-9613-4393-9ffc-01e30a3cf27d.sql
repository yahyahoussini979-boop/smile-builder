-- Add target_audience column to events table
-- NULL means the event is for all members, specific value means committee-only

ALTER TABLE public.events 
ADD COLUMN target_audience committee_type DEFAULT NULL;