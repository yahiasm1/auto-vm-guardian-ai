
import { type User } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  department?: string;
  role: 'admin' | 'instructor' | 'student';
  created_at?: string;
  last_active?: string;
  status?: string;
}

export interface AuthContextProps {
  user: User | null;
  profile: UserProfile | null;
  session: any | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string, fullName: string, role: string, department?: string) => Promise<any>;
  signInWithOAuth: (provider: string) => Promise<void>;
}
