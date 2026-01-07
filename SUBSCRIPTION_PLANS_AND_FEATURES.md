# 🎯 PeptiSync Subscription Plans & Feature Gating

**Last Updated:** January 2, 2025  
**Version:** 1.0.1

This document provides a complete overview of PeptiSync's subscription tiers, features, limits, and how the feature gating system works throughout the app.

---

## 📊 Subscription Tiers Overview

PeptiSync uses **RevenueCat** for subscription management with **Stripe** for payment processing. All subscriptions are managed through native in-app billing on iOS/Android and Stripe Checkout for web.

### Plan Hierarchy

```
Free → Basic → Pro → Pro+ → Elite
```

Each higher tier includes all features from lower tiers, plus additional premium features.

---

## 💰 Pricing Structure

| Plan | Monthly Price | Annual Price | Savings | Entitlement ID | Notes |
|------|--------------|--------------|---------|----------------|-------|
| **Free** | $0 | $0 | - | `free_access` | Default tier for all users |
| **Basic** | $4.99 | $54.99/yr | ~17% | `basic_access` | Essential tracking features |
| **Pro** | $9.99 | $99.99/yr | ~17% | `pro_access` | Advanced analytics & unlimited |
| **Pro+** | $19.99 | $199.99/yr | ~17% | `pro_plus_access` | Vendor pricing & batch tracking |
| **Elite** | - | $179.99/yr | - | `elite_access` | Annual only, max 300 users |

### Product IDs (RevenueCat)

- **Free:** `free_plan`
- **Basic:** `basic_monthly`, `basic_yearly`
- **Pro:** `pro_monthly`, `pro_yearly`
- **Pro+:** `pro_plus_monthly`, `pro_plus_yearly`
- **Elite:** `elite_annual`

---

## 🎁 Free Plan Features

### ✅ What's Included

**Core Tracking:**
- ✓ Track up to **3 peptides**
- ✓ Log injections with dates and times
- ✓ Basic calendar view (current month)
- ✓ Upload up to **5 progress photos per month**
- ✓ Create **1 stack template**
- ✓ Basic symptom logging (no severity tracking)
- ✓ Basic dose reminders

**Dashboard:**
- ✓ Today's doses
- ✓ Recent activity
- ✓ Current streak tracking

**Access:**
- ✓ Peptide library (view only)
- ✓ Safety & storage guidelines
- ✓ Community forum (view only)

### ❌ Limitations

- Limited to 3 active peptides
- 5 photos per month
- 1 stack template only
- No analytics or trends
- No data export
- No vendor pricing comparison
- No advanced reminders
- No body measurements
- No private notes

---

## 🔵 Basic Plan ($4.99/mo or $54.99/yr)

### ✅ All Free Features, Plus:

**Enhanced Tracking:**
- ✓ Track up to **5 peptides** (vs 3 in Free)
- ✓ Upload up to **20 progress photos per month** (vs 5 in Free)
- ✓ Create **3 stack templates** (vs 1 in Free)

**New Features:**
- ✓ **Reconstitution tracker** - Track mixing ratios and concentrations
- ✓ **3-month calendar view** - Extended calendar history
- ✓ **Symptom severity tracking** - Rate symptoms 1-10
- ✓ **Body measurement tracking** - Weight, body fat %, measurements
- ✓ **Private notes** - Add secure notes to doses and symptoms
- ✓ **Enhanced reminders** - Symptom check-ins and calendar reminders

**Required Feature Codes:**
- `reconstitution_tracker`
- `calendar_3month`
- `symptom_severity`
- `measurement_tracking`
- `private_notes`

---

## 🟣 Pro Plan ($9.99/mo or $99.99/yr)

### ✅ All Basic Features, Plus:

**Unlimited Access:**
- ✓ **Unlimited peptides** (no limit)
- ✓ **Unlimited progress photos** (no monthly limit)
- ✓ **Unlimited stack templates**

**Advanced Analytics:**
- ✓ **Analytics Hub** - Comprehensive analytics dashboard
- ✓ **Full calendar view** - Unlimited calendar history
- ✓ **Symptom trends** - Interactive symptom trend charts
- ✓ **Dosage trends** - Visualize dosing patterns over time
- ✓ **Weight trends** - Track weight changes with charts
- ✓ **Measurement trends** - Body measurement analytics
- ✓ **Calendar heatmap** - Activity visualization
- ✓ **Progress timeline** - Visual journey with photos and stats

**Supply Management:**
- ✓ **Supply inventory** - Track vials, doses remaining
- ✓ **Order tracker** - Track orders with status updates

