-- Allow elevated roles to update any profile
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can update own profile or elevated roles can update any"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id OR has_elevated_role(auth.uid()));