import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PermissionRequest {
  action: 'check_role' | 'check_ownership' | 'check_modify';
  role?: string;
  table?: string;
  resourceId?: string;
  userIdColumn?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from JWT
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const body: PermissionRequest = await req.json();

    let result = { hasPermission: false, role: null };

    switch (body.action) {
      case 'check_role': {
        if (!body.role) {
          throw new Error("Role is required for check_role action");
        }

        // Query user_roles table
        const { data: roles, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        if (error || !roles) {
          // Default to 'user' role
          result = { 
            hasPermission: body.role === 'user', 
            role: 'user' 
          };
        } else {
          const userRole = roles.role;
          const roleHierarchy: Record<string, number> = {
            user: 1,
            moderator: 2,
            admin: 3,
          };

          const hasPermission = roleHierarchy[userRole] >= roleHierarchy[body.role];
          result = { hasPermission, role: userRole };
        }
        break;
      }

      case 'check_ownership': {
        if (!body.table || !body.resourceId) {
          throw new Error("Table and resourceId are required for check_ownership action");
        }

        const userIdColumn = body.userIdColumn || 'user_id';
        const { data, error } = await supabase
          .from(body.table)
          .select(userIdColumn)
          .eq('id', body.resourceId)
          .single();

        if (error || !data) {
          result = { hasPermission: false, role: null };
        } else {
          result = { 
            hasPermission: data[userIdColumn] === user.id, 
            role: null 
          };
        }
        break;
      }

      case 'check_modify': {
        if (!body.table || !body.resourceId) {
          throw new Error("Table and resourceId are required for check_modify action");
        }

        // First check if user is admin
        const { data: roles } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        if (roles?.role === 'admin') {
          result = { hasPermission: true, role: 'admin' };
        } else {
          // Check ownership
          const userIdColumn = body.userIdColumn || 'user_id';
          const { data, error } = await supabase
            .from(body.table)
            .select(userIdColumn)
            .eq('id', body.resourceId)
            .single();

          if (error || !data) {
            result = { hasPermission: false, role: roles?.role || 'user' };
          } else {
            result = { 
              hasPermission: data[userIdColumn] === user.id, 
              role: roles?.role || 'user' 
            };
          }
        }
        break;
      }

      default:
        throw new Error("Invalid action");
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
