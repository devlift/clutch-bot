import { supabase } from './supabase';

/**
 * Verify and initialize Supabase storage
 * This function checks if the resume bucket is set up correctly
 * and attempts to fix it if not.
 */
export async function verifyStorage(): Promise<boolean> {
  try {
    // Check if the verify_resume_bucket function exists by calling it
    const { data, error } = await supabase.rpc('verify_resume_bucket');
    
    if (error) {
      console.error('Error verifying storage configuration:', error);
      
      // Fallback: Try to list buckets and see if 'resumes' exists
      const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
      
      if (bucketError) {
        console.error('Could not list buckets:', bucketError);
        return false;
      }
      
      const bucketExists = buckets?.some(bucket => bucket.name === 'resumes');
      if (!bucketExists) {
        console.warn('Resumes bucket not found. Resume uploads will fail until the bucket is created.');
        return false;
      }
      
      return true;
    }
    
    console.log('Storage verification result:', data);
    
    if (data.all_configured) {
      console.log('Storage configuration is complete.');
      return true;
    } else {
      console.warn('Storage configuration is incomplete:', data);
      
      if (data.fix_attempted) {
        console.log('Attempted to fix configuration, but issues remain.');
      } else {
        console.log('No fix was attempted. Run the migration to complete setup.');
      }
      
      return false;
    }
  } catch (err) {
    console.error('Unexpected error verifying storage:', err);
    return false;
  }
} 