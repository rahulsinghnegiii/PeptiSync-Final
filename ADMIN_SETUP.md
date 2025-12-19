# Admin Setup Guide

## Setting Admin Email

To configure the admin email for PeptiSync, add the following to your `.env` file:

```env
# Admin Configuration
VITE_ADMIN_EMAIL=rahulsinghnegi25561@gmail.com
```

## Complete .env File Example

Your `.env` file should contain:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Admin Configuration
VITE_ADMIN_EMAIL=rahulsinghnegi25561@gmail.com

# Application URL
VITE_APP_URL=http://localhost:8080
```

## How It Works

When a user with the email `rahulsinghnegi25561@gmail.com` signs up or logs in:
1. The system automatically detects this is the admin email
2. Admin role is automatically granted
3. User gets immediate access to the admin panel at `/admin`

## Manual Admin Setup (Alternative Method)

If you prefer to manually grant admin access via Firebase Console:

1. Go to Firebase Console
2. Navigate to Firestore Database
3. Find the `users` collection
4. Locate the user document for `rahulsinghnegi25561@gmail.com`
5. Add/update the `role` field to `"admin"`

Or use Firebase CLI:
```bash
# In Firebase Console SQL Editor or using Admin SDK
# Update user role to admin
```

## Verifying Admin Access

1. Sign in with `rahulsinghnegi25561@gmail.com`
2. Navigate to `/dashboard`
3. You should see an "Admin Panel" button in the header
4. Click it to access `/admin`
5. You should see Analytics and Users tabs

## Security Notes

- The admin email is checked on every authentication
- Admin access is granted automatically for the configured email
- Make sure to keep your `.env` file secure and never commit it to git
- The `.env` file is already in `.gitignore`

