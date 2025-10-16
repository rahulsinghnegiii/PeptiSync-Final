import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Shield, ShieldOff } from "lucide-react";

interface User {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string | null;
  membership_tier: string;
  created_at: string;
  roles?: string[];
}

export const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (profiles) {
      const usersWithRoles = await Promise.all(
        profiles.map(async (profile) => {
          const { data: roles } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", profile.user_id);
          
          return {
            ...profile,
            roles: roles?.map(r => r.role) || []
          };
        })
      );
      
      setUsers(usersWithRoles);
    }
    setLoading(false);
  };

  const toggleAdminRole = async (userId: string, hasAdmin: boolean) => {
    if (hasAdmin) {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId)
        .eq("role", "admin");
      
      if (error) {
        toast.error("Failed to remove admin role");
      } else {
        toast.success("Admin role removed");
        fetchUsers();
      }
    } else {
      const { error } = await supabase
        .from("user_roles")
        .insert({ user_id: userId, role: "admin" });
      
      if (error) {
        toast.error("Failed to grant admin role");
      } else {
        toast.success("Admin role granted");
        fetchUsers();
      }
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading users...</div>;
  }

  return (
    <Card className="glass border-glass-border">
      <CardHeader>
        <CardTitle>User Management</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Membership</TableHead>
              <TableHead>Roles</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => {
              const hasAdmin = user.roles?.includes("admin");
              return (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.full_name || "N/A"}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="capitalize">
                      {user.membership_tier}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.roles && user.roles.length > 0 ? (
                      <div className="flex gap-1">
                        {user.roles.map(role => (
                          <Badge key={role} variant="outline" className="capitalize">
                            {role}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">No roles</span>
                    )}
                  </TableCell>
                  <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant={hasAdmin ? "destructive" : "outline"}
                      onClick={() => toggleAdminRole(user.user_id, hasAdmin)}
                    >
                      {hasAdmin ? (
                        <>
                          <ShieldOff className="w-4 h-4 mr-2" />
                          Remove Admin
                        </>
                      ) : (
                        <>
                          <Shield className="w-4 h-4 mr-2" />
                          Make Admin
                        </>
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
