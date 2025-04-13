
import { User, Session } from '@supabase/supabase-js';

// Define user types
export interface Profile {
  id: string;
  full_name: string;
  role: 'admin' | 'instructor' | 'student';
  department: string | null;
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  email: string | null;
  last_active: string;
  created_at: string;
}

// Define authentication context type
export interface AuthContextProps {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string, fullName: string, role: string, department: string) => Promise<void>;
  signInWithOAuth: (provider: string) => Promise<void>;
}
