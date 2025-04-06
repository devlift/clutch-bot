-- Add resume metadata columns to the Candidate table
ALTER TABLE "Candidate" ADD COLUMN IF NOT EXISTS "resume" TEXT;
ALTER TABLE "Candidate" ADD COLUMN IF NOT EXISTS "pendingResume" BOOLEAN DEFAULT FALSE;
ALTER TABLE "Candidate" ADD COLUMN IF NOT EXISTS "resumeOriginalName" TEXT;
ALTER TABLE "Candidate" ADD COLUMN IF NOT EXISTS "resumeFileType" TEXT;
ALTER TABLE "Candidate" ADD COLUMN IF NOT EXISTS "resumeFileSize" INTEGER;

-- Comment on columns
COMMENT ON COLUMN "Candidate"."resume" IS 'Path to the resume file in storage';
COMMENT ON COLUMN "Candidate"."pendingResume" IS 'Flag indicating if a resume upload is pending due to missing bucket';
COMMENT ON COLUMN "Candidate"."resumeOriginalName" IS 'Original filename of the uploaded resume';
COMMENT ON COLUMN "Candidate"."resumeFileType" IS 'MIME type of the resume file';
COMMENT ON COLUMN "Candidate"."resumeFileSize" IS 'Size of the resume file in bytes'; 