
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
  user: any | null;
  profile: Profile | null;
  session: null; // We don't use sessions in our PostgreSQL setup
  loading: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string, fullName: string, role: string, department: string) => Promise<any>;
  signInWithOAuth: (provider: string) => Promise<void>;
}
