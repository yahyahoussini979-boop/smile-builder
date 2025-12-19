-- Create junction table for member-committee relationships
CREATE TABLE public.member_committees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  committee committee_type NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(member_id, committee)
);

-- Enable RLS
ALTER TABLE public.member_committees ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Anyone can view member committees"
ON public.member_committees
FOR SELECT
USING (true);

CREATE POLICY "Elevated roles can manage member committees"
ON public.member_committees
FOR ALL
USING (has_elevated_role(auth.uid()));

-- Migrate existing data from profiles.committee to member_committees
INSERT INTO public.member_committees (member_id, committee)
SELECT id, committee FROM public.profiles WHERE committee IS NOT NULL;