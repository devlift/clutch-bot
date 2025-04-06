# Setting Up Secure Storage for Resumes

This guide explains how to set up secure storage for resumes in your Supabase project, ensuring that users can only access their own files.

## 1. Create the "resumes" Storage Bucket

You'll need to create a storage bucket in Supabase for storing resume files:

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to "Storage" in the sidebar
4. Click "New Bucket"
5. Enter name: `resumes`
6. Turn OFF "Public bucket" (unless you specifically want resumes to be publicly accessible)
7. Set file size limit if desired (recommended: 10MB)
8. Click "Create bucket"

## 2. Set Up Row Level Security (RLS) Policies

To ensure users can only access their own files, run the following SQL in the SQL Editor:

```sql
-- Enable RLS on the storage.objects table
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
```

These policies ensure that users can only access files in folders that match their user ID.

## 3. File Structure

In our application code, we store files with this structure:
```
resumes/
├── user123/
│   ├── 1612345678_resume.pdf
│   └── 1698765432_resume.docx
├── user456/
│   └── 1687654321_resume.pdf
```

This means:
- Each user has their own folder named with their user ID
- All files within that folder can only be accessed by that user
- The RLS policies enforce this security at the database level

## 4. Testing Security

To confirm your setup is secure:

1. Create two test users
2. Upload a resume file for each user
3. Sign in as the first user and try to access the second user's file - it should be denied
4. Sign in as the second user and try to access the first user's file - it should also be denied

If you have debugging or admin needs, you can add a policy for admins:

```sql
-- Add a separate policy for authenticated admins
CREATE POLICY "Admins can access all resumes" ON storage.objects
    USING (
        bucket_id = 'resumes' AND
        auth.role() = 'authenticated' AND
        auth.uid() IN (SELECT id FROM public."User" WHERE is_admin = true)
    );
```

This setup ensures that resume files are securely stored and can only be accessed by their owners. 