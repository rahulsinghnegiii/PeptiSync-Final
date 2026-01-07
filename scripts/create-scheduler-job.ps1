# Create Cloud Scheduler job for dailyScraperJob
# Run this if the job wasn't auto-created during deployment

Write-Host "Creating Cloud Scheduler job..." -ForegroundColor Cyan

gcloud scheduler jobs create pubsub firebase-schedule-dailyScraperJob-us-central1 `
  --location=us-central1 `
  --schedule="0 3 * * *" `
  --time-zone="UTC" `
  --topic=firebase-schedule-dailyScraperJob-us-central1 `
  --message-body="{}" `
  --project=peptisync

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Cloud Scheduler job created!" -ForegroundColor Green
    Write-Host "Next run: Tomorrow at 3:00 AM UTC" -ForegroundColor Yellow
} else {
    Write-Host "❌ Failed to create job. Check if it already exists or if you need to enable Cloud Scheduler API." -ForegroundColor Red
    Write-Host "To check existing jobs, visit:" -ForegroundColor Yellow
    Write-Host "https://console.cloud.google.com/cloudscheduler?project=peptisync" -ForegroundColor Cyan
}

