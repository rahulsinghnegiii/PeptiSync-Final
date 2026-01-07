# Manual Cloud Scheduler Setup

If the Cloud Scheduler job wasn't auto-created, follow these steps:

## Option 1: Use Firebase CLI (Recommended)

```bash
# Delete and redeploy to force recreation
firebase functions:delete dailyScraperJob --project peptisync --force
firebase deploy --only functions:dailyScraperJob --project peptisync
```

## Option 2: Manual Creation via Console

1. Go to: https://console.cloud.google.com/cloudscheduler?project=peptisync
2. Click **"CREATE JOB"**
3. Configure:
   - **Name:** `firebase-schedule-dailyScraperJob-us-central1`
   - **Region:** `us-central1`
   - **Frequency:** `0 3 * * *` (cron format)
   - **Timezone:** `Coordinated Universal Time (UTC)`
   
4. **Target type:** Pub/Sub
   - **Topic:** `firebase-schedule-dailyScraperJob-us-central1`
   - **Message body:** (leave empty or use `{}`)

5. Click **"CREATE"**

## Option 3: Use gcloud CLI

```bash
gcloud scheduler jobs create pubsub firebase-schedule-dailyScraperJob-us-central1 \
  --location=us-central1 \
  --schedule="0 3 * * *" \
  --time-zone="UTC" \
  --topic=firebase-schedule-dailyScraperJob-us-central1 \
  --message-body="{}" \
  --project=peptisync
```

## Verification

After creation, verify:

1. **Check Cloud Scheduler Console:**
   - Job shows as "Enabled" (green checkmark)
   - Next run time is displayed
   - Last run status (after first run)

2. **Check Function Logs:**
   - Go to: https://console.firebase.google.com/project/peptisync/logs
   - Filter by function: `dailyScraperJob`
   - Look for: `[Scheduled] Starting daily scraper job...`

3. **Check Scraper Jobs:**
   - Go to your app: Admin Panel → Vendor Comparison → Monitoring
   - Look for jobs with Trigger = "Scheduled"

## Troubleshooting

### Issue: "Permission denied" error
**Solution:** Enable Cloud Scheduler API:
```bash
gcloud services enable cloudscheduler.googleapis.com --project=peptisync
```

Or via Console:
- https://console.cloud.google.com/apis/library/cloudscheduler.googleapis.com?project=peptisync
- Click "ENABLE"

### Issue: Job exists but never runs
**Solution:** Check if it's paused:
1. Go to Cloud Scheduler Console
2. Select the job
3. If status shows "Paused", click "RESUME"

### Issue: Job runs but function times out
**Solution:** Already fixed! Function now has:
- Timeout: 540 seconds (9 minutes)
- Memory: 1GB

### Issue: No logs appearing
**Solution:** Check Pub/Sub topic exists:
1. Go to: https://console.cloud.google.com/cloudpubsub/topic/list?project=peptisync
2. Look for: `firebase-schedule-dailyScraperJob-us-central1`
3. If missing, redeploy the function

## Manual Test

To manually trigger the scheduled function (for testing):

1. Go to Cloud Scheduler Console
2. Select the job: `firebase-schedule-dailyScraperJob-us-central1`
3. Click "FORCE RUN"
4. Check logs immediately in Firebase Console

## Expected Schedule

- **Frequency:** Every day at 3:00 AM UTC
- **Your local time conversions:**
  - EST (UTC-5): 10:00 PM previous day
  - PST (UTC-8): 7:00 PM previous day
  - GMT+1: 4:00 AM same day
  - IST (UTC+5:30): 8:30 AM same day
  - JST (UTC+9): 12:00 PM (noon) same day

## Quick Status Check

Run this command to see the job status:

```bash
gcloud scheduler jobs describe firebase-schedule-dailyScraperJob-us-central1 \
  --location=us-central1 \
  --project=peptisync
```

Look for:
- `state: ENABLED` (not PAUSED)
- `schedule: '0 3 * * *'`
- `timeZone: 'UTC'`
- `lastAttemptTime:` should show recent run time (after first run)

