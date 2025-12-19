-- Update points_log policy to allow all authenticated users to view points
DROP POLICY IF EXISTS "Users can view own points" ON public.points_log;

CREATE POLICY "Authenticated users can view all points" 
ON public.points_log 
FOR SELECT 
USING (auth.uid() IS NOT NULL);