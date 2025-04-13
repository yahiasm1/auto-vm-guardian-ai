
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define user types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'instructor' | 'student' | 'guest';
  department: string;
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  last_active: string;
  created_at: string;
}

// Mock notification type
export interface Notification {
  id: string;
  user_id: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  read: boolean;
  created_at: string;
}

// Predefined mock users
const mockUsers: Record<string, User> = {
  'admin@example.com': {
    id: 'admin-id-123',
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'admin',
    department: 'IT',
    status: 'active',
    last_active: new Date().toISOString(),
    created_at: '2025-01-01T00:00:00Z'
  },
  'student@example.com': {
    id: 'student-id-456',
    email: 'student@example.com',
    name: 'Student User',
    role: 'student',
    department: 'Computer Science',
    status: 'active',
    last_active: new Date().toISOString(),
    created_at: '2025-01-15T00:00:00Z'
  },
  'instructor@example.com': {
    id: 'instructor-id-789',
    email: 'instructor@example.com',
    name: 'Instructor User',
    role: 'instructor',
    department: 'Electrical Engineering',
    status: 'active',
    last_active: new Date().toISOString(),
    created_at: '2025-01-10T00:00:00Z'
  }
};

// Mock notifications
const mockNotifications: Notification[] = [
  {
    id: 'notif-1',
    user_id: 'admin-id-123',
    message: 'Welcome to the VM Management System',
    type: 'info',
    read: false,
    created_at: new Date().toISOString()
  },
  {
    id: 'notif-2',
    user_id: 'admin-id-123',
    message: 'New user registration',
    type: 'info',
    read: false,
    created_at: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'notif-3',
    user_id: 'student-id-456',
    message: 'Assignment due tomorrow',
    type: 'warning',
    read: false,
    created_at: new Date(Date.now() - 7200000).toISOString()
  }
];

// Define authentication context type
interface AuthContextProps {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string, name: string, role: string, department: string) => Promise<void>;
  signInWithOAuth: (provider: string) => Promise<void>;
  notifications: Notification[];
  markNotificationAsRead: (id: string) => Promise<void>;
}

// Create authentication context
const AuthContext = createContext<AuthContextProps | undefined>(undefined);

// Local storage key for storing the current user
const STORAGE_KEY = 'vm_management_user';

// User provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Load user from local storage on initialization
  useEffect(() => {
    const storedUser = localStorage.getItem(STORAGE_KEY);
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        
        // Load notifications for the user
        const userNotifications = mockNotifications.filter(n => n.user_id === parsedUser.id);
        setNotifications(userNotifications);
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setLoading(false);
  }, []);

  // Sign in function
  const signIn = async (email: string, password: string) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Check if user exists in mock data (password is ignored in this mock)
    const mockUser = mockUsers[email.toLowerCase()];
    if (mockUser) {
      setUser(mockUser);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mockUser));
      
      // Load notifications for the user
      const userNotifications = mockNotifications.filter(n => n.user_id === mockUser.id);
      setNotifications(userNotifications);
      
      return;
    }
    
    throw new Error('Invalid email or password');
  };

  // Sign out function
  const signOut = async () => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setUser(null);
    setNotifications([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  // Sign up function
  const signUp = async (email: string, password: string, name: string, role: string, department: string) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if email already exists
    if (mockUsers[email.toLowerCase()]) {
      throw new Error('Email already in use');
    }
    
    // Create new user
    const newUser: User = {
      id: `user-${Date.now()}-${Math.round(Math.random() * 1000)}`,
      email: email.toLowerCase(),
      name,
      role: role as 'admin' | 'instructor' | 'student' | 'guest',
      department,
      status: 'pending',
      last_active: new Date().toISOString(),
      created_at: new Date().toISOString()
    };
    
    // Add to mock users (would be stored in database in real app)
    mockUsers[email.toLowerCase()] = newUser;
    
    // Don't automatically sign in after registration
    return;
  };

  // OAuth sign in
  const signInWithOAuth = async (provider: string) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock implementation - always sign in as student for demo purposes
    const mockUser = mockUsers['student@example.com'];
    setUser(mockUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockUser));
    
    // Load notifications for the user
    const userNotifications = mockNotifications.filter(n => n.user_id === mockUser.id);
    setNotifications(userNotifications);
  };

  // Mark notification as read
  const markNotificationAsRead = async (id: string) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      signIn,
      signOut,
      signUp,
      signInWithOAuth,
      notifications,
      markNotificationAsRead
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
