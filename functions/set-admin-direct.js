const admin = require('firebase-admin');

// Initialize with project ID (no service account needed for emulator/local dev)
admin.initializeApp({
  projectId: 'peptisync'
});

const email = 'rahulsinghnegi25561@gmail.com';

async function setAdmin() {
  try {
    console.log(`Looking up user: ${email}`);
    const user = await admin.auth().getUserByEmail(email);
    console.log(`Found user: ${user.uid}`);
    
    await admin.auth().setCustomUserClaims(user.uid, { admin: true });
    console.log('✅ Admin custom claim set');
    
    await admin.firestore().collection('userRoles').doc(user.uid).set({
      role: 'admin',
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
    console.log('✅ Firestore userRoles updated');
    
    console.log('\n🎉 SUCCESS!');
    console.log('IMPORTANT: Log out and back in to refresh your token!');
  } catch (error) {
    console.error('Error:', error.message);
    if (error.code === 'auth/user-not-found') {
      console.log('\n⚠️  User not found. Please:');
      console.log('1. Make sure you have created an account in the app');
      console.log('2. Check you are using the correct email');
      console.log('3. Try logging in to the app first');
    }
  }
  process.exit(0);
}

setAdmin();

