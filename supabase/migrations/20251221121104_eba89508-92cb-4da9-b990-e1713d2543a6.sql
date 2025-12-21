-- Add RLS policy for admin-only posts
CREATE POLICY "Admin-only posts viewable by elevated roles"
ON public.posts
FOR SELECT
USING (
  visibility = 'admin_only'::post_visibility 
  AND has_elevated_role(auth.uid())
);

-- Allow elevated roles to create admin-only posts
CREATE POLICY "Elevated roles can create admin-only posts"
ON public.posts
FOR INSERT
WITH CHECK (
  auth.uid() = author_id 
  AND visibility = 'admin_only'::post_visibility 
  AND has_elevated_role(auth.uid())
);