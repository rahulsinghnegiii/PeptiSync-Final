/**
 * Authorization utilities and permission checks
 */

import { supabase } from "@/integrations/supabase/client";

export type UserRole = 'user' | 'moderator' | 'admin';

export interface PermissionCheck {
  hasPermission: boolean;
  role: UserRole | null;
}

/**
 * Check if the current user has a specific role
 */
export const checkUserRole = async (requiredRole: UserRole): Promise<PermissionCheck> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { hasPermission: false, role: null };
    }

    // Query user_roles table
    const { data: roles, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (error || !roles) {
      // Default to 'user' role if no role found
      return { 
        hasPermission: requiredRole === 'user', 
        role: 'user' 
      };
    }

    const userRole = roles.role as UserRole;
    
    // Check permission hierarchy: admin > moderator > user
    const hasPermission = checkRoleHierarchy(userRole, requiredRole);

    return { hasPermission, role: userRole };
  } catch (error) {
    console.error('Error checking user role:', error);
    return { hasPermission: false, role: null };
  }
};

/**
 * Check role hierarchy - higher roles have permissions of lower roles
 */
const checkRoleHierarchy = (userRole: UserRole, requiredRole: UserRole): boolean => {
  const roleHierarchy: Record<UserRole, number> = {
    user: 1,
    moderator: 2,
    admin: 3,
  };

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
};

/**
 * Check if user is admin
 */
export const isAdmin = async (): Promise<boolean> => {
  const { hasPermission } = await checkUserRole('admin');
  return hasPermission;
};

/**
 * Check if user is moderator or higher
 */
export const isModerator = async (): Promise<boolean> => {
  const { hasPermission } = await checkUserRole('moderator');
  return hasPermission;
};

/**
 * Check if user owns a resource
 */
export const checkResourceOwnership = async (
  table: string,
  resourceId: string,
  userIdColumn: string = 'user_id'
): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return false;
    }

    const { data, error } = await supabase
      .from(table)
      .select(userIdColumn)
      .eq('id', resourceId)
      .single();

    if (error || !data) {
      return false;
    }

    return data[userIdColumn] === user.id;
  } catch (error) {
    console.error('Error checking resource ownership:', error);
    return false;
  }
};

/**
 * Verify user can perform action on resource
 * Checks both ownership and admin status
 */
export const canModifyResource = async (
  table: string,
  resourceId: string,
  userIdColumn: string = 'user_id'
): Promise<boolean> => {
  const isUserAdmin = await isAdmin();
  if (isUserAdmin) {
    return true;
  }

  return await checkResourceOwnership(table, resourceId, userIdColumn);
};

/**
 * Get current user's role
 */
export const getCurrentUserRole = async (): Promise<UserRole> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return 'user';
    }

    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    return (roles?.role as UserRole) || 'user';
  } catch (error) {
    console.error('Error getting user role:', error);
    return 'user';
  }
};
