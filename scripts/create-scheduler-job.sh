#!/bin/bash

# Create Cloud Scheduler job for dailyScraperJob
# Run this if the job wasn't auto-created during deployment

gcloud scheduler jobs create pubsub firebase-schedule-dailyScraperJob-us-central1 \
  --location=us-central1 \
  --schedule="0 3 * * *" \
  --time-zone="UTC" \
  --topic=firebase-schedule-dailyScraperJob-us-central1 \
  --message-body="{}" \
  --project=peptisync

echo "✅ Cloud Scheduler job created!"
echo "Next run: Tomorrow at 3:00 AM UTC"

