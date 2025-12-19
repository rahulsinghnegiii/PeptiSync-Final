import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";
import { Mail, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";

const ResetPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const { resetPassword } = useAuth();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await resetPassword(email);

      if (error) {
        toast.error(error.message || "Failed to send reset email");
      } else {
        setEmailSent(true);
        toast.success("Password reset email sent! Check your inbox.");
      }
    } catch (error) {
      console.error("Reset password error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

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
                    Reset Password
                  </CardTitle>
                  <CardDescription>
                    {emailSent
                      ? "Check your email for a password reset link"
                      : "Enter your email to receive a password reset link"}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  {!emailSent ? (
                    <form onSubmit={handleResetPassword} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="email"
                            type="email"
                            placeholder="Enter your email"
                            className="pl-10 glass"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <Button
                        type="submit"
                        variant="hero"
                        className="w-full mt-6"
                        disabled={isLoading}
                      >
                        {isLoading ? "Sending..." : "Send Reset Link"}
                      </Button>

                      <div className="text-center mt-4">
                        <Link to="/auth">
                          <Button variant="ghost" size="sm">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Sign In
                          </Button>
                        </Link>
                      </div>
                    </form>
                  ) : (
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 mx-auto rounded-full bg-green-500/20 flex items-center justify-center">
                        <Mail className="w-8 h-8 text-green-500" />
                      </div>
                      <p className="text-muted-foreground">
                        We've sent a password reset link to <strong>{email}</strong>
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Didn't receive the email? Check your spam folder or try again.
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => setEmailSent(false)}
                        className="mt-4"
                      >
                        Try Different Email
                      </Button>
                      <div className="mt-4">
                        <Link to="/auth">
                          <Button variant="ghost" size="sm">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Sign In
                          </Button>
                        </Link>
                      </div>
                    </div>
                  )}
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

export default ResetPassword;
