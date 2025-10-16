/**
 * Permission guard components for role-based access control
 */

import { ReactNode, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { checkUserRole, UserRole } from "@/lib/authorization";
import { toast } from "sonner";
import { LoadingFallback } from "./LoadingFallback";

interface PermissionGuardProps {
  children: ReactNode;
  requiredRole: UserRole;
  fallback?: ReactNode;
  redirectTo?: string;
  showToast?: boolean;
}

/**
 * Component that guards content based on user role
 */
export const PermissionGuard = ({
  children,
  requiredRole,
  fallback = null,
  redirectTo = "/",
  showToast = true,
}: PermissionGuardProps) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkPermission = async () => {
      const { hasPermission: permitted } = await checkUserRole(requiredRole);
      setHasPermission(permitted);

      if (!permitted) {
        if (showToast) {
          toast.error("You don't have permission to access this resource");
        }
        if (redirectTo) {
          navigate(redirectTo);
        }
      }
    };

    checkPermission();
  }, [requiredRole, navigate, redirectTo, showToast]);

  if (hasPermission === null) {
    return <LoadingFallback />;
  }

  if (!hasPermission) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

interface ConditionalRenderProps {
  children: ReactNode;
  requiredRole: UserRole;
  fallback?: ReactNode;
}

/**
 * Component that conditionally renders content based on user role
 * Does not redirect, just shows/hides content
 */
export const ConditionalRender = ({
  children,
  requiredRole,
  fallback = null,
}: ConditionalRenderProps) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    const checkPermission = async () => {
      const { hasPermission: permitted } = await checkUserRole(requiredRole);
      setHasPermission(permitted);
    };

    checkPermission();
  }, [requiredRole]);

  if (hasPermission === null) {
    return null;
  }

  if (!hasPermission) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
