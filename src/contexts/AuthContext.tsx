import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc, getDoc, Timestamp } from "firebase/firestore";
import { COLLECTIONS } from "@/lib/firestoreHelpers";
import { sendWelcomeEmail } from "@/lib/email";
import { SessionTimeoutManager } from "@/lib/sessionTimeout";
import { initializeCsrfToken, clearCsrfToken } from "@/lib/csrfProtection";
import { toast } from "sonner";
import type { UserProfile } from "@/types/firestore";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
}

// Create context with a default value to prevent undefined errors
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signUp: async () => ({ error: new Error("Auth not initialized") }),
  signIn: async () => ({ error: new Error("Auth not initialized") }),
  signInWithGoogle: async () => ({ error: new Error("Auth not initialized") }),
  signOut: async () => {},
  resetPassword: async () => ({ error: new Error("Auth not initialized") }),
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
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
    // Set up Firebase auth state listener
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);

      // Start session timeout when user signs in
      if (firebaseUser) {
        sessionManager.start();
        initializeCsrfToken();

        // Check if user profile exists, create if not
        const userDocRef = doc(db, COLLECTIONS.USERS, firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (!userDoc.exists()) {
          // Create user profile in Firestore
          const userProfile: Omit<UserProfile, 'createdAt' | 'updatedAt'> = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            fullName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
            avatarUrl: firebaseUser.photoURL || undefined,
            membershipTier: 'free',
          };
          
          await setDoc(userDocRef, {
            ...userProfile,
            display_name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
            photo_url: firebaseUser.photoURL || '',
            created_time: Timestamp.now(),
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
          });
        }
      } else {
        // Stop session timeout when user signs out
        sessionManager.stop();
        clearCsrfToken();
      }
    });

    return () => {
      unsubscribe();
      sessionManager.stop();
    };
  }, [sessionManager]);

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      // Create user with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update user profile with display name
      await updateProfile(user, {
        displayName: fullName,
      });

      // Create user profile in Firestore
      const userProfile: Omit<UserProfile, 'createdAt' | 'updatedAt'> = {
        uid: user.uid,
        email: email,
        fullName: fullName,
        membershipTier: 'free',
      };

      await setDoc(doc(db, COLLECTIONS.USERS, user.uid), {
        ...userProfile,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      // Send email verification
      await sendEmailVerification(user);

      // Send welcome email
      try {
        await sendWelcomeEmail(email, {
          userName: fullName,
        });
      } catch (emailError) {
        console.error("Failed to send welcome email:", emailError);
        // Don't fail the signup if email fails
      }

      toast.info("Please check your email to verify your account.", {
        duration: 8000,
      });

      return { error: null };
    } catch (error: any) {
      console.error("Sign up error:", error);
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { error: null };
    } catch (error: any) {
      console.error("Sign in error:", error);
      return { error };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Check if user profile exists, create if not
      const userDocRef = doc(db, COLLECTIONS.USERS, result.user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        const userProfile: Omit<UserProfile, 'createdAt' | 'updatedAt'> = {
          uid: result.user.uid,
          email: result.user.email || '',
          fullName: result.user.displayName || '',
          avatarUrl: result.user.photoURL || undefined,
          membershipTier: 'free',
        };
        
        await setDoc(userDocRef, {
          ...userProfile,
          display_name: result.user.displayName || '',
          photo_url: result.user.photoURL || '',
          created_time: Timestamp.now(),
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });
        
        // Send welcome email
        if (result.user.email && result.user.displayName) {
          try {
            await sendWelcomeEmail(result.user.email, {
              userName: result.user.displayName,
            });
          } catch (emailError) {
            console.error("Failed to send welcome email:", emailError);
            // Don't fail the signup if email fails
          }
        }
      }
      
      return { error: null };
    } catch (error: any) {
      console.error("Google sign-in error:", error);
      return { error };
    }
  };

  const signOut = async () => {
    sessionManager.stop();
    
    // Clear React Query cache on logout to prevent memory buildup
    try {
      const { queryClient } = await import("@/App");
      if (queryClient) {
        queryClient.getQueryCache().clear();
        queryClient.getMutationCache().clear();
      }
    } catch (error) {
      console.warn("Failed to clear query cache on logout:", error);
    }
    
    await firebaseSignOut(auth);
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email, {
        url: `${window.location.origin}/auth`,
      });
      return { error: null };
    } catch (error: any) {
      console.error("Password reset error:", error);
      return { error };
    }
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};