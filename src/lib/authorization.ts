/**
 * Authorization utilities and permission checks for Firebase
 */

import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc, collection, query, where, getDocs, limit } from "firebase/firestore";
import { COLLECTIONS } from "@/lib/firestoreHelpers";
import type { UserRole } from "@/types/firestore";

// Re-export UserRole for convenience
export type { UserRole } from "@/types/firestore";

// Admin email from environment variable
const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || "rahulsinghnegi25561@gmail.com";

export interface PermissionCheck {
  hasPermission: boolean;
  role: UserRole | null;
}

/**
 * Check if user has admin role in Firebase users collection
 * Firebase schema uses is_admin (boolean) field
 */
const checkFirebaseAdminStatus = async (user: any): Promise<boolean> => {
  try {
    const userDocRef = doc(db, COLLECTIONS.USERS, user.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      // Check is_admin field (snake_case from Firebase)
      return userData.is_admin === true || userData.isAdmin === true;
    }
    
    // If admin email, auto-grant admin status
    if (user.email === ADMIN_EMAIL) {
      await setDoc(userDocRef, {
        is_admin: true,
        isAdmin: true, // Also set camelCase for compatibility
      }, { merge: true });
      console.log('Admin status granted to:', user.email);
      return true;
    }
  } catch (error) {
    console.error('Error checking Firebase admin status:', error);
  }
  return false;
};

/**
 * Check if user has moderator role in Firebase users collection
 * Firebase schema uses is_moderator (boolean) field
 */
const checkFirebaseModeratorStatus = async (user: any): Promise<boolean> => {
  try {
    const userDocRef = doc(db, COLLECTIONS.USERS, user.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      // Check is_moderator field (snake_case from Firebase)
      return userData.is_moderator === true || userData.isModerator === true;
    }
  } catch (error) {
    console.error('Error checking Firebase moderator status:', error);
  }
  return false;
};

/**
 * Check if the current user has a specific role
 * Now checks Firebase users collection for is_admin and is_moderator fields
 */
export const checkUserRole = async (requiredRole: UserRole): Promise<PermissionCheck> => {
  try {
    const user = auth.currentUser;
    
    if (!user) {
      return { hasPermission: false, role: null };
    }

    // Check Firebase users collection for admin/moderator status
    const isFirebaseAdmin = await checkFirebaseAdminStatus(user);
    if (isFirebaseAdmin) {
      return { hasPermission: true, role: 'admin' };
    }

    const isFirebaseModerator = await checkFirebaseModeratorStatus(user);
    if (isFirebaseModerator) {
      const hasPermission = checkRoleHierarchy('moderator', requiredRole);
      return { hasPermission, role: 'moderator' };
    }

    // Check custom claims (if set by backend)
    const idTokenResult = await user.getIdTokenResult();
    const customRole = idTokenResult.claims.role as UserRole | undefined;

    if (customRole) {
      const hasPermission = checkRoleHierarchy(customRole, requiredRole);
      return { hasPermission, role: customRole };
    }

    // Fallback to user_roles collection (legacy)
    const userRolesQuery = query(
      collection(db, COLLECTIONS.USER_ROLES),
      where("uid", "==", user.uid),
      limit(1)
    );

    const querySnapshot = await getDocs(userRolesQuery);

    if (!querySnapshot.empty) {
      const userRole = querySnapshot.docs[0].data().role as UserRole;
      const hasPermission = checkRoleHierarchy(userRole, requiredRole);
      return { hasPermission, role: userRole };
    }

    // Default to 'user' role
    return { 
      hasPermission: requiredRole === 'user', 
      role: 'user' 
    };
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
  collectionName: string,
  resourceId: string,
  userIdField: string = 'userId'
): Promise<boolean> => {
  try {
    const user = auth.currentUser;
    
    if (!user) {
      return false;
    }

    const docRef = doc(db, collectionName, resourceId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return false;
    }

    const data = docSnap.data();
    return data[userIdField] === user.uid;
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
  collectionName: string,
  resourceId: string,
  userIdField: string = 'userId'
): Promise<boolean> => {
  const isUserAdmin = await isAdmin();
  if (isUserAdmin) {
    return true;
  }

  return await checkResourceOwnership(collectionName, resourceId, userIdField);
};

/**
 * Get current user's role
 * Checks Firebase users collection first, then custom claims, then user_roles collection
 */
export const getCurrentUserRole = async (): Promise<UserRole> => {
  try {
    const user = auth.currentUser;
    
    if (!user) {
      return 'user';
    }

    // Check Firebase users collection for admin/moderator status
    const isFirebaseAdmin = await checkFirebaseAdminStatus(user);
    if (isFirebaseAdmin) {
      return 'admin';
    }

    const isFirebaseModerator = await checkFirebaseModeratorStatus(user);
    if (isFirebaseModerator) {
      return 'moderator';
    }

    // Check custom claims
    const idTokenResult = await user.getIdTokenResult();
    const customRole = idTokenResult.claims.role as UserRole | undefined;

    if (customRole) {
      return customRole;
    }

    // Fallback to user_roles collection
    const userRolesQuery = query(
      collection(db, COLLECTIONS.USER_ROLES),
      where("uid", "==", user.uid),
      limit(1)
    );

    const querySnapshot = await getDocs(userRolesQuery);

    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].data().role as UserRole;
    }

    return 'user';
  } catch (error) {
    console.error('Error getting user role:', error);
    return 'user';
  }
};
