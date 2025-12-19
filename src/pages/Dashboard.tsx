import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, LogOut, Settings, Shield, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { checkUserRole } from "@/lib/authorization";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, setDoc, Timestamp } from "firebase/firestore";
import { COLLECTIONS } from "@/lib/firestoreHelpers";
import type { UserProfile } from "@/types/firestore";

interface Profile {
  uid: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  membershipTier: string;
  createdAt: any;
}

const Dashboard = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const { user, signOut: authSignOut } = useAuth();

  useEffect(() => {
    if (user) {
      checkUser();
    }
  }, [user]);

  const checkUser = async () => {
    try {
      if (!user) return;

      // Fetch user profile from Firestore with retry logic for new Google sign-ins
      const userDocRef = doc(db, COLLECTIONS.USERS, user.uid);
      let userDoc = await getDoc(userDocRef);
      
      // If profile doesn't exist yet, wait and retry (for Google sign-in race condition)
      if (!userDoc.exists()) {
        console.log("Profile not found, waiting for creation...");
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
        userDoc = await getDoc(userDocRef);
        
        // If still doesn't exist, create it now
        if (!userDoc.exists()) {
          console.log("Creating profile now...");
          const newProfile = {
            uid: user.uid,
            email: user.email || '',
            fullName: user.displayName || user.email?.split('@')[0] || 'User',
            display_name: user.displayName || user.email?.split('@')[0] || 'User',
            avatarUrl: user.photoURL || '',
            photo_url: user.photoURL || '',
            membershipTier: 'free',
            plan_tier: 'free',
            created_time: Timestamp.now(),
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
          };
          
          await setDoc(userDocRef, newProfile);
          userDoc = await getDoc(userDocRef);
        }
      }

      if (userDoc.exists()) {
        const userData = userDoc.data() as UserProfile;
        
        // If fullName is missing, try to get it from Firebase Auth displayName or email
        let fullName = userData.fullName || userData.display_name || user.displayName || user.email?.split('@')[0] || 'User';
        
        // Get plan tier from Firebase (supports both snake_case and camelCase)
        let membershipTier = userData.membershipTier || userData.plan_tier || 'free';
        
        // Update the profile with the fallback values if needed
        if (!userData.fullName || !userData.membershipTier) {
          try {
            await updateDoc(userDocRef, {
              fullName: fullName,
              display_name: fullName, // Also update snake_case version
              membershipTier: membershipTier,
              plan_tier: membershipTier, // Also update snake_case version
            });
          } catch (error) {
            console.error("Error updating user profile:", error);
          }
        }
        
        setProfile({
          uid: userData.uid,
          email: userData.email,
          fullName: fullName,
          avatarUrl: userData.avatarUrl || userData.photo_url || user.photoURL,
          membershipTier: membershipTier,
          createdAt: userData.createdAt || userData.created_time,
        });
      } else {
        // This should never happen now, but keep as fallback
        toast.error("Profile not found. Please contact support.");
        setLoading(false);
        return;
      }

      // Check if user is admin
      const { hasPermission } = await checkUserRole('admin');
      setIsAdmin(hasPermission);
    } catch (error) {
      console.error("Error checking user:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await authSignOut();
      toast.success("Signed out successfully");
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Failed to sign out");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Profile not found</h2>
          <Button onClick={() => navigate("/auth")}>Sign In</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img 
              src="/logo.png" 
              alt="PeptiSync Logo" 
              className="w-8 h-8 object-contain"
            />
            <h1 className="text-2xl font-bold text-gradient">PeptiSync Dashboard</h1>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
            {isAdmin && (
              <Button variant="outline" size="sm" onClick={() => navigate("/admin")}>
                <Shield className="w-4 h-4 mr-2" />
                Admin Panel
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => navigate("/settings")}>
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Profile Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Card className="glass border-glass-border">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={profile.avatarUrl || ""} />
                  <AvatarFallback className="bg-primary/10 text-primary text-lg">
                    {profile.fullName?.[0] || profile.email?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-2xl">
                    Welcome back, {profile.fullName || user?.displayName || profile.email?.split('@')[0] || "User"}!
                  </CardTitle>
                  <p className="text-muted-foreground">{profile.email}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge variant="secondary" className="capitalize">
                      {profile.membershipTier} Member
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Joined {profile.createdAt?.toDate?.()?.toLocaleDateString() || 'Recently'}
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>
        </motion.div>

        {/* Welcome Message */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="glass border-glass-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Getting Started</CardTitle>
              <Calendar className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Welcome to PeptiSync! Your peptide tracking platform is ready to help you manage your peptide protocols effectively.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border border-border rounded-lg">
                    <h3 className="font-semibold mb-2">Track Your Peptides</h3>
                    <p className="text-sm text-muted-foreground">
                      Monitor your peptide usage, dosages, and schedules all in one place.
                    </p>
                  </div>
                  <div className="p-4 border border-border rounded-lg">
                    <h3 className="font-semibold mb-2">Stay Organized</h3>
                    <p className="text-sm text-muted-foreground">
                      Keep detailed records of your protocols and track your progress over time.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
};

export default Dashboard;
