
import { Session, User, Provider } from '@supabase/supabase-js';

export interface Notification {
  id: string;
  user_id: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  read: boolean;
  created_at: string;
}

export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  supabaseConfigured: boolean;
  notifications: Notification[];
}

export interface AuthContextProps extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string, name: string, role: string, department: string) => Promise<void>;
  signInWithOAuth: (provider: Provider) => Promise<void>;
  markNotificationAsRead: (id: string) => Promise<void>;
}
