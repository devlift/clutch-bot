-- Create a function to ensure Candidate table has resume columns
CREATE OR REPLACE FUNCTION public.ensure_candidate_resume_columns()
RETURNS JSONB AS $$
DECLARE
  has_resume_column BOOLEAN;
  has_pending_column BOOLEAN;
  has_original_name_column BOOLEAN;
  has_file_type_column BOOLEAN;
  has_file_size_column BOOLEAN;
  columns_added INT := 0;
  result JSONB;
BEGIN
  -- Check if columns exist
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public'
      AND table_name = 'Candidate'
      AND column_name = 'resume'
  ) INTO has_resume_column;
  
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public'
      AND table_name = 'Candidate'
      AND column_name = 'pendingResume'
  ) INTO has_pending_column;
  
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public'
      AND table_name = 'Candidate'
      AND column_name = 'resumeOriginalName'
  ) INTO has_original_name_column;
  
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public'
      AND table_name = 'Candidate'
      AND column_name = 'resumeFileType'
  ) INTO has_file_type_column;
  
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public'
      AND table_name = 'Candidate'
      AND column_name = 'resumeFileSize'
  ) INTO has_file_size_column;
  
  -- Add columns if they don't exist
  IF NOT has_resume_column THEN
    ALTER TABLE "Candidate" ADD COLUMN "resume" TEXT;
    columns_added := columns_added + 1;
  END IF;
  
  IF NOT has_pending_column THEN
    ALTER TABLE "Candidate" ADD COLUMN "pendingResume" BOOLEAN DEFAULT FALSE;
    columns_added := columns_added + 1;
  END IF;
  
  IF NOT has_original_name_column THEN
    ALTER TABLE "Candidate" ADD COLUMN "resumeOriginalName" TEXT;
    columns_added := columns_added + 1;
  END IF;
  
  IF NOT has_file_type_column THEN
    ALTER TABLE "Candidate" ADD COLUMN "resumeFileType" TEXT;
    columns_added := columns_added + 1;
  END IF;
  
  IF NOT has_file_size_column THEN
    ALTER TABLE "Candidate" ADD COLUMN "resumeFileSize" INTEGER;
    columns_added := columns_added + 1;
  END IF;
  
  -- Create result JSON
  result := jsonb_build_object(
    'has_resume_column', has_resume_column,
    'has_pending_column', has_pending_column,
    'has_original_name_column', has_original_name_column, 
    'has_file_type_column', has_file_type_column,
    'has_file_size_column', has_file_size_column,
    'columns_added', columns_added,
    'success', TRUE
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 