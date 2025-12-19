# Firebase Collections Schema

This document outlines the Firebase/Firestore database structure used by the PeptiSync application. The website reads from these collections to display vendor pricing, user statistics, and other data.

## Field Naming Convention

Firestore uses **snake_case** for field names:
- `display_name`, `photo_url`, `plan_tier`, `created_time`
- `peptide_name`, `vendor_name`, `price_usd`, `approval_status`
- `user_id` (stored as DocumentReference to `users/{uid}`)

## Core Collections

### Collection: `users`
**Path:** `users/{uid}`

User profiles and settings.

**Key Fields:**
- `uid` (string) - Firebase Auth user ID
- `email` (string) - User email address
- `display_name` (string) - User's display name
- `photo_url` (string) - Profile photo URL
- `phone_number` (string) - Optional phone number
- `plan_tier` (string) - Subscription tier: 'free', 'basic', 'pro', 'pro_plus', 'elite'
- `is_admin` (boolean) - Admin access flag
- `is_moderator` (boolean) - Can approve/reject vendor pricing submissions
- `created_time` (Timestamp) - Account creation date
- `last_login` (Timestamp) - Last login timestamp
- `trial_ends_at` (Timestamp, nullable) - Trial expiration date
- `onboarding_complete` (boolean) - Onboarding status
- `storage_used_mb` (number) - Storage usage in MB
- `referral_code` (string) - User's referral code
- `referred_by` (string) - Referrer's code
- `goals` (array of strings) - User's wellness goals
- `notif_enabled_global` (boolean) - Global notification setting
- `notif_calendar_events` (boolean) - Calendar event notifications
- `notif_symptom_check` (boolean) - Symptom reminder notifications
- `notif_low_supply_alert` (boolean) - Low stock alert notifications
- `notif_marketing_updates` (boolean) - Marketing email opt-in

### Collection: `vendor_pricing_submissions`
**Path:** `vendor_pricing_submissions/{id}`

Vendor pricing submissions from users with moderation workflow.

**Key Fields:**
- `id` (string) - Document ID
- `user_id` (DocumentReference) - Reference to `users/{uid}`
- `peptide_name` (string) - Name of the peptide
- `peptide_id` (DocumentReference, nullable) - Reference to `peptides/{id}`
- `vendor_name` (string) - Vendor name
- `price_usd` (number) - Price in USD
- `shipping_usd` (number) - Shipping cost in USD
- `size` (string) - Product size (e.g., "5mg", "10mg")
- `shipping_origin` (string) - Origin country (e.g., "USA", "China")
- `discount_code` (string) - Optional discount code
- `user_notes` (string) - User's notes about the pricing
- `screenshot_url` (string, nullable) - Firebase Storage URL for screenshot
- `lab_test_results_url` (string, nullable) - Firebase Storage URL for lab results
- `price_verification_url` (string, nullable) - URL or file for price verification
- `approval_status` (string) - Status: 'pending', 'approved', 'rejected'
- `rejection_reason` (string, nullable) - Reason if rejected
- `approved_by` (DocumentReference, nullable) - Reference to moderator `users/{uid}`
- `auto_approved` (boolean) - Whether auto-approved by system
- `submitted_at` (Timestamp) - Submission timestamp
- `reviewed_at` (Timestamp, nullable) - Review timestamp

**Auto-Approval Criteria:**
1. Vendor exists in approved vendors list
2. Peptide name matches existing peptides
3. Price is within reasonable range ($10 - $500)
4. Screenshot is uploaded

### Collection: `peptides`
**Path:** `peptides/{id}`

Master database of peptides (admin-managed).

**Key Fields:**
- `id` (string) - Document ID
- `name` (string) - Peptide name
- `description` (string) - Detailed description
- `category` (string) - Category classification
- `dosage` (string) - Recommended dosage
- `reconstitution_instructions` (string) - How to reconstitute
- `storage_requirements` (string) - Storage instructions
- `form` (string) - Form (e.g., "powder", "liquid")
- `potency_dosage_range` (array of strings) - Dosage range options
- `approved` (boolean) - Approval status
- `rejected` (boolean) - Rejection status
- `created_at` (Timestamp) - Creation date
- `updated_at` (Timestamp) - Last update date

### Collection: `user_peptides`
**Path:** `user_peptides/{id}`

User's personal peptide inventory.

**Key Fields:**
- `id` (string) - Document ID
- `user_id` (DocumentReference) - Reference to `users/{uid}`
- `name` (string) - Peptide name
- `peptide_id` (DocumentReference, nullable) - Reference to `peptides/{id}`
- `quantity` (number) - Current quantity
- `unit` (string) - Unit of measurement (e.g., "mg")
- `concentration` (number) - Concentration value
- `concentration_unit` (string) - Concentration unit (e.g., "mg/ml")
- `low_stock_threshold` (number) - Alert threshold
- `batch_number` (string) - Batch/lot number
- `is_active` (boolean) - Active vial flag (FIFO tracking)
- `vendor` (string) - Vendor name
- `price` (number) - Purchase price
- `currency` (string) - Currency code
- `storage` (string) - Storage location
- `notes` (string) - User notes
- `is_archived` (boolean) - Archive status
- `purchase_date` (Timestamp, nullable) - Purchase date
- `expiry_date` (Timestamp, nullable) - Expiration date
- `created_at` (Timestamp) - Creation date

### Collection: `peptide_library`
**Path:** `peptide_library/{id}`

Curated peptide information for educational purposes (NOT a JSON file).

**Key Fields:**
- `id` (string) - Document ID
- `name` (string) - Peptide name
- `category` (string) - Category (Weight Loss, Recovery, Anti-aging, etc.)
- `short_description` (string) - Brief description
- `description` (string) - Full description
- `mechanism` (string) - Mechanism of action
- `common_doses` (string) - Common dosage information
- `protocol` (string) - Usage protocol
- `side_effects` (string) - Known side effects
- `warnings` (string) - Warnings and precautions
- `interactions` (string) - Drug interactions
- `injection_areas` (string) - Recommended injection sites
- `is_visible` (boolean) - Visibility flag
- `created_at` (Timestamp) - Creation date
- `updated_at` (Timestamp) - Last update date
- `created_by` (string) - Creator user ID

**Peptide Categories:**
- Weight Loss
- Recovery
- Anti-aging
- Performance
- Growth
- Immunity
- Cognitive
- GH Axis
- Metabolic
- Sexual Wellness

### Collection: `doses`
**Path:** `doses/{id}`

Dose logs and tracking.

**Key Fields:**
- `id` (string) - Document ID
- `user_id` (DocumentReference) - Reference to `users/{uid}`
- `peptide_id` (DocumentReference) - Reference to `peptides/{id}`
- `peptide_name` (string) - Peptide name
- `user_peptide_id` (DocumentReference, nullable) - Reference to specific vial
- `stack_id` (DocumentReference, nullable) - Reference to `stack_templates/{id}`
- `scheduled_at` (Timestamp) - Scheduled time
- `taken_at` (Timestamp, nullable) - Actual time taken
- `dosage` (string) - Dosage amount
- `unit` (string) - Unit of measurement
- `notes` (string) - User notes
- `completed` (boolean) - Completion status
- `skipped` (boolean) - Skipped flag
- `inventory_deducted` (boolean) - Inventory deduction flag
- `injection_site` (string) - Injection location
- `side_effects` (array of strings) - Reported side effects
- `created_at` (Timestamp) - Creation date

### Collection: `stack_templates`
**Path:** `stack_templates/{id}`

Peptide stack configurations.

**Key Fields:**
- `id` (string) - Document ID
- `user_id` (DocumentReference) - Reference to `users/{uid}`
- `name` (string) - Stack name
- `description` (string) - Stack description
- `peptides` (array) - Array of peptide configurations
- `is_active` (boolean) - Active status
- `created_at` (Timestamp) - Creation date

### Collection: `symptoms`
**Path:** `symptoms/{id}`

Symptom tracking.

**Key Fields:**
- `id` (string) - Document ID
- `user_id` (DocumentReference) - Reference to `users/{uid}`
- `symptom_type` (string) - Type of symptom
- `severity` (number) - Severity level (1-10)
- `notes` (string) - Additional notes
- `logged_at` (Timestamp) - Log timestamp
- `created_at` (Timestamp) - Creation date

### Collection: `progress_photos`
**Path:** `progress_photos/{id}`

Progress photo uploads.

**Key Fields:**
- `id` (string) - Document ID
- `user_id` (DocumentReference) - Reference to `users/{uid}`
- `image_url` (string) - Firebase Storage URL
- `thumbnail_url` (string, nullable) - Thumbnail URL
- `notes` (string) - Photo notes
- `taken_at` (Timestamp) - Photo date
- `created_at` (Timestamp) - Upload date

### Collection: `lab_results`
**Path:** `lab_results/{id}`

Laboratory test results.

**Key Fields:**
- `id` (string) - Document ID
- `user_id` (DocumentReference) - Reference to `users/{uid}`
- `test_name` (string) - Test name
- `result_value` (string) - Test result
- `unit` (string) - Unit of measurement
- `reference_range` (string) - Normal range
- `file_url` (string, nullable) - Firebase Storage URL for lab report
- `test_date` (Timestamp) - Test date
- `created_at` (Timestamp) - Creation date

### Collection: `notes`
**Path:** `notes/{id}`

User notes.

**Key Fields:**
- `id` (string) - Document ID
- `user_id` (DocumentReference) - Reference to `users/{uid}`
- `title` (string) - Note title
- `content` (string) - Note content
- `created_at` (Timestamp) - Creation date
- `updated_at` (Timestamp) - Last update date

### Collection: `user_goals`
**Path:** `user_goals/{id}`

User goals and tracking.

**Key Fields:**
- `id` (string) - Document ID
- `user_id` (DocumentReference) - Reference to `users/{uid}`
- `goal_type` (string) - Type of goal
- `target_value` (number) - Target value
- `current_value` (number) - Current progress
- `unit` (string) - Unit of measurement
- `deadline` (Timestamp, nullable) - Goal deadline
- `completed` (boolean) - Completion status
- `created_at` (Timestamp) - Creation date

