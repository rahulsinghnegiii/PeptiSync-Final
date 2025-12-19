import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Lock, Check, X } from "lucide-react";
import { auth } from "@/lib/firebase";
import { updatePassword, verifyPasswordResetCode, confirmPasswordReset } from "firebase/auth";
import { useNavigate, useSearchParams } from "react-router-dom";
import { validatePasswordStrength, getPasswordStrengthLabel, getPasswordStrengthColor } from "@/lib/passwordValidation";

const UpdatePassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const passwordStrength = validatePasswordStrength(password);
  const oobCode = searchParams.get('oobCode');

  useEffect(() => {
    // Check if we have a valid reset code
    const checkResetCode = async () => {
      if (!oobCode) {
        toast.error("Invalid or missing reset code");
        navigate("/auth");
        return;
      }

      try {
        // Verify the password reset code is valid
        await verifyPasswordResetCode(auth, oobCode);
      } catch (error) {
        console.error("Invalid reset code:", error);
        toast.error("Invalid or expired reset link");
        navigate("/auth");
      }
    };
    checkResetCode();
  }, [navigate, oobCode]);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }

    if (!passwordStrength.isValid) {
      toast.error("Password does not meet requirements");
      return;
    }

    if (!oobCode) {
      toast.error("Invalid reset code");
      return;
    }

    setIsLoading(true);

    try {
      // Confirm the password reset with the new password
      await confirmPasswordReset(auth, oobCode, password);
      toast.success("Password updated successfully!");
      navigate("/auth");
    } catch (error: any) {
      console.error("Update password error:", error);
      toast.error(error.message || "Failed to update password");
    } finally {
      setIsLoading(false);
    }
  };

  const StrengthIndicator = ({ met, label }: { met: boolean; label: string }) => (
    <div className="flex items-center gap-2 text-sm">
      {met ? (
        <Check className="w-4 h-4 text-green-500" />
      ) : (
        <X className="w-4 h-4 text-muted-foreground" />
      )}
      <span className={met ? "text-green-500" : "text-muted-foreground"}>
        {label}
      </span>
    </div>
  );

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="pt-20">
        <section className="relative py-20 flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="max-w-md w-full mx-auto px-4">
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              <Card className="glass border-glass-border shadow-2xl">
                <CardHeader className="text-center pb-6">
                  <CardTitle className="text-2xl font-bold text-gradient">
                    Update Password
                  </CardTitle>
                  <CardDescription>
                    Enter your new password below
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <form onSubmit={handleUpdatePassword} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="password">New Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="password"
                          type="password"
                          placeholder="Enter your new password"
                          className="pl-10 glass"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                      </div>

                      {/* Password Strength Indicator */}
                      {password && (
                        <div className="mt-3 p-3 border border-border rounded-lg bg-card/50 space-y-2">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium">Password Strength:</p>
                            <span className={`text-sm font-semibold ${getPasswordStrengthColor(passwordStrength.score)}`}>
                              {getPasswordStrengthLabel(passwordStrength.score)}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                            <div
                              className={`h-2 rounded-full transition-all ${
                                passwordStrength.score <= 1
                                  ? "bg-red-500"
                                  : passwordStrength.score === 2
                                  ? "bg-yellow-500"
                                  : passwordStrength.score === 3
                                  ? "bg-blue-500"
                                  : "bg-green-500"
                              }`}
                              style={{ width: `${(passwordStrength.score / 4) * 100}%` }}
                            />
                          </div>
                          <StrengthIndicator met={password.length >= 8} label="At least 8 characters" />
                          <StrengthIndicator met={/[A-Z]/.test(password)} label="One uppercase letter" />
                          <StrengthIndicator met={/[a-z]/.test(password)} label="One lowercase letter" />
                          <StrengthIndicator met={/[0-9]/.test(password)} label="One number" />
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="confirmPassword"
                          type="password"
                          placeholder="Confirm your new password"
                          className="pl-10 glass"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                        />
                      </div>
                      {confirmPassword && password !== confirmPassword && (
                        <p className="text-sm text-destructive">Passwords don't match</p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      variant="hero"
                      className="w-full mt-6"
                      disabled={isLoading || !passwordStrength.isValid || password !== confirmPassword}
                    >
                      {isLoading ? "Updating..." : "Update Password"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default UpdatePassword;
