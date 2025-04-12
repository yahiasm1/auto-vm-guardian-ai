
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get the supabase admin client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required");
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // First get existing dummy users from the users table
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*');
    
    if (usersError) {
      throw usersError;
    }
    
    // Create auth users for each dummy user
    const results = [];
    const defaultPassword = "password123"; // Simple default password for demo users
    
    for (const user of users) {
      try {
        // Check if user already exists in auth
        const { data: authUser } = await supabase
          .auth.admin.listUsers({
            filters: {
              email: user.email
            }
          });
        
        // Skip if user already exists
        if (authUser && authUser.users && authUser.users.length > 0) {
          results.push({
            email: user.email,
            status: "already_exists"
          });
          continue;
        }
        
        // Create the auth user
        const { data, error } = await supabase.auth.admin.createUser({
          email: user.email,
          password: defaultPassword,
          email_confirm: true, // Skip email verification
          user_metadata: {
            name: user.name,
            role: user.role,
            department: user.department
          }
        });
        
        if (error) {
          results.push({
            email: user.email,
            status: "error",
            message: error.message
          });
        } else {
          results.push({
            email: user.email,
            status: "created"
          });
        }
      } catch (error) {
        results.push({
          email: user.email,
          status: "error",
          message: error.message
        });
      }
    }
    
    return new Response(JSON.stringify({ 
      message: "Dummy users created",
      results 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
