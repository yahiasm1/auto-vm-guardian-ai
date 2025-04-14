
import { authService } from '@/services/api';
import { Profile } from './types';

// Fetch user profile
export const fetchUserProfile = async (userId: string): Promise<Profile | null> => {
  try {
    console.log('Fetching profile for user:', userId);
    
    if (!userId) {
      console.error('Cannot fetch profile: No user ID provided');
      return null;
    }
    
    // In our PostgreSQL setup, the user data already includes profile info
    const userData = await authService.getCurrentUser();
    
    if (!userData) {
      console.log('No profile found for user:', userId);
      return null;
    }

    // Map the user data to our Profile interface
    const profile: Profile = {
      id: userData.id,
      full_name: userData.name,
      role: userData.role as 'admin' | 'instructor' | 'student',
      department: userData.department || null,
      status: userData.status as 'active' | 'inactive' | 'suspended' | 'pending',
      email: userData.email,
      last_active: userData.last_active || '',
      created_at: userData.created_at || '',
    };

    console.log('Profile fetched successfully:', profile);
    return profile;
  } catch (error) {
    console.error('Exception in fetchUserProfile:', error);
    return null;
  }
};

// Create or update user profile
export const createOrUpdateProfile = async (profile: Partial<Profile> & { id: string }): Promise<Profile | null> => {
  try {
    console.log('Creating/updating profile:', profile);
    
    if (!profile.id) {
      console.error('Cannot update profile: No user ID provided');
      return null;
    }
    
    // With our PostgreSQL setup, profile updates would be handled by
    // a dedicated API endpoint which we don't have yet.
    // For now, we'll just return the current profile from auth service
    const userData = await authService.getCurrentUser();
    
    if (!userData) {
      return null;
    }
    
    // Map the user data to our Profile interface
    const updatedProfile: Profile = {
      id: userData.id,
      full_name: userData.name,
      role: userData.role as 'admin' | 'instructor' | 'student',
      department: userData.department || null,
      status: userData.status as 'active' | 'inactive' | 'suspended' | 'pending',
      email: userData.email,
      last_active: userData.last_active || '',
      created_at: userData.created_at || '',
    };
    
    console.log('Profile data:', updatedProfile);
    return updatedProfile;
  } catch (error) {
    console.error('Exception in createOrUpdateProfile:', error);
    return null;
  }
};
