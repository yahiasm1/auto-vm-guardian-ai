
export interface User {
  id: string;
  email: string;
  role: 'admin' | 'instructor' | 'student';
  email_verified: boolean;
  created_at: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  department: string;
  position: string;
  role: 'admin' | 'instructor' | 'student';
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<User>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<User>;
  updateProfile: (data: Partial<UserProfile>) => Promise<UserProfile>;
}
