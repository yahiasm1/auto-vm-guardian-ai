
import { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { authApi } from '@/services/api';
import { Profile } from './types';

// Hook for API authentication methods
export const useApiAuth = () => {
  const [loading, setLoading] = useState<boolean>(false);

  // API login method
  const apiLogin = async (email: string, password: string): Promise<{ user: User; profile: Profile } | null> => {
    setLoading(true);
    try {
      const response = await authApi.login(email, password);
      
      if (response.data.accessToken) {
        localStorage.setItem('accessToken', response.data.accessToken);
        
        // Get user profile from API
        const userResponse = await authApi.getMe();
        setLoading(false);
        return {
          user: userResponse.data as unknown as User,
          profile: userResponse.data as unknown as Profile
        };
      }
      setLoading(false);
      return null;
    } catch (error) {
      console.error('API login error:', error);
      setLoading(false);
      return null;
    }
  };

  // API logout method
  const apiLogout = async (): Promise<void> => {
    try {
      await authApi.logout();
      localStorage.removeItem('accessToken');
    } catch (error) {
      console.error('API logout error:', error);
    }
  };

  return {
    loading,
    apiLogin,
    apiLogout
  };
};
