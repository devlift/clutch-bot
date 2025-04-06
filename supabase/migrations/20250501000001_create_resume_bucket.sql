-- Migration to create the 'resumes' storage bucket and set up security policies
-- This will run automatically during deployment

-- Function to create the resume bucket and set up all necessary security policies
CREATE OR REPLACE FUNCTION create_resume_bucket()
RETURNS void AS $$
DECLARE
  bucket_exists BOOLEAN;
BEGIN
  -- Check if bucket exists
  SELECT EXISTS(
    SELECT 1 FROM storage.buckets WHERE name = 'resumes'
  ) INTO bucket_exists;
  
  IF NOT bucket_exists THEN
    -- Create the bucket (not public, with 10MB file size limit)
    INSERT INTO storage.buckets (id, name, public, file_size_limit)
    VALUES ('resumes', 'resumes', FALSE, 10485760);
    
    RAISE NOTICE 'Created resumes bucket';
  ELSE
    RAISE NOTICE 'Resumes bucket already exists';
  END IF;
  
  -- Always ensure RLS is enabled (idempotent)
  ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
  
  -- Drop existing policies if they exist (to prevent errors on re-runs)
  DROP POLICY IF EXISTS "Users can upload their own resumes" ON storage.objects;
  DROP POLICY IF EXISTS "Users can view their own resumes" ON storage.objects;
  DROP POLICY IF EXISTS "Users can update their own resumes" ON storage.objects;
  DROP POLICY IF EXISTS "Users can delete their own resumes" ON storage.objects;
  
  -- Create insert policy
  CREATE POLICY "Users can upload their own resumes" ON storage.objects
    FOR INSERT
    WITH CHECK (
      bucket_id = 'resumes' AND
      (storage.foldername(name))[1] = auth.uid()::text
    );
  
  -- Create select policy
  CREATE POLICY "Users can view their own resumes" ON storage.objects
    FOR SELECT
    USING (
      bucket_id = 'resumes' AND
      (storage.foldername(name))[1] = auth.uid()::text
    );
  
  -- Create update policy
  CREATE POLICY "Users can update their own resumes" ON storage.objects
    FOR UPDATE
    USING (
      bucket_id = 'resumes' AND
      (storage.foldername(name))[1] = auth.uid()::text
    );
  
  -- Create delete policy
  CREATE POLICY "Users can delete their own resumes" ON storage.objects
    FOR DELETE
    USING (
      bucket_id = 'resumes' AND
      (storage.foldername(name))[1] = auth.uid()::text
    );
  
  RAISE NOTICE 'Resume bucket security policies configured successfully';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Execute the function to create bucket and policies
SELECT create_resume_bucket();

-- Create a helper function for the application to verify/fix policies
CREATE OR REPLACE FUNCTION public.verify_resume_bucket()
RETURNS JSONB AS $$
DECLARE
  bucket_exists BOOLEAN;
  policy_count INT;
  result JSONB;
BEGIN
  -- Check bucket existence
  SELECT EXISTS(
    SELECT 1 FROM storage.buckets WHERE name = 'resumes'
  ) INTO bucket_exists;
  
  -- Count policies
  SELECT COUNT(*) 
  FROM pg_policies 
  WHERE tablename = 'objects' 
    AND schemaname = 'storage' 
    AND policyname LIKE 'Users can % their own resumes'
  INTO policy_count;
  
  -- Create result object
  result = jsonb_build_object(
    'bucket_exists', bucket_exists,
    'policy_count', policy_count,
    'all_configured', bucket_exists AND policy_count >= 4
  );
  
  -- If issues exist, attempt to fix them
  IF NOT (bucket_exists AND policy_count >= 4) THEN
    PERFORM create_resume_bucket();
    
    -- Re-check after attempting fix
    SELECT EXISTS(
      SELECT 1 FROM storage.buckets WHERE name = 'resumes'
    ) INTO bucket_exists;
    
    SELECT COUNT(*) 
    FROM pg_policies 
    WHERE tablename = 'objects' 
      AND schemaname = 'storage' 
      AND policyname LIKE 'Users can % their own resumes'
    INTO policy_count;
    
    -- Update result
    result = jsonb_build_object(
      'bucket_exists', bucket_exists,
      'policy_count', policy_count,
      'all_configured', bucket_exists AND policy_count >= 4,
      'fix_attempted', true
    );
  END IF;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 