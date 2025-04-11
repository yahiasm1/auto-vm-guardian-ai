
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );
    
    const { action, ...params } = await req.json();
    
    // Handle different actions
    switch (action) {
      case "send":
        // Send a notification to a user
        const { userId, message, type = 'info' } = params;
        
        if (!userId || !message) {
          return new Response(JSON.stringify({ error: "Missing required parameters" }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
          });
        }
        
        const { data: notificationData, error: notificationError } = await supabaseClient
          .from("notifications")
          .insert({
            user_id: userId,
            message,
            type,
            read: false
          })
          .select()
          .single();
          
        if (notificationError) throw notificationError;
        
        return new Response(JSON.stringify(notificationData), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      
      case "mark_read":
        // Mark a notification as read
        const { id } = params;
        
        if (!id) {
          return new Response(JSON.stringify({ error: "Missing notification ID" }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
          });
        }
        
        const { data: updatedNotification, error: updateError } = await supabaseClient
          .from("notifications")
          .update({ read: true })
          .eq("id", id)
          .select()
          .single();
          
        if (updateError) throw updateError;
        
        return new Response(JSON.stringify(updatedNotification), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
        
      case "list":
        // Get notifications for a user
        const { user_id, limit = 20 } = params;
        
        if (!user_id) {
          return new Response(JSON.stringify({ error: "Missing user ID" }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
          });
        }
        
        const { data: notifications, error: listError } = await supabaseClient
          .from("notifications")
          .select("*")
          .eq("user_id", user_id)
          .order("created_at", { ascending: false })
          .limit(limit);
          
        if (listError) throw listError;
        
        return new Response(JSON.stringify(notifications), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
        
      case "mark_all_read":
        // Mark all notifications as read for a user
        const { userIdForAll } = params;
        
        if (!userIdForAll) {
          return new Response(JSON.stringify({ error: "Missing user ID" }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
          });
        }
        
        const { data: markedAllRead, error: markAllError } = await supabaseClient
          .from("notifications")
          .update({ read: true })
          .eq("user_id", userIdForAll)
          .eq("read", false)
          .select();
          
        if (markAllError) throw markAllError;
        
        return new Response(JSON.stringify(markedAllRead), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
        
      default:
        return new Response(JSON.stringify({ error: "Invalid action" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        });
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
