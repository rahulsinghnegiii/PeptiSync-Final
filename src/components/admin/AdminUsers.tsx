import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, updateDoc, query, orderBy } from "firebase/firestore";
import { COLLECTIONS } from "@/lib/firestoreHelpers";
import { toast } from "sonner";
import { Shield, ShieldOff, UserCog } from "lucide-react";

const UserAvatar = ({ photoUrl, name, email }: { photoUrl?: string; name: string; email: string }) => {
  const getInitials = (displayName: string, userEmail: string) => {
    if (displayName && displayName !== userEmail.split('@')[0]) {
      return displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return userEmail.slice(0, 2).toUpperCase();
  };

  const getColorFromString = (str: string) => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500',
      'bg-yellow-500', 'bg-indigo-500', 'bg-red-500', 'bg-teal-500'
    ];
    const index = str.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const initials = getInitials(name, email);
  const bgColor = getColorFromString(email);

  if (photoUrl) {
    return (
      <div className="relative w-8 h-8">
        <img
          src={photoUrl}
          alt={name}
          className="w-8 h-8 rounded-full object-cover"
          onError={(e) => {
            // Fallback to initials if image fails to load
            e.currentTarget.style.display = 'none';
            const fallback = e.currentTarget.nextElementSibling as HTMLElement;
            if (fallback) {
              fallback.classList.remove('hidden');
            }
          }}
        />
        <div className={`hidden w-8 h-8 rounded-full ${bgColor} flex items-center justify-center text-white text-sm font-semibold`}>
          {initials}
        </div>
      </div>
    );
  }

  return (
    <div className={`w-8 h-8 rounded-full ${bgColor} flex items-center justify-center text-white text-sm font-semibold`}>
      {initials}
    </div>
  );
};

interface User {
  uid: string;
  email: string;
  fullName?: string;
  display_name?: string;
  photo_url?: string;
  avatarUrl?: string;
  membershipTier?: string;
  plan_tier?: string;
  isAdmin?: boolean;
  is_admin?: boolean;
  isModerator?: boolean;
  is_moderator?: boolean;
  createdAt?: any;
  created_time?: any;
  lastLogin?: any;
  last_login?: any;
}

export const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const usersRef = collection(db, COLLECTIONS.USERS);
      const q = query(usersRef, orderBy("created_time", "desc"));
      const snapshot = await getDocs(q);
      
      const fetchedUsers = snapshot.docs
        .map(doc => ({
          uid: doc.id,
          ...doc.data()
        }))
        .filter(user => user.uid && user.email) as User[]; // Filter out invalid users
      
      console.log(`Fetched ${fetchedUsers.length} users from Firebase`);
      setUsers(fetchedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const toggleAdminRole = async (userId: string, hasAdmin: boolean) => {
    try {
      const userDocRef = doc(db, COLLECTIONS.USERS, userId);
      
      await updateDoc(userDocRef, {
        is_admin: !hasAdmin,
        isAdmin: !hasAdmin, // Also update camelCase version
      });
      
      toast.success(hasAdmin ? "Admin role removed" : "Admin role granted");
      fetchUsers();
    } catch (error) {
      console.error("Error toggling admin role:", error);
      toast.error("Failed to update admin role");
    }
  };

  const toggleModeratorRole = async (userId: string, hasModerator: boolean) => {
    try {
      const userDocRef = doc(db, COLLECTIONS.USERS, userId);
      
      await updateDoc(userDocRef, {
        is_moderator: !hasModerator,
        isModerator: !hasModerator, // Also update camelCase version
      });
      
      toast.success(hasModerator ? "Moderator role removed" : "Moderator role granted");
      fetchUsers();
    } catch (error) {
      console.error("Error toggling moderator role:", error);
      toast.error("Failed to update moderator role");
    }
  };

  if (loading) {
    return (
      <Card className="glass border-glass-border">
        <CardContent className="p-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading users...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (users.length === 0) {
    return (
      <Card className="glass border-glass-border">
        <CardHeader>
          <CardTitle>User Management</CardTitle>
        </CardHeader>
        <CardContent className="p-12">
          <div className="text-center text-muted-foreground">
            <p>No users found</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass border-glass-border">
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <p className="text-sm text-muted-foreground mt-2">
          Total Users: {users.length}
        </p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
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
              {users
                .filter(user => user.uid && user.email) // Extra safety filter
                .map((user, index) => {
                  const hasAdmin = user.is_admin === true || user.isAdmin === true;
                  const hasModerator = user.is_moderator === true || user.isModerator === true;
                  const displayName = user.fullName || user.display_name || user.email?.split('@')[0] || "N/A";
                  const planTier = user.membershipTier || user.plan_tier || "free";
                  const createdDate = user.createdAt?.toDate?.() || user.created_time?.toDate?.() || new Date();
                  
                  return (
                    <TableRow key={`user-${user.uid}-${index}`}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <UserAvatar 
                            photoUrl={user.photo_url || user.avatarUrl} 
                            name={displayName}
                            email={user.email}
                          />
                          <span>{displayName}</span>
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="capitalize">
                          {planTier.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {hasAdmin && (
                            <Badge variant="default" className="bg-primary">
                              Admin
                            </Badge>
                          )}
                          {hasModerator && (
                            <Badge variant="outline" className="border-primary text-primary">
                              Moderator
                            </Badge>
                          )}
                          {!hasAdmin && !hasModerator && (
                            <span className="text-muted-foreground text-sm">No roles</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{createdDate.toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant={hasAdmin ? "destructive" : "outline"}
                            onClick={() => toggleAdminRole(user.uid, hasAdmin)}
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
                          <Button
                            size="sm"
                            variant={hasModerator ? "secondary" : "outline"}
                            onClick={() => toggleModeratorRole(user.uid, hasModerator)}
                          >
                            {hasModerator ? (
                              <>
                                <UserCog className="w-4 h-4 mr-2" />
                                Remove Mod
                              </>
                            ) : (
                              <>
                                <UserCog className="w-4 h-4 mr-2" />
                                Make Mod
                              </>
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
