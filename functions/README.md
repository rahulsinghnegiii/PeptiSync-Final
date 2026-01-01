# Firebase Cloud Functions - Vendor Comparison V1

## Overview

This directory contains Firebase Cloud Functions for PeptiSync Vendor Comparison V1 automation.

### Functions

#### 1. `dailyTimestampUpdate` (Scheduled)
- **Schedule**: Daily at 2:00 AM UTC
- **Purpose**: Updates `last_price_check` timestamp on all active verified offers
- **Scope**: Timestamps only (no scraping, OCR, or price validation in V1)

#### 2. `manualTimestampUpdate` (Callable)
- **Trigger**: Manual HTTP call by admin
- **Purpose**: Test timestamp update without waiting for schedule
- **Auth**: Admin only

#### 3. `getAutomationJobs` (Callable)
- **Trigger**: HTTP call by admin
- **Purpose**: Fetch automation job history
- **Auth**: Admin only

---

## Setup

### 1. Install Dependencies

```bash
cd functions
npm install
```

### 2. Build TypeScript

```bash
npm run build
```

### 3. Test Locally (Optional)

```bash
npm run serve
```

This starts the Firebase emulator for local testing.

---

## Deployment

### Deploy All Functions

```bash
firebase deploy --only functions
```

### Deploy Specific Function

```bash
firebase deploy --only functions:dailyTimestampUpdate
firebase deploy --only functions:manualTimestampUpdate
firebase deploy --only functions:getAutomationJobs
```

---

## Testing

### Test Scheduled Function Locally

```bash
firebase emulators:start --only functions
# Then trigger the function via the emulator UI
```

### Test Manual Trigger

From your frontend (admin panel):

```typescript
import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();
const manualUpdate = httpsCallable(functions, 'manualTimestampUpdate');

const result = await manualUpdate();
console.log(result.data);
```

### View Logs

```bash
firebase functions:log
```

Or in Firebase Console: **Functions** → **Logs**

---

## Automation Job Logs

Each run creates a document in `vendor_automation_jobs`:

```typescript
{
  job_type: 'daily_timestamp_update',
  status: 'completed' | 'failed',
  started_at: Timestamp,
  completed_at: Timestamp,
  offers_processed: number,
  execution_time_ms: number,
  errors?: string[]
}
```

View job history in the admin panel or via `getAutomationJobs` function.

---

## V1 Scope

**What V1 Automation Does:**
- ✅ Updates `last_price_check` timestamps daily
- ✅ Logs job status to Firestore
- ✅ Batch processing for efficiency

**What V1 Automation Does NOT Do:**
- ❌ Web scraping
- ❌ OCR for PDFs
- ❌ Price validation
- ❌ External API calls
- ❌ Email notifications

These features are planned for V2 and will be added without refactoring V1 infrastructure.

---

## Monitoring

### Check Job Status

1. Firebase Console → **Firestore** → `vendor_automation_jobs`
2. Sort by `started_at` descending
3. Check `status` field (completed/failed)
4. Review `errors` array if failed

### Set Up Alerts (Optional)

In Firebase Console:
1. **Functions** → Select function
2. **Metrics** → Set up alerts
3. Configure email/Slack notifications

---

## Troubleshooting

### Function Not Running

- Check schedule: `firebase functions:log`
- Verify timezone: Scheduled for 2:00 AM UTC
- Check Firebase billing: Cloud Scheduler requires Blaze plan

### Permission Errors

- Ensure Firebase Admin is initialized
- Check Firestore Security Rules
- Verify IAM permissions

### Timeout Errors

- Current timeout: 60 seconds (default)
- Increase if needed: `{ timeoutSeconds: 300 }` in function definition
- Batch size: 500 offers per batch (Firestore limit)

---

## Cost Estimation

### V1 Automation Costs (Daily Run)

Assuming ~1000 verified offers:
- **Function Invocations**: 1/day = ~30/month
- **Firestore Writes**: ~1000/day = ~30,000/month
- **Execution Time**: ~5 seconds/run

**Estimated Cost**: < $1/month (well within free tier)

---

## Future Enhancements (V2)

- Automated web scraping (GetGoBii, custom scrapers)
- OCR for PDF price lists
- Price validation and anomaly detection
- Email alerts for price changes
- API integrations with data providers
- Webhook support for real-time updates

All V2 features will extend the current architecture without refactoring.

---

## Support

For issues or questions:
1. Check Firebase Functions logs
2. Review `vendor_automation_jobs` collection
3. Contact development team

