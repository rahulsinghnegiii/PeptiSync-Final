/**
 * TEMPORARY: Set admin custom claim via Cloud Function
 * This modifies the setAdminRole function to allow initial setup
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

/**
 * Set admin role for a user
 * TEMPORARY: Allows unauthenticated call for initial admin setup
 */
export const setAdminRolePublic = functions.https.onRequest(async (req, res) => {
  // CORS headers for development
  res.set('Access-Control-Allow-Origin', '*');
  
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'POST');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.status(204).send('');
    return;
  }

  const { email } = req.body;

  if (!email) {
    res.status(400).json({ error: 'Email required' });
    return;
  }

  try {
    console.log(`[SetAdminRolePublic] Setting admin for: ${email}`);
    
    // Get user by email
    const user = await admin.auth().getUserByEmail(email);
    
    // Set custom claim
    await admin.auth().setCustomUserClaims(user.uid, { admin: true });
    
    // Also write to Firestore
    await admin.firestore().collection('userRoles').doc(user.uid).set({
      role: 'admin',
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    console.log(`[SetAdminRolePublic] Success for ${user.uid}`);

    res.json({
      success: true,
      message: `Admin role set for ${email}`,
      uid: user.uid,
    });
  } catch (error: any) {
    console.error('[SetAdminRolePublic] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

