
import { supabase } from '@/integrations/supabase/client';

/**
 * Utility to verify that all required tables exist in the Supabase database
 */
export const verifyDatabaseTables = async (): Promise<{
  success: boolean;
  message: string;
  existingTables: string[];
  missingTables: string[];
}> => {
  const requiredTables = ['users', 'virtual_machines', 'resources', 'documents', 'assignments'];
  const existingTables: string[] = [];
  const missingTables: string[] = [];
  
  try {
    // Check each table individually instead of querying pg_catalog
    for (const tableName of requiredTables) {
      try {
        // Try to get the count of rows from each table
        // This will fail if the table doesn't exist
        const { count, error } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true });
          
        if (!error) {
          existingTables.push(tableName);
        } else {
          missingTables.push(tableName);
        }
      } catch (tableError) {
        missingTables.push(tableName);
      }
    }
    
    return {
      success: missingTables.length === 0,
      message: missingTables.length === 0 
        ? 'All required database tables exist' 
        : `Missing tables: ${missingTables.join(', ')}`,
      existingTables,
      missingTables
    };
  } catch (error) {
    console.error('Error verifying database tables:', error);
    return {
      success: false,
      message: `Error verifying database tables: ${error instanceof Error ? error.message : String(error)}`,
      existingTables: [],
      missingTables: requiredTables
    };
  }
};

/**
 * Checks if a user exists in the database
 */
export const checkUserExists = async (email: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();
      
    if (error && error.code !== 'PGRST116') { // PGRST116 is "row not found"
      console.error('Error checking if user exists:', error);
    }
    
    return !!data;
  } catch (error) {
    console.error('Error checking if user exists:', error);
    return false;
  }
};

/**
 * Initializes a seed admin user if no users exist in the database
 */
export const initializeAdminUser = async (): Promise<boolean> => {
  try {
    // Check if any users exist
    const { count, error: countError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });
      
    if (countError) throw countError;
    
    // If there are no users, create an admin user
    if (count === 0) {
      // First create the authentication user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: 'admin@example.com',
        password: 'AdminPassword123!',
        options: {
          data: {
            name: 'System Administrator',
            role: 'admin'
          }
        }
      });
      
      if (authError) throw authError;
      
      if (authData.user) {
        // Then create the user record in our users table
        const { error: insertError } = await supabase.from('users').insert({
          id: authData.user.id,
          email: 'admin@example.com',
          name: 'System Administrator',
          role: 'admin',
          department: 'IT',
          status: 'active',
          last_active: new Date().toISOString(),
          created_at: new Date().toISOString()
        });
        
        if (insertError) throw insertError;
        
        console.log('Created default admin user');
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error initializing admin user:', error);
    return false;
  }
};
