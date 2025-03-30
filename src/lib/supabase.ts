import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dffumssdszdgrunctwcv.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmZnVtc3Nkc3pkZ3J1bmN0d2N2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMzNTM4MTMsImV4cCI6MjA1ODkyOTgxM30.97dUw-LFa3Rd9u44_PGOv5v85ZvTvaWOVRbqhJxtLf4'

export const supabase = createClient(supabaseUrl, supabaseKey) 