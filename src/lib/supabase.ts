
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

// Supabase client setup with hardcoded values for this example
// In production, you should use environment variables
const supabaseUrl = "https://ezbqycpminkkqasrvvij.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6YnF5Y3BtaW5ra3Fhc3J2dmlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ0MDI5MzgsImV4cCI6MjA1OTk3ODkzOH0.wbCCHIaWwSTY2-mxCcgpUfCysZmaKIc6YbmBfRvIAic";

// Create supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseKey);

// Function to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return true; // Since we're using hardcoded values, this will always return true
};
