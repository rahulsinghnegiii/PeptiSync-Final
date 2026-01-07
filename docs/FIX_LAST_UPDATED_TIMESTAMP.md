# Fix: "Last Updated: Unknown" in Scraper Configuration

## Problem
The "Last updated" field in the Scraper Configuration tab was showing "Unknown" instead of the actual timestamp.

## Root Cause
When Firebase Cloud Functions return Firestore data, Timestamp objects get **serialized** to plain JavaScript objects with `_seconds` and `_nanoseconds` properties. They lose the `toDate()` method.

**Before:**
```typescript
// This doesn't work with Cloud Function responses:
config.last_updated?.toDate ? new Date(config.last_updated.toDate()).toLocaleString() : 'Unknown'
```

## Solution
Created a robust `formatLastUpdated()` helper function that handles multiple timestamp formats:

```typescript
function formatLastUpdated(timestamp: any): string {
  if (!timestamp) return 'Unknown';
  
  try {
    // Handle serialized Firestore timestamp (from Cloud Functions)
    if (timestamp._seconds !== undefined) {
      const date = new Date(timestamp._seconds * 1000);
      return date.toLocaleString();
    }
    
    // Handle Firestore Timestamp object with toDate()
    if (timestamp.toDate && typeof timestamp.toDate === 'function') {
      return timestamp.toDate().toLocaleString();
    }
    
    // Handle Date object
    if (timestamp instanceof Date) {
      return timestamp.toLocaleString();
    }
    
    // Handle ISO string
    if (typeof timestamp === 'string') {
      return new Date(timestamp).toLocaleString();
    }
    
    return 'Unknown';
  } catch (error) {
    console.error('Error formatting timestamp:', error);
    return 'Unknown';
  }
}
```

## Result
- ✅ Shows actual date/time when URLs were last saved
- ✅ Handles all timestamp formats (Cloud Function serialized, Firestore Timestamp, Date, ISO string)
- ✅ Graceful fallback to "Unknown" if timestamp is missing or invalid
- ✅ No TypeScript errors

## Example Output
**Before:** `Last updated: Unknown`  
**After:** `Last updated: 1/4/2026, 10:30:45 PM`

---

## Files Modified
- `src/components/admin/vendorComparison/ScraperConfigurationTab.tsx`

## Technical Notes
This is a common issue when using Firebase Cloud Functions with Firestore. The serialization process converts Timestamps to plain objects for JSON transmission. The solution handles this by checking for the `_seconds` property which is always present in serialized Firestore Timestamps.

