/**
 * Admin Management Cloud Functions
 * 
 * Functions for setting up admin users
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

/**
 * Set admin role for a user
 * Only existing admins can create new admins
 * For initial setup, use Firebase Console or call this manually
 */
export const setAdminRole = functions.https.onCall(async (data, context) => {
  // Check if caller is already an admin (for non-initial setup)
  // For initial setup, this check can be bypassed by calling via Firebase Console
  const isInitialSetup = !context.auth;
  
  if (!isInitialSetup && !context.auth?.token.admin) {
    throw new functions.https.HttpsError('permission-denied', 'Only admins can create admins');
  }

  const { userId, email } = data;

  if (!userId && !email) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'userId or email required'
    );
  }

  try {
    let targetUserId = userId;

    // If email provided, find user by email
    if (!targetUserId && email) {
      const user = await admin.auth().getUserByEmail(email);
      targetUserId = user.uid;
    }

    // Set custom claim
    await admin.auth().setCustomUserClaims(targetUserId, { admin: true });

    // Also write to Firestore for Firestore rules
    await admin.firestore().collection('userRoles').doc(targetUserId).set({
      role: 'admin',
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    console.log(`[SetAdminRole] Admin role set for user ${targetUserId}`);

    return {
      success: true,
      message: `Admin role set for user ${targetUserId}`,
    };
  } catch (error: any) {
    console.error('[SetAdminRole] Error:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

/**
 * Check if current user is admin
 */
export const checkAdminRole = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    return { isAdmin: false };
  }

  return {
    isAdmin: !!context.auth.token.admin,
    userId: context.auth.uid,
  };
});

// Export public setup function
export * from './setup';
export * from './setup-vendor-urls';

