-- Add generated column for full text search
ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS fts tsvector GENERATED ALWAYS AS (
  setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
  setweight(to_tsvector('english', coalesce(description, '')), 'B') ||
  setweight(to_tsvector('english', coalesce(location, '')), 'C') ||
  setweight(to_tsvector('english', coalesce(job_type, '')), 'C') ||
  setweight(to_tsvector('english', coalesce(wage_type, '')), 'D')
) STORED;

-- Create index for full text search
CREATE INDEX IF NOT EXISTS job_fts_idx ON "Job" USING GIN (fts);

-- Add RLS policy for the new column
ALTER TABLE "Job" ENABLE ROW LEVEL SECURITY;
