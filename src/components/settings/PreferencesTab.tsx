import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Bell, Mail, Moon, Sun } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { COLLECTIONS } from "@/lib/firestoreHelpers";

const PreferencesTab = () => {
  const { user } = useAuth();
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [emailNotifications, setEmailNotifications] = useState({
    orderUpdates: true,
    promotions: true,
    newsletter: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load theme from localStorage
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    }

    // Load email preferences from database
    loadEmailPreferences();
  }, [user]);

  const loadEmailPreferences = async () => {
    if (!user) return;

    try {
      const userDocRef = doc(db, COLLECTIONS.USERS, user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData?.emailPreferences) {
          setEmailNotifications({
            orderUpdates: userData.emailPreferences.orderUpdates ?? true,
            promotions: userData.emailPreferences.marketing ?? true,
            newsletter: userData.emailPreferences.marketing ?? false,
          });
        }
      }
    } catch (error) {
      console.error("Error loading email preferences:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleThemeToggle = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
    toast.success(`Theme changed to ${newTheme} mode`);
  };

  const handleEmailPreferenceChange = async (key: keyof typeof emailNotifications) => {
    if (!user) return;

    const newPreferences = {
      ...emailNotifications,
      [key]: !emailNotifications[key],
    };
    setEmailNotifications(newPreferences);

    try {
      const userDocRef = doc(db, COLLECTIONS.USERS, user.uid);
      await updateDoc(userDocRef, {
        emailPreferences: {
          orderUpdates: newPreferences.orderUpdates,
          shippingNotifications: newPreferences.orderUpdates,
          marketing: newPreferences.promotions || newPreferences.newsletter,
        },
      });

      toast.success("Email preferences updated");
    } catch (error) {
      console.error("Error updating email preferences:", error);
      toast.error("Failed to update email preferences");
      // Revert the change
      setEmailNotifications(emailNotifications);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Theme Preferences */}
      <Card className="glass border-glass-border">
        <CardHeader>
          <div className="flex items-center gap-2">
            {theme === "light" ? (
              <Sun className="w-5 h-5 text-primary" />
            ) : (
              <Moon className="w-5 h-5 text-primary" />
            )}
            <CardTitle>Appearance</CardTitle>
          </div>
          <CardDescription>
            Customize how PeptiSync looks on your device
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-card/50">
            <div className="space-y-0.5">
              <Label htmlFor="theme-toggle" className="text-base font-medium">
                Dark Mode
              </Label>
              <p className="text-sm text-muted-foreground">
                Switch between light and dark theme
              </p>
            </div>
            <Switch
              id="theme-toggle"
              checked={theme === "dark"}
              onCheckedChange={handleThemeToggle}
            />
          </div>
        </CardContent>
      </Card>

      {/* Email Notification Preferences */}
      <Card className="glass border-glass-border">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            <CardTitle>Notifications</CardTitle>
          </div>
          <CardDescription>
            Manage your email notification preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-card/50">
            <div className="space-y-0.5 flex-1">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <Label htmlFor="order-updates" className="text-base font-medium">
                  Order Updates
                </Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Receive emails about your order status and shipping
              </p>
            </div>
            <Switch
              id="order-updates"
              checked={emailNotifications.orderUpdates}
              onCheckedChange={() => handleEmailPreferenceChange("orderUpdates")}
            />
          </div>

          <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-card/50">
            <div className="space-y-0.5 flex-1">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <Label htmlFor="promotions" className="text-base font-medium">
                  Promotions & Offers
                </Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Get notified about special deals and discounts
              </p>
            </div>
            <Switch
              id="promotions"
              checked={emailNotifications.promotions}
              onCheckedChange={() => handleEmailPreferenceChange("promotions")}
            />
          </div>

          <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-card/50">
            <div className="space-y-0.5 flex-1">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <Label htmlFor="newsletter" className="text-base font-medium">
                  Newsletter
                </Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Receive our monthly newsletter with tips and updates
              </p>
            </div>
            <Switch
              id="newsletter"
              checked={emailNotifications.newsletter}
              onCheckedChange={() => handleEmailPreferenceChange("newsletter")}
            />
          </div>

          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Note: You will always receive important transactional emails like order confirmations
              and password resets, regardless of these settings.
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PreferencesTab;
