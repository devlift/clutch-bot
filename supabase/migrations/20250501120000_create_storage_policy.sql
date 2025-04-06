-- Create Row Level Security (RLS) policies for the resumes storage bucket
-- This ensures users can only access their own files

-- Enable RLS on the storage.objects table for the resumes bucket
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to insert their own files
CREATE POLICY "Users can upload their own resumes" ON storage.objects
    FOR INSERT
    WITH CHECK (
        bucket_id = 'resumes' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );

-- Create policy to allow users to select only their own files
CREATE POLICY "Users can view their own resumes" ON storage.objects
    FOR SELECT
    USING (
        bucket_id = 'resumes' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );

-- Create policy to allow users to update only their own files
CREATE POLICY "Users can update their own resumes" ON storage.objects
    FOR UPDATE
    USING (
        bucket_id = 'resumes' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );

-- Create policy to allow users to delete only their own files
CREATE POLICY "Users can delete their own resumes" ON storage.objects
    FOR DELETE
    USING (
        bucket_id = 'resumes' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );

-- Add a separate policy for authenticated admins (optional)
-- CREATE POLICY "Admins can access all resumes" ON storage.objects
--     USING (
--         bucket_id = 'resumes' AND
--         auth.role() = 'authenticated' AND
--         auth.uid() IN (SELECT id FROM public."User" WHERE is_admin = true)
--     );

-- Grant usage on necessary schemas (if needed)
GRANT USAGE ON SCHEMA storage TO service_role, anon, authenticated; 