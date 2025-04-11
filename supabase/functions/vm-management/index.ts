
// Follow imports from the existing file
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
      case "list":
        // Return all VMs (admin only)
        const { data: allVMs, error: listError } = await supabaseClient
          .from("virtual_machines")
          .select("*")
          .order("created_at", { ascending: false });
          
        if (listError) throw listError;
        return new Response(JSON.stringify(allVMs), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
        
      case "get_user_vms":
        // Get VMs for a specific user (using service role to bypass RLS)
        const { userId } = params;
        if (!userId) {
          return new Response(JSON.stringify({ error: "User ID is required" }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
          });
        }
        
        const { data: userVMs, error: userVMsError } = await supabaseClient
          .from("virtual_machines")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });
          
        if (userVMsError) throw userVMsError;
        return new Response(JSON.stringify(userVMs), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      
      case "start":
        // Start a VM
        const { id: startId } = params;
        const { data: startData, error: startError } = await supabaseClient
          .from("virtual_machines")
          .update({ status: "running", last_updated: new Date().toISOString() })
          .eq("id", startId)
          .select()
          .single();
          
        if (startError) throw startError;
        return new Response(JSON.stringify(startData), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      
      case "stop":
        const { id: stopId } = params;
        const { data: stopData, error: stopError } = await supabaseClient
          .from("virtual_machines")
          .update({ status: "stopped", last_updated: new Date().toISOString() })
          .eq("id", stopId)
          .select()
          .single();
          
        if (stopError) throw stopError;
        return new Response(JSON.stringify(stopData), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      
      case "suspend":
        const { id: suspendId } = params;
        const { data: suspendData, error: suspendError } = await supabaseClient
          .from("virtual_machines")
          .update({ status: "suspended", last_updated: new Date().toISOString() })
          .eq("id", suspendId)
          .select()
          .single();
          
        if (suspendError) throw suspendError;
        return new Response(JSON.stringify(suspendData), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      
      case "delete":
        const { id: deleteId } = params;
        const { error: deleteError } = await supabaseClient
          .from("virtual_machines")
          .delete()
          .eq("id", deleteId);
          
        if (deleteError) throw deleteError;
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      
      case "create":
        const { name, os, cpu, ram, storage, user_id, course } = params;
        const { data: createData, error: createError } = await supabaseClient
          .from("virtual_machines")
          .insert({
            name,
            os,
            cpu,
            ram,
            storage,
            user_id,
            course,
            status: "creating"
          })
          .select()
          .single();
          
        if (createError) throw createError;
        
        // Simulate VM creation process (in real world, this would be handled by a separate service)
        setTimeout(async () => {
          const ip = `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
          await supabaseClient
            .from("virtual_machines")
            .update({ 
              status: "stopped", 
              ip,
              last_updated: new Date().toISOString() 
            })
            .eq("id", createData.id);
        }, 5000);
        
        return new Response(JSON.stringify(createData), {
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
