# Clutch Jobs

AI-Powered Job Search & Hiring Platform

## Storage Setup for Resume Uploads

The registration system requires a storage bucket named `resumes` for candidate resume uploads. This can be set up in two ways:

### Option 1: Run the SQL Migrations (Recommended)

This is the most complete solution that sets up the entire system automatically:

1. Go to your Supabase SQL Editor
2. Run the following migrations in order:

   a. First create the storage bucket and RLS policies:
   ```sql
   -- Copy contents from: supabase/migrations/20250501000001_create_resume_bucket.sql
   ```

   b. Then add the necessary columns to the Candidate table:
   ```sql
   -- Copy contents from: supabase/migrations/20250501000002_update_candidate_table.sql
   ```

   c. Finally, create the helper function for verifying and fixing the setup:
   ```sql
   -- Copy contents from: supabase/migrations/20250501000003_create_ensure_columns_function.sql
   ```

3. Test that everything is set up correctly by running:
   ```sql
   SELECT * FROM verify_resume_bucket();
   SELECT * FROM ensure_candidate_resume_columns();
   ```

### Option 2: Manual Setup

If you prefer to set things up manually:

1. Create the resumes bucket:
   - Go to Supabase Dashboard → Storage
   - Click "New Bucket"
   - Name: `resumes` (must be exact, lowercase)
   - Public: OFF

2. Add required columns to the Candidate table:
   - Go to Supabase Dashboard → Table Editor
   - Select the "Candidate" table
   - Add the following columns:
     - `resume` (type: text)
     - `pendingResume` (type: boolean, default: false)
     - `resumeOriginalName` (type: text)
     - `resumeFileType` (type: text)
     - `resumeFileSize` (type: integer)

3. Set up RLS policies for the storage bucket:
   - Go to SQL Editor
   - Run the RLS policies provided in `supabase/migrations/20250501000001_create_resume_bucket.sql`

## Deploying the Application

[Add deployment instructions here]

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