**Advanced Features:**
- ✓ **Protocol library** - Save and reuse dosing protocols
- ✓ **Lab test uploads** - Upload and track lab results
- ✓ **Advanced reminders** - Smart reminders with customization

**Required Feature Codes:**
- `analytics`
- `calendar_full`
- `symptom_trends`
- `advanced_reminders`
- `supply_inventory`
- `order_tracker`
- `protocol_library`
- `test_uploads`

---

## 🟡 Pro+ Plan ($19.99/mo or $199.99/yr)

### ✅ All Pro Features, Plus:

**Vendor & Supply Features:**
- ✓ **Vendor pricing comparison** - Compare verified vendor prices
- ✓ **Submit vendor pricing** - Contribute pricing data
- ✓ **Batch tracking** - Track individual vials with batch numbers
- ✓ **Low supply alerts** - Automatic notifications when running low
- ✓ **Priority sync** - Faster cloud synchronization

**Required Feature Codes:**
- `vendor_pricing`
- `batch_tracking`
- `low_supply_alerts`
- `priority_sync`

---

## ⭐ Elite Plan ($179.99/yr - Annual Only)

### ✅ All Pro+ Features, Plus:

**Data & Insights:**
- ✓ **Data export** - Download all data as CSV/PDF
- ✓ **Advanced estimation engine** - AI-powered dosage predictions
- ✓ **Beta features** - Early access to new features

**Rewards & Support:**
- ✓ **Referral rewards system** - Earn credits by referring friends
- ✓ **Priority support** - Faster response times
- ✓ **Community forum moderation** - Influence and moderation tools

**Exclusive:**
- ✓ Limited to maximum 300 users
- ✓ Annual billing only
- ✓ Premium badge in profile

**Required Feature Codes:**
- `data_export`
- `referral_rewards`
- `estimation_engine`
- `beta_features`

---

## 🔒 Feature Gating System

### How Feature Gating Works

PeptiSync implements a robust feature gating system that checks user subscription status before allowing access to premium features.

### Implementation Details

**Location:** `lib/services/subscription_service.dart`

**Key Methods:**

1. **`canAccessFeature(userId, feature)`** - Async check with Firestore fetch
2. **`canAccessFeatureSync(user, feature)`** - Synchronous check (faster)
3. **`getRequiredPlan(feature)`** - Returns minimum plan needed

### Feature Check Examples

```dart
// Check if user can access analytics
bool hasAccess = await subscriptionService.canAccessFeature(userId, 'analytics');

// With user object (faster)
bool hasAccess = subscriptionService.canAccessFeatureSync(user, 'analytics');

// Get required plan for a feature
String plan = subscriptionService.getRequiredPlan('vendor_pricing'); // Returns 'pro_plus'
```

### Bypass Rules

**Admins and Moderators** bypass all feature checks:
- Admins have unlimited access to all features
- Moderators have unlimited access to all features
- This is checked at the start of every feature gate

### Quantitative Limits

Feature limits are defined in `lib/config/app_config.dart`:

```dart
// Peptide Limits
Free: 3 peptides
Basic: 5 peptides
Pro/Pro+/Elite: Unlimited (-1)

// Photo Limits (per month)
Free: 5 photos
Basic: 20 photos
Pro/Pro+/Elite: Unlimited (-1)

// Stack Template Limits
Free: 1 template
Basic: 3 templates
Pro/Pro+/Elite: Unlimited (-1)
```

### Checking Limits

```dart
// Check if user can add more peptides
bool canAdd = await subscriptionService.canAddPeptide(userId);

// Check if user can upload more photos this month
bool canUpload = await subscriptionService.canUploadPhoto(userId);

// Check if user can create more stack templates
bool canCreate = await subscriptionService.canAddStackTemplate(userId);
```

---

## 🎨 UI/UX for Feature Gating

### Locked Feature Display

When a user tries to access a premium feature, the app displays:

1. **Feature Locked Card** - Shows feature name, required plan, and "Upgrade" button
2. **Upgrade Modal** - Displays plan comparison and pricing
3. **Trial Offer Modal** - For users who haven't tried premium plans yet

### Components

- **`FeatureLockedCard`** - Widget shown for locked features
- **`UpgradeModal`** - Subscription purchase flow
- **`TrialOfferModal`** - Free trial promotion
- **`TrialStatusBanner`** - Shows remaining trial days

---

## 🔄 Subscription Flow

### New User Journey

1. **Sign up** → Assigned Free plan automatically
2. **Free trial offer** → Optional 7-day trial of Pro
3. **Hit limits** → Prompted to upgrade
4. **Choose plan** → Navigate to subscription screen
5. **Complete purchase** → RevenueCat processes payment
6. **Webhook sync** → Firebase Cloud Function updates Firestore
7. **Instant access** → Features unlock immediately

