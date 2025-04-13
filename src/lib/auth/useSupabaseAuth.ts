
import { supabase } from '@/integrations/supabase/client';
import { Profile } from './types';

// Fetch user profile
export const fetchUserProfile = async (userId: string): Promise<Profile | null> => {
  try {
    console.log('Fetching profile for user:', userId);
    
    if (!userId) {
      console.error('Cannot fetch profile: No user ID provided');
      return null;
    }
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle(); // Using maybeSingle instead of single to handle cases where profile doesn't exist yet

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }

    if (!data) {
      console.log('No profile found for user:', userId);
      return null;
    }

    console.log('Profile fetched successfully:', data);
    return data as Profile;
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
    
    const { data, error } = await supabase
      .from('profiles')
      .upsert(profile)
      .select('*')
      .maybeSingle();

    if (error) {
      console.error('Error creating/updating profile:', error);
      return null;
    }

    console.log('Profile created/updated successfully:', data);
    return data as Profile;
  } catch (error) {
    console.error('Exception in createOrUpdateProfile:', error);
    return null;
  }
};
