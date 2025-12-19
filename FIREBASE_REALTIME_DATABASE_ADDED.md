# Firebase Realtime Database Support Added

## Issue Fixed

**Error**: `The requested module '/src/lib/firebase.ts' does not provide an export named 'getFirebaseDatabase'`

## Solution

Added Firebase Realtime Database support alongside Firestore for real-time features.

## Changes Made

### 1. Updated `src/lib/firebase.ts`

Added:
- Import for `getDatabase` and `connectDatabaseEmulator`
- Export `database` instance (Realtime Database)
- Helper functions:
  - `getFirebaseDatabase()` - Returns the Realtime Database instance
  - `isFirebaseAvailable()` - Checks if Firebase is properly configured

### 2. Updated `firebase.json`

Added Realtime Database configuration:
- Database rules file reference
- Database emulator on port 9000

### 3. Created `database.rules.json`

Security rules for Realtime Database:
- **vendorPrices**: Public read, authenticated write
- **foundingUserCounter**: Public read, admin write only
- **contactSubmissions**: Admin read, public write

## Firebase Services Now Available

1. **Firebase Authentication** - User auth
2. **Cloud Firestore** - Main database (NoSQL document store)
3. **Realtime Database** - Real-time data sync
4. **Firebase Storage** - File storage
5. **Cloud Functions** - Serverless functions
6. **Analytics** - Usage analytics

## When to Use Each Database

### Use Firestore for:
- Complex queries with multiple filters
- Structured data with relationships
- Offline support
- Better scalability
- Most CRUD operations

**Examples**: Products, Orders, Users, Reviews, Cart Items

### Use Realtime Database for:
- Simple real-time features
- Presence detection
- Live counters
- Collaborative features
- Lower latency requirements

**Examples**: Vendor prices, Founding user counter, Contact submissions

## Files Using Realtime Database

1. `src/hooks/useVendorPrices.ts` - Real-time vendor price updates
2. `src/hooks/useFoundingUserCounter.ts` - Live founding user counter
3. `src/components/ContactForm.tsx` - Contact form submissions

## Deployment

### Deploy Database Rules
```bash
firebase deploy --only database
```

### Deploy All Rules
```bash
firebase deploy --only firestore:rules,database,storage
```

## Environment Variables

No additional environment variables needed. The Realtime Database uses the same Firebase project configuration.

## Testing

1. **Start dev server**: `npm run dev`
2. **Test contact form**: Submit a message
3. **Check Firebase Console**: 
   - Go to Realtime Database section
   - Verify `contactSubmissions` node exists
4. **Test vendor prices**: If implemented in UI
5. **Test founding counter**: If displayed on homepage

## Emulator Support

If using Firebase emulators:

```bash
firebase emulators:start
```

Realtime Database emulator runs on port 9000.

## Data Structure

### Realtime Database Structure
```
{
  "vendorPrices": {
    "peptide-id-1": {
      "vendor-id-1": {
        "price": 99.99,
        "url": "https://vendor.com/product",
        "lastUpdated": 1234567890,
        "submittedBy": "user-id"
      }
    }
  },
  "foundingUserCounter": {
    "current": 127,
    "total": 500,
    "lastUpdated": 1234567890
  },
  "contactSubmissions": {
    "submission-id-1": {
      "name": "John Doe",
      "email": "john@example.com",
      "subject": "Question",
      "message": "Hello...",
      "timestamp": 1234567890,
      "status": "new"
    }
  }
}
```

## Migration Notes

- Firestore and Realtime Database can coexist
- No data migration needed between them
- Each serves different purposes
- Use Firestore as primary database
- Use Realtime Database for specific real-time features

## Next Steps

1. ✅ Error fixed - app should now load
2. Test all real-time features
3. Populate initial data if needed
4. Set up admin users for counter management
5. Configure email notifications for contact submissions

---

**Status**: ✅ Fixed and Ready to Use