### Collection: `achievements`
**Path:** `achievements/{id}`

User achievements and milestones.

**Key Fields:**
- `id` (string) - Document ID
- `user_id` (DocumentReference) - Reference to `users/{uid}`
- `achievement_type` (string) - Type of achievement
- `title` (string) - Achievement title
- `description` (string) - Achievement description
- `unlocked_at` (Timestamp) - Unlock timestamp
- `created_at` (Timestamp) - Creation date

### Collection: `referrals`
**Path:** `referrals/{id}`

Referral tracking.

**Key Fields:**
- `id` (string) - Document ID
- `referrer_id` (DocumentReference) - Reference to referrer `users/{uid}`
- `referred_id` (DocumentReference) - Reference to referred user `users/{uid}`
- `referral_code` (string) - Referral code used
- `status` (string) - Status (pending, completed, etc.)
- `created_at` (Timestamp) - Creation date

### Collection: `notifications`
**Path:** `notifications/{id}`

Push notifications.

**Key Fields:**
- `id` (string) - Document ID
- `user_id` (DocumentReference) - Reference to `users/{uid}`
- `title` (string) - Notification title
- `body` (string) - Notification body
- `type` (string) - Notification type
- `read` (boolean) - Read status
- `created_at` (Timestamp) - Creation date

### Collection: `planned_doses`
**Path:** `planned_doses/{id}`

Scheduled/planned doses.

**Key Fields:**
- `id` (string) - Document ID
- `user_id` (DocumentReference) - Reference to `users/{uid}`
- `peptide_id` (DocumentReference) - Reference to `peptides/{id}`
- `scheduled_at` (Timestamp) - Scheduled time
- `dosage` (string) - Dosage amount
- `unit` (string) - Unit of measurement
- `created_at` (Timestamp) - Creation date

### Collection: `inventory_transactions`
**Path:** `inventory_transactions/{id}`

Inventory change logs.

**Key Fields:**
- `id` (string) - Document ID
- `user_id` (DocumentReference) - Reference to `users/{uid}`
- `user_peptide_id` (DocumentReference) - Reference to `user_peptides/{id}`
- `transaction_type` (string) - Type (add, subtract, etc.)
- `quantity_change` (number) - Quantity changed
- `reason` (string) - Transaction reason
- `created_at` (Timestamp) - Transaction date

## Approved Vendors List

Hardcoded in the app, can also be stored in `approved_vendors` collection:

- Peptide Sciences
- Limitless Life
- Xpeptides
- Peptide Pros
- Core Peptides
- Tailor Made Compounding
- Empower Pharmacy
- Hallandale Pharmacy
- Wells Pharmacy Network

## Blog Posts (If Implemented)

### Collection: `blog_posts` (Optional)
**Path:** `blog_posts/{id}`

**Expected Fields:**
- `id` (string) - Document ID
- `title` (string) - Post title
- `slug` (string) - URL slug
- `author` (string) - Author name
- `date` (Timestamp) - Publication date
- `category` (string) - Post category
- `tags` (array of strings) - Post tags
- `image_url` (string) - Featured image URL
- `excerpt` (string) - Short excerpt
- `content` (string) - Full content (Markdown)
- `is_featured` (boolean) - Featured flag
- `views` (number) - View count
- `created_at` (Timestamp) - Creation date
- `updated_at` (Timestamp) - Last update date

## Data Access Patterns

### Website Read Operations

1. **Vendor Pricing (Public)**
   - Query: `vendor_pricing_submissions` where `approval_status == 'approved'`
   - Sort by: `peptide_name`, then `price_usd`

2. **Vendor Moderation (Admin)**
   - Query: `vendor_pricing_submissions` where `approval_status == 'pending'`
   - Sort by: `submitted_at` (newest first)

3. **User Statistics (Anonymized)**
   - Count documents in `users` collection
   - Count documents in `doses` collection
   - Count documents in `peptides` where `approved == true`

4. **Blog Posts (If Implemented)**
   - Query: `blog_posts` order by `date` descending
   - Filter by category or tags as needed

## Security Considerations

1. **Firestore Security Rules**: Ensure proper read/write permissions are set
2. **User Data Privacy**: Never expose personal health data publicly
3. **Admin Access**: Verify `is_admin` or `is_moderator` flags before allowing moderation
4. **DocumentReferences**: Always extract `.id` property when reading references
5. **Timestamps**: Convert Firestore Timestamps to JavaScript Date objects

## Notes

- **No Peptide Library JSON**: The app fetches peptide library data from the `peptide_library` Firestore collection, NOT from a JSON file
- **Field Conversion**: Firestore uses snake_case, but TypeScript models use camelCase - ensure proper conversion
- **Reference Handling**: User IDs and other references are stored as Firestore DocumentReferences, not plain strings
- **Timestamp Handling**: Convert Firestore Timestamps to JavaScript Date objects or ISO strings for use in React components

