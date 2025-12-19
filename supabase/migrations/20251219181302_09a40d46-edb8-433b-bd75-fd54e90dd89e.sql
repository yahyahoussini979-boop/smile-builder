-- Create club_assets storage bucket for post images and avatars
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'club_assets', 
  'club_assets', 
  true, 
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
);

-- Policy: Anyone can view public assets
CREATE POLICY "Public can view club assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'club_assets');

-- Policy: Authenticated users can upload avatars to their own folder
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'club_assets' 
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = 'avatars'
  AND (storage.foldername(name))[2] = auth.uid()::text
);

-- Policy: Users can update their own avatar
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'club_assets'
  AND (storage.foldername(name))[1] = 'avatars'
  AND (storage.foldername(name))[2] = auth.uid()::text
);

-- Policy: Users can delete their own avatar
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'club_assets'
  AND (storage.foldername(name))[1] = 'avatars'
  AND (storage.foldername(name))[2] = auth.uid()::text
);

-- Policy: Elevated roles can upload post images
CREATE POLICY "Elevated roles can upload post images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'club_assets'
  AND (storage.foldername(name))[1] = 'posts'
  AND public.has_elevated_role(auth.uid())
);

-- Policy: Elevated roles can update post images
CREATE POLICY "Elevated roles can update post images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'club_assets'
  AND (storage.foldername(name))[1] = 'posts'
  AND public.has_elevated_role(auth.uid())
);

-- Policy: Elevated roles can delete post images
CREATE POLICY "Elevated roles can delete post images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'club_assets'
  AND (storage.foldername(name))[1] = 'posts'
  AND public.has_elevated_role(auth.uid())
);