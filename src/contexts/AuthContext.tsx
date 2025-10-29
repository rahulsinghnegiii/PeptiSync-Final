import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { sendWelcomeEmail } from "@/lib/email";
import { SessionTimeoutManager } from "@/lib/sessionTimeout";
import { initializeCsrfToken, clearCsrfToken } from "@/lib/csrfProtection";
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionManager] = useState(() => new SessionTimeoutManager({
    onWarning: () => {
      toast.warning("Your session will expire in 5 minutes due to inactivity", {
        duration: 10000,
      });
    },
    onTimeout: async () => {
      toast.error("Your session has expired. Please sign in again.");
      await signOut();
    },
  }));

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Start session timeout when user signs in
        if (event === 'SIGNED_IN' && session) {
          sessionManager.start();
          initializeCsrfToken();
        }

        // Stop session timeout when user signs out
        if (event === 'SIGNED_OUT') {
          sessionManager.stop();
          clearCsrfToken();
        }

        // Handle email verification
        if (event === 'USER_UPDATED' && session?.user) {
          if (session.user.email_confirmed_at) {
            toast.success("Email verified successfully!");
          }
        }
      }
    );

    // THEN check for existing session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // Start session timeout if user is already logged in
      if (session) {
        sessionManager.start();
        initializeCsrfToken();
      }
    };

    getInitialSession();

    return () => {
      subscription.unsubscribe();
      sessionManager.stop();
    };
  }, [sessionManager]);

  const signUp = async (email: string, password: string, fullName: string) => {
    const redirectUrl = `${window.location.origin}/dashboard`;
    
    const { error, data } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
        },
      },
    });
    
    // Send welcome email after successful signup
    if (!error && data.user) {
      try {
        await sendWelcomeEmail(email, {
          userName: fullName,
        });
        
        // Notify user to check email for verification
        if (!data.session) {
          toast.info("Please check your email to verify your account before signing in.", {
            duration: 8000,
          });
        }
      } catch (emailError) {
        console.error("Failed to send welcome email:", emailError);
        // Don't fail the signup if email fails
      }
    }
    
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    return { error };
  };

  const signOut = async () => {
    sessionManager.stop();
    await supabase.auth.signOut();
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });
    return { error };
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};