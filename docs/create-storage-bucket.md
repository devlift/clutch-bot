# Creating the Resumes Storage Bucket

The registration system requires a storage bucket named `resumes` to store candidate resume files. You must create this bucket before users can register with resume uploads.

## Option 1: Creating the Bucket via Supabase Dashboard (Recommended)

1. Go to your [Supabase project dashboard](https://supabase.com/dashboard/project/_/storage/buckets)
2. Navigate to Storage in the left sidebar
3. Click "New Bucket"
4. Enter the name: `resumes` (all lowercase)
5. Disable "Public bucket" (uncheck the box)
6. Set file size limit if desired (e.g., 10MB)
7. Click "Create bucket"

## Option 2: Creating the Bucket via Supabase CLI

If you prefer using the CLI, follow these steps:

### 1. Install the Supabase CLI (if not already installed)

```bash
# npm
npm install -g supabase

# or yarn
yarn global add supabase
```

### 2. Login to Supabase

```bash
supabase login
```

Follow the prompts to authenticate your CLI.

### 3. Link Your Project

```bash
# In your project directory
supabase link --project-ref YOUR_PROJECT_REF
```

Replace `YOUR_PROJECT_REF` with your Supabase project reference ID. You can find this in your project's dashboard URL: `https://supabase.com/dashboard/project/YOUR_PROJECT_REF`

### 4. Create the Storage Bucket

```bash
# Create a private bucket named 'resumes'
supabase storage create bucket resumes --public=false
```

Or to create it with file size limits:

```bash
supabase storage create bucket resumes --public=false --file-size-limit 10485760
```

## Setting up RLS Policies

After creating the bucket, you need to set up Row Level Security policies to ensure users can only access their own files. Run the following SQL in the SQL Editor:

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

## Troubleshooting

If you're seeing a "Bucket not found" error, it means the bucket hasn't been created or your application doesn't have permission to access it. Double-check:

1. The bucket name is exactly `resumes` (all lowercase)
2. Your application has the correct Supabase credentials
3. The bucket has appropriate RLS policies
4. Your Supabase project has storage enabled 