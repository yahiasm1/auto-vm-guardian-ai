
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

// Supabase client setup
const supabaseUrl = "https://ezbqycpminkkqasrvvij.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6YnF5Y3BtaW5ra3Fhc3J2dmlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ0MDI5MzgsImV4cCI6MjA1OTk3ODkzOH0.wbCCHIaWwSTY2-mxCcgpUfCysZmaKIc6YbmBfRvIAic";

// Create a service role key (to be used ONLY in edge functions)
// Changed from process.env to use import.meta.env for Vite compatibility
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || "";

// Create supabase client with proper persistence settings
export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});

// Export the anon key separately for direct API calls
export const supabaseAnonKey = supabaseKey;

// Function to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return Boolean(supabaseUrl) && Boolean(supabaseKey);
};

// Helper function to create an admin client (only used in edge functions)
export const createAdminClient = () => {
  if (!supabaseServiceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for admin operations');
  }
  return createClient<Database>(supabaseUrl, supabaseServiceKey);
};
