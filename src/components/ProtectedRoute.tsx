import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingFallback } from "./LoadingFallback";
import { checkUserRole } from "@/lib/authorization";

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

export const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingFallback />;
  }

  if (!user) {
    // Redirect to auth page, saving the attempted location
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Check admin requirement
  if (requireAdmin && !checkUserRole(user, 'admin')) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

interface GuestOnlyProps {
  children: ReactNode;
}

export const GuestOnly = ({ children }: GuestOnlyProps) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingFallback />;
  }

  if (user) {
    // Redirect authenticated users to dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
