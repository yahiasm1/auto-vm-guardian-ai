
import { supabase } from '@/integrations/supabase/client';

// This script can be run to create a default admin user
// It's useful for initial setup or development purposes
// Note: In production, you should create admin users through a secure process

export const createDefaultAdmin = async () => {
  try {
    // Check if the admin user already exists
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'admin')
      .limit(1);
    
    if (existingUser && existingUser.length > 0) {
      console.log('Admin user already exists');
      return;
    }
    
    // Create admin user
    const { data, error } = await supabase.auth.signUp({
      email: 'admin@example.com',
      password: 'admin123',
      options: {
        data: {
          full_name: 'Admin User',
          role: 'admin',
        }
      }
    });
    
    if (error) {
      throw error;
    }
    
    console.log('Admin user created successfully');
    return data;
  } catch (error) {
    console.error('Error creating admin user:', error);
    throw error;
  }
};
