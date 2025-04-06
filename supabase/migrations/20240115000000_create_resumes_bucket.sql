-- Create the resumes storage bucket directly using INSERT
-- Note: We're skipping storage.create_bucket since it doesn't exist

-- Set up storage bucket with appropriate settings - making it fully PUBLIC
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES ('resumes', 'resumes', true, false, 20971520, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/octet-stream', 'image/*']::text[])
ON CONFLICT (id) DO UPDATE SET
  public = true, -- Make sure the bucket is public
  file_size_limit = 20971520, -- 20MB
  allowed_mime_types = ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/octet-stream', 'image/*']::text[];

-- Remove ALL existing policies on the storage.objects table for this bucket
DROP POLICY IF EXISTS "Users can upload their own resumes" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own resumes" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own resumes" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own resumes" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can access resumes bucket" ON storage.objects;
DROP POLICY IF EXISTS "Public can view resumes" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can manage resumes" ON storage.objects;

-- Create maximally permissive policies for the resumes bucket
-- Allow anyone to view files in the resumes bucket (public read)
CREATE POLICY "Public can view resumes"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'resumes');

-- Allow anyone to upload files (we'll secure through application logic)
CREATE POLICY "Anyone can upload and manage resumes"
ON storage.objects
FOR ALL
TO public
USING (bucket_id = 'resumes')
WITH CHECK (bucket_id = 'resumes');

-- Drop the lowercase candidate table if it exists (this was created by mistake)
DROP TABLE IF EXISTS public.candidate;

-- Add resume_url and resume_filename columns to the correct Candidate table if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'Candidate' 
    AND column_name = 'resume'
  ) THEN
    ALTER TABLE public."Candidate" ADD COLUMN resume TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'Candidate' 
    AND column_name = 'resume_url'
  ) THEN
    ALTER TABLE public."Candidate" ADD COLUMN resume_url TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'Candidate' 
    AND column_name = 'resume_filename'
  ) THEN
    ALTER TABLE public."Candidate" ADD COLUMN resume_filename TEXT;
  END IF;
END $$; 