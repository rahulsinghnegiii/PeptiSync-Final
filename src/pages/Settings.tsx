import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, Lock, MapPin, Bell } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import ProfileTab from "@/components/settings/ProfileTab";
import SecurityTab from "@/components/settings/SecurityTab";
import AddressesTab from "@/components/settings/AddressesTab";
import PreferencesTab from "@/components/settings/PreferencesTab";

export interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  phone_number: string | null;
  membership_tier: string;
  shipping_address: ShippingAddress | null;
  created_at: string;
}

export interface ShippingAddress {
  fullName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phoneNumber: string;
}

const Settings = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setProfile(data);
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
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
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center space-x-2">
              <img 
                src="/logo.png" 
                alt="PeptiSync Logo" 
                className="w-8 h-8 object-contain"
              />
              <h1 className="text-2xl font-bold text-gradient">Settings</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Security
              </TabsTrigger>
              <TabsTrigger value="addresses" className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Addresses
              </TabsTrigger>
              <TabsTrigger value="preferences" className="flex items-center gap-2">
                <Bell className="w-4 h-4" />
                Preferences
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <ProfileTab profile={profile} onProfileUpdate={loadProfile} />
            </TabsContent>

            <TabsContent value="security">
              <SecurityTab />
            </TabsContent>

            <TabsContent value="addresses">
              <AddressesTab profile={profile} onProfileUpdate={loadProfile} />
            </TabsContent>

            <TabsContent value="preferences">
              <PreferencesTab />
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
    </div>
  );
};

export default Settings;
