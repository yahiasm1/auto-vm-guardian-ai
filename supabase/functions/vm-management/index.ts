
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

      case "add_course_materials":
        const { title, description, date } = params;
        
        const { data: materialData, error: materialError } = await supabaseClient
          .from("documents")
          .insert({
            title,
            content: description,
            category: "course_material",
            created_at: date || new Date().toISOString()
          })
          .select()
          .single();
          
        if (materialError) throw materialError;
        
        return new Response(JSON.stringify(materialData), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
        
      case "get_course_materials":
        const { data: materials, error: materialsError } = await supabaseClient
          .from("documents")
          .select("*")
          .eq("category", "course_material")
          .order("created_at", { ascending: false });
          
        if (materialsError) throw materialsError;
        
        // Transform to match frontend expected format
        const transformedMaterials = materials.map(mat => ({
          id: mat.id,
          title: mat.title,
          description: mat.content,
          date: mat.created_at
        }));
        
        return new Response(JSON.stringify(transformedMaterials), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
        
      case "add_assignment":
        const { assignTitle, assignDescription, dueDate, course: assignCourse } = params;
        
        const { data: assignmentData, error: assignmentError } = await supabaseClient
          .from("assignments")
          .insert({
            title: assignTitle,
            description: assignDescription,
            due_date: dueDate,
            course: assignCourse || "default"
          })
          .select()
          .single();
          
        if (assignmentError) throw assignmentError;
        
        return new Response(JSON.stringify(assignmentData), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
        
      case "get_assignments":
        const { data: assignmentsData, error: assignmentsError } = await supabaseClient
          .from("assignments")
          .select("*")
          .order("due_date", { ascending: true });
          
        if (assignmentsError) throw assignmentsError;
        
        // Transform to match frontend expected format
        const transformedAssignments = assignmentsData.map(assign => ({
          id: assign.id,
          title: assign.title,
          description: assign.description,
          dueDate: assign.due_date,
          status: "pending" // Default status, you might want to add a status column in the DB
        }));
        
        return new Response(JSON.stringify(transformedAssignments), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
        
      case "seed_initial_data":
        // This action is for seeding initial data for the student portal
        // First, let's seed some VMs
        const studentVMs = [
          {
            name: "Web-Dev-Environment",
            os: "Ubuntu 20.04 LTS",
            status: "running",
            cpu: 2,
            ram: 4,
            storage: 50,
            ip: "192.168.1.120",
            user_id: params.userId,
            course: "Web Development"
          },
          {
            name: "Database-Class",
            os: "CentOS 8",
            status: "stopped",
            cpu: 4,
            ram: 8,
            storage: 100,
            ip: "192.168.1.121",
            user_id: params.userId,
            course: "Database Design"
          }
        ];
        
        const { error: vmSeedError } = await supabaseClient
          .from("virtual_machines")
          .insert(studentVMs);
          
        if (vmSeedError) throw vmSeedError;
        
        // Seed course materials
        const courseMaterials = [
          { 
            title: "Linux Fundamentals", 
            content: "Introduction to Linux commands and file system",
            category: "course_material",
            created_at: "2025-03-15"
          },
          { 
            title: "Database Design", 
            content: "Relational database concepts and SQL",
            category: "course_material",
            created_at: "2025-03-22"
          },
          { 
            title: "Web Development", 
            content: "HTML, CSS, and JavaScript basics",
            category: "course_material",
            created_at: "2025-04-02"
          }
        ];
        
        const { error: materialSeedError } = await supabaseClient
          .from("documents")
          .insert(courseMaterials);
          
        if (materialSeedError) throw materialSeedError;
        
        // Seed assignments
        const assignmentItems = [
          { 
            title: "Linux Server Setup", 
            description: "Configure a web server with Apache", 
            due_date: "2025-04-15",
            course: "System Administration" 
          },
          { 
            title: "Database Creation", 
            description: "Design and implement a database schema", 
            due_date: "2025-04-25",
            course: "Database Design" 
          }
        ];
        
        const { error: assignmentSeedError } = await supabaseClient
          .from("assignments")
          .insert(assignmentItems);
          
        if (assignmentSeedError) throw assignmentSeedError;
        
        // Return success message
        return new Response(JSON.stringify({ 
          success: true, 
          message: "Initial data seeded successfully" 
        }), {
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
