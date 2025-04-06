-- Add userId column to Employer table if it doesn't exist
DO $$
BEGIN
  -- Check for existing column (both camelCase and with quotes)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'Employer' 
    AND (column_name = 'userId' OR column_name = 'userid')
  ) THEN
    -- Add the userId column using camelCase to match existing schema
    ALTER TABLE public."Employer" ADD COLUMN "userId" UUID;
    
    -- Create an index for better performance
    CREATE INDEX IF NOT EXISTS employer_userId_idx ON public."Employer" ("userId");
    
    -- Update existing rows to set userId equal to id
    UPDATE public."Employer" SET "userId" = id;
  END IF;
END $$; 