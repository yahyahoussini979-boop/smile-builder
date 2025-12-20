-- Create meeting attendance table for RSVPs
CREATE TABLE public.meeting_attendance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'attending' CHECK (status IN ('attending', 'maybe', 'not_attending')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- Enable RLS
ALTER TABLE public.meeting_attendance ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can view attendance
CREATE POLICY "Authenticated users can view attendance"
ON public.meeting_attendance
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Users can manage their own attendance
CREATE POLICY "Users can insert their own attendance"
ON public.meeting_attendance
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own attendance"
ON public.meeting_attendance
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own attendance"
ON public.meeting_attendance
FOR DELETE
USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_meeting_attendance_updated_at
BEFORE UPDATE ON public.meeting_attendance
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();