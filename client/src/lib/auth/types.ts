
export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  department?: string;
  status?: string;
  last_active?: string;
  created_at?: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string, name: string, role: string, department?: string) => Promise<any>;
}
