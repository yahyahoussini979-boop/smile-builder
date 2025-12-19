-- Drop the existing insert policy that restricts to elevated roles only
DROP POLICY IF EXISTS "Elevated roles can create posts" ON public.posts;

-- Create new policy: All authenticated users can create internal posts
CREATE POLICY "Authenticated users can create internal posts" 
ON public.posts 
FOR INSERT 
WITH CHECK (
  auth.uid() = author_id 
  AND visibility IN ('internal_all', 'committee_only')
);

-- Create policy: Only elevated roles can create public posts
CREATE POLICY "Elevated roles can create public posts" 
ON public.posts 
FOR INSERT 
WITH CHECK (
  auth.uid() = author_id 
  AND visibility = 'public' 
  AND has_elevated_role(auth.uid())
);