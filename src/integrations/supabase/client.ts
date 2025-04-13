
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://qqkgvdlzpootyqzfvsuz.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxa2d2ZGx6cG9vdHlxemZ2c3V6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ1Njc1ODMsImV4cCI6MjA2MDE0MzU4M30.9g_du7dxYu1jPA5B6pAdVkpYruVocVr6AkRKWP1HsD4";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