### Upgrade/Downgrade

- **Upgrades** → Effective immediately
- **Downgrades** → Effective at end of current billing period
- **Cancellations** → Access retained until period ends
- **Refunds** → Handled through App Store/Play Store policies

---

## 📱 Platform Integration

### iOS (App Store)

- Managed via StoreKit
- In-app purchase products configured in App Store Connect
- RevenueCat handles receipt validation

### Android (Play Store)

- Managed via Google Play Billing
- In-app products configured in Play Console
- RevenueCat handles purchase verification

### Web (Stripe Checkout)

- Direct Stripe integration for Elite tier
- Redirects to Stripe Checkout
- Webhook integration with Firebase

---

## 🔔 Notification Entitlements

Different notification features unlock at different tiers:

| Notification Type | Required Plan | Feature Code |
|-------------------|---------------|--------------|
| Basic dose reminders | Free | - |
| Symptom check-in reminders | Basic | - |
| Advanced reminders | Pro | `advanced_reminders` |
| Low supply alerts | Pro+ | `low_supply_alerts` |
| Beta feature alerts | Elite | `beta_features` |

---

## 📈 Analytics & Tracking

### User Plan Analytics

The app tracks the following subscription metrics:

- Active subscriptions per tier
- Trial conversion rates
- Upgrade/downgrade patterns
- Feature usage by plan tier
- Churn analysis

**Dashboard:** `lib/screens/admin/admin_dashboard_screen.dart`

---

## 🛡️ Admin Override

### Special User Roles

**Admin Role:**
- Unlimited access to all features
- Bypass all subscription checks
- Access to admin dashboard
- User management capabilities

**Moderator Role:**
- Unlimited access to all features
- Bypass all subscription checks
- Content moderation tools
- No admin dashboard access

**Set via:** Firestore `users` collection (`isAdmin: true` or `isModerator: true`)

---

## 🧪 Testing Subscriptions

### Test Accounts

For development/testing:

1. **iOS:** Use Sandbox accounts in App Store Connect
2. **Android:** Use test accounts in Play Console
3. **RevenueCat:** Configure test mode in dashboard

### Manual Plan Override

Admins can manually set user plans in Firestore:

```javascript
// In Firestore Console
users/{userId}
  .planTier = "pro" // or "basic", "pro_plus", "elite"
  .subscriptionStatus = "active"
```

---

## 📚 Code References

### Key Files

| File | Purpose |
|------|---------|
| `lib/config/app_config.dart` | Plan limits and entitlements |
| `lib/services/subscription_service.dart` | Feature gating logic |
| `lib/models/user_model.dart` | User plan tier methods |
| `lib/screens/subscription/subscription_screen.dart` | Subscription UI |
| `lib/widgets/feature_locked_card.dart` | Locked feature UI |
| `firebase/functions/src/webhooks/handleRevenueCatWebhook.ts` | RevenueCat sync |

### Feature Code Reference

**Basic Tier:**
- `reconstitution_tracker`
- `calendar_3month`
- `symptom_severity`
- `measurement_tracking`
- `private_notes`

**Pro Tier:**
- `analytics`
- `calendar_full`
- `symptom_trends`
- `advanced_reminders`
- `supply_inventory`
- `order_tracker`
- `protocol_library`
- `test_uploads`

**Pro+ Tier:**
- `vendor_pricing`
- `batch_tracking`
- `low_supply_alerts`
- `priority_sync`

**Elite Tier:**
- `data_export`
- `referral_rewards`
- `estimation_engine`
- `beta_features`

---

## 🔧 Configuration

### RevenueCat Setup

**API Keys:**
- Android: `goog_ObobsRucDTxWILjdQseFJQEfbSJ`
- iOS: `appl_qbCIuNatsDuOZxKrcrkNNvcnJVO`

**Offering:** `default`

**Entitlements:**
- `free_access`
- `basic_access`
- `pro_access`
- `pro_plus_access`
- `elite_access`

---

## 📞 Support

For subscription issues:
- Email: support@peptisync.com
- In-app: Help & Support section
- RevenueCat customer support for billing

---

## 📝 Notes

1. **Plan Switching** is currently disabled to prevent abuse
2. **Elite Plan** is limited to 300 users maximum
3. **Free Trial** is 7 days for Pro tier (one-time per user)
4. **Photos reset monthly** for Free/Basic users
5. **Admins/Moderators** bypass all limits and checks

---

*This document is maintained alongside the codebase. For technical implementation details, refer to the source code in the referenced files.*

