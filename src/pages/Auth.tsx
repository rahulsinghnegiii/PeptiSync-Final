import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Mail, Lock, User, Check, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { validatePasswordStrength, getPasswordStrengthLabel, getPasswordStrengthColor } from "@/lib/passwordValidation";

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect authenticated users to dashboard
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { error } = await signIn(loginData.email, loginData.password);
      
      if (error) {
        toast.error(error.message || "Failed to sign in");
      } else {
        toast.success("Welcome back! You've been logged in successfully.");
        
        // Check for pending cart item
        const pendingItem = localStorage.getItem('pendingCartItem');
        if (pendingItem) {
          try {
            const product = JSON.parse(pendingItem);
            const { data: { user: currentUser } } = await supabase.auth.getUser();
            
            if (currentUser) {
              await supabase.from('cart_items').insert({
                user_id: currentUser.id,
                product_name: product.name,
                product_price: parseFloat(product.price.replace('$', '')),
                product_image: product.image,
                quantity: 1
              });
              toast.success("Product added to cart!");
            }
            localStorage.removeItem('pendingCartItem');
          } catch (err) {
            console.error("Error adding pending cart item:", err);
          }
        }
        
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Sign in error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (signupData.password !== signupData.confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }

    // Validate password strength
    const passwordStrength = validatePasswordStrength(signupData.password);
    if (!passwordStrength.isValid) {
      toast.error("Password does not meet requirements");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await signUp(signupData.email, signupData.password, signupData.name);
      
      if (error) {
        toast.error(error.message || "Failed to create account");
      } else {
        toast.success("Account created successfully! Welcome to PeptiSync.");
        
        // Check for pending cart item
        const pendingItem = localStorage.getItem('pendingCartItem');
        if (pendingItem) {
          try {
            const product = JSON.parse(pendingItem);
            const { data: { user: currentUser } } = await supabase.auth.getUser();
            
            if (currentUser) {
              await supabase.from('cart_items').insert({
                user_id: currentUser.id,
                product_name: product.name,
                product_price: parseFloat(product.price.replace('$', '')),
                product_image: product.image,
                quantity: 1
              });
              toast.success("Product added to cart!");
            }
            localStorage.removeItem('pendingCartItem');
          } catch (err) {
            console.error("Error adding pending cart item:", err);
          }
        }
        
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Sign up error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false); 
    }
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="pt-20">
        {/* Background Effects */}
        <div className="fixed inset-0">
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-primary rounded-full"
              initial={{ 
                x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200),
                y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
                opacity: 0 
              }}
              animate={{
                y: [null, -100, -200],
                opacity: [0, 0.6, 0],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        <section className="relative py-20 flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="max-w-md w-full mx-auto px-4">
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              <Card className="glass border-glass-border shadow-2xl">
                <CardHeader className="text-center pb-6">
                  <div className="flex items-center justify-center mb-4">
                    <img 
                      src="/logo.png" 
                      alt="PeptiSync Logo" 
                      className="w-12 h-12 object-contain"
                    />
                  </div>
                  <CardTitle className="text-2xl font-bold text-gradient">
                    Welcome to PeptiSync
                  </CardTitle>
                </CardHeader>
                
                <CardContent>
                  <Tabs defaultValue="login" className="w-full">
                    <TabsList className="glass w-full mb-6">
                      <TabsTrigger value="login" className="flex-1">Sign In</TabsTrigger>
                      <TabsTrigger value="signup" className="flex-1">Sign Up</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="login">
                      <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="login-email">Email</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="login-email"
                              type="email"
                              placeholder="Enter your email"
                              className="pl-10 glass"
                              value={loginData.email}
                              onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                              required
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="login-password">Password</Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="login-password"
                              type="password"
                              placeholder="Enter your password"
                              className="pl-10 glass"
                              value={loginData.password}
                              onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
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
                          {isLoading ? "Signing in..." : "Sign In"}
                        </Button>
                        
                        <div className="text-center mt-4">
                          <Link to="/reset-password">
                            <Button variant="ghost" size="sm">
                              Forgot password?
                            </Button>
                          </Link>
                        </div>
                      </form>
                    </TabsContent>
                    
                    <TabsContent value="signup">
                      <form onSubmit={handleSignup} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="signup-name">Full Name</Label>
                          <div className="relative">
                            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="signup-name"
                              type="text"
                              placeholder="Enter your full name"
                              className="pl-10 glass"
                              value={signupData.name}
                              onChange={(e) => setSignupData(prev => ({ ...prev, name: e.target.value }))}
                              required
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="signup-email">Email</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="signup-email"
                              type="email"
                              placeholder="Enter your email"
                              className="pl-10 glass"
                              value={signupData.email}
                              onChange={(e) => setSignupData(prev => ({ ...prev, email: e.target.value }))}
                              required
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="signup-password">Password</Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="signup-password"
                              type="password"
                              placeholder="Create a password"
                              className="pl-10 glass"
                              value={signupData.password}
                              onChange={(e) => setSignupData(prev => ({ ...prev, password: e.target.value }))}
                              required
                            />
                          </div>
                          
                          {/* Password Strength Indicators */}
                          {signupData.password && (
                            <div className="mt-2 p-3 border border-border rounded-lg bg-card/50 space-y-2">
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-xs font-medium">Password Strength:</p>
                                <span className={`text-xs font-semibold ${getPasswordStrengthColor(validatePasswordStrength(signupData.password).score)}`}>
                                  {getPasswordStrengthLabel(validatePasswordStrength(signupData.password).score)}
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
                                <div
                                  className={`h-1.5 rounded-full transition-all ${
                                    validatePasswordStrength(signupData.password).score <= 1
                                      ? "bg-red-500"
                                      : validatePasswordStrength(signupData.password).score === 2
                                      ? "bg-yellow-500"
                                      : validatePasswordStrength(signupData.password).score === 3
                                      ? "bg-blue-500"
                                      : "bg-green-500"
                                  }`}
                                  style={{ width: `${(validatePasswordStrength(signupData.password).score / 4) * 100}%` }}
                                />
                              </div>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 text-xs">
                                  {signupData.password.length >= 8 ? (
                                    <Check className="w-3 h-3 text-green-500" />
                                  ) : (
                                    <X className="w-3 h-3 text-muted-foreground" />
                                  )}
                                  <span className={signupData.password.length >= 8 ? "text-green-500" : "text-muted-foreground"}>
                                    At least 8 characters
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-xs">
                                  {/[A-Z]/.test(signupData.password) ? (
                                    <Check className="w-3 h-3 text-green-500" />
                                  ) : (
                                    <X className="w-3 h-3 text-muted-foreground" />
                                  )}
                                  <span className={/[A-Z]/.test(signupData.password) ? "text-green-500" : "text-muted-foreground"}>
                                    One uppercase letter
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-xs">
                                  {/[0-9]/.test(signupData.password) ? (
                                    <Check className="w-3 h-3 text-green-500" />
                                  ) : (
                                    <X className="w-3 h-3 text-muted-foreground" />
                                  )}
                                  <span className={/[0-9]/.test(signupData.password) ? "text-green-500" : "text-muted-foreground"}>
                                    One number
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="signup-confirm">Confirm Password</Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="signup-confirm"
                              type="password"
                              placeholder="Confirm your password"
                              className="pl-10 glass"
                              value={signupData.confirmPassword}
                              onChange={(e) => setSignupData(prev => ({ ...prev, confirmPassword: e.target.value }))}
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
                          {isLoading ? "Creating account..." : "Create Account"}
                        </Button>
                      </form>
                    </TabsContent>
                  </Tabs>
                  
                  <div className="mt-6 text-center text-xs text-muted-foreground">
                    By signing in, you agree to our{" "}
                    <a href="/legal" className="text-primary hover:underline">
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a href="/legal" className="text-primary hover:underline">
                      Privacy Policy
                    </a>
                  </div>
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

export default Auth;