/**
 * One-time script to set admin role
 * Run this with: node set-admin.js YOUR_EMAIL@example.com
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const email = process.argv[2];

if (!email) {
  console.error('❌ Please provide your email:');
  console.error('   node set-admin.js your@email.com');
  process.exit(1);
}

async function setAdminRole() {
  try {
    console.log(`🔍 Looking up user: ${email}`);
    
    // Get user by email
    const user = await admin.auth().getUserByEmail(email);
    console.log(`✅ Found user: ${user.uid}`);
    
    // Set custom claim
    await admin.auth().setCustomUserClaims(user.uid, { admin: true });
    console.log(`✅ Set admin custom claim for ${user.uid}`);
    
    // Write to Firestore
    await admin.firestore().collection('userRoles').doc(user.uid).set({
      role: 'admin',
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
    console.log(`✅ Updated Firestore userRoles collection`);
    
    console.log('\n🎉 SUCCESS! You are now an admin.');
    console.log('⚠️  IMPORTANT: Log out and back in to refresh your auth token!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

setAdminRole();

