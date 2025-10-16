# Design Document: Clerk Authentication Migration

## Overview

This design document outlines the technical approach for migrating the PeptiSync website from Supabase Auth to Clerk. The migration will be implemented in phases to minimize disruption and ensure data integrity. Clerk will handle all authentication concerns while Supabase continues to serve as the primary database for application data.

### Key Design Principles

1. **Minimal Disruption**: Existing users should experience minimal friction during the migration
2. **Data Integrity**: All user data, orders, and relationships must be preserved
3. **Security First**: Maintain or enhance existing security features
4. **Developer Experience**: Provide clean, type-safe APIs for authentication
5. **Scalability**: Design for future growth and additional authentication features

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     React Application                        │
│  ┌────────────────────────────────────────────────────────┐ │
│  │           Clerk React Components & Hooks               │ │
│  │  - ClerkProvider                                       │ │
│  │  - useUser, useAuth, useSession                       │ │
│  │  - SignIn, SignUp, UserProfile components             │ │
│  └────────────────────────────────────────────────────────┘ │
│                           │                                  │
│                           ▼                                  │
│  ┌────────────────────────────────────────────────────────┐ │
│  │         Custom Auth Context (Adapter Layer)            │ │
│  │  - Maps Clerk user to app user interface              │ │
│  │  - Provides backward-compatible API                    │ │
│  │  - Handles role/permission logic                       │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────┐
        │         Clerk Backend API             │
        │  - User Management                    │
        │  - Session Management                 │
        │  - OAuth Providers                    │
        │  - Webhooks                           │
        └──────────────────────────────────────┘
                           │
                           ▼ (Webhooks)
        ┌──────────────────────────────────────┐
        │    Supabase Edge Function            │
        │    (Webhook Handler)                  │
        │  - Sync user data                     │
        │  - Update profiles                    │
        │  - Handle deletions                   │
        └──────────────────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────┐
        │      Supabase PostgreSQL              │
        │  - profiles (clerk_id added)          │
        │  - orders, cart_items, reviews        │
        │  - user_roles                         │
        │  - RLS policies (updated)             │
        └──────────────────────────────────────┘
```

## Components and Interfaces

### 1. Clerk Configuration

**File**: `src/lib/clerk.ts`

```typescript
import { ClerkProvider } from '@clerk/clerk-react';

export const clerkConfig = {
  publishableKey: import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
  appearance: {
    // Custom theming to match PeptiSync design
    variables: {
      colorPrimary: '#your-primary-color',
      // ... other theme variables
    },
  },
  localization: {
    // Custom text for sign-in/sign-up flows
  },
};
```

### 2. Auth Context Adapter

**File**: `src/contexts/ClerkAuthContext.tsx`

This adapter provides a backward-compatible interface that maps Clerk's authentication to the existing app structure.

```typescript
interface AuthContextType {
  user: AppUser | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
  // Clerk-specific additions
  clerkUser: ClerkUser | null;
  openSignIn: () => void;
  openSignUp: () => void;
  openUserProfile: () => void;
}

interface AppUser {
  id: string; // Clerk user ID
  email: string;
  fullName: string;
  imageUrl?: string;
  role: UserRole;
  emailVerified: boolean;
  createdAt: Date;
}
```

### 3. Database Schema Updates

**Migration**: `supabase/migrations/20251015000000_add_clerk_support.sql`

```sql
-- Add clerk_id column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN clerk_id TEXT UNIQUE;

-- Create index for clerk_id lookups
CREATE INDEX idx_profiles_clerk_id ON public.profiles(clerk_id);

-- Update RLS policies to use clerk_id
-- (Policies will check both user_id and clerk_id during transition)

-- Add migration tracking table
CREATE TABLE public.auth_migration_status (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  clerk_id TEXT,
  migrated_at TIMESTAMPTZ DEFAULT NOW(),
  migration_method TEXT -- 'automatic', 'manual', 'webhook'
);
```

### 4. Webhook Handler

**File**: `supabase/functions/clerk-webhook/index.ts`

Handles Clerk webhook events to sync user data with Supabase.

```typescript
interface ClerkWebhookEvent {
  type: 'user.created' | 'user.updated' | 'user.deleted';
  data: ClerkUser;
}

// Event handlers:
// - user.created: Create profile in Supabase
// - user.updated: Update profile in Supabase
// - user.deleted: Handle user deletion (soft delete or cascade)
```

### 5. Protected Route Component

**File**: `src/components/ClerkProtectedRoute.tsx`

```typescript
interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
  requiredRole?: UserRole;
  fallback?: ReactNode;
}

// Uses Clerk's useAuth hook to check authentication
// Integrates with existing authorization utilities
```

### 6. Sign-In/Sign-Up Pages

**Files**: 
- `src/pages/ClerkSignIn.tsx`
- `src/pages/ClerkSignUp.tsx`

These pages will use Clerk's pre-built components with custom styling to match the PeptiSync design.

## Data Models

### User Profile Mapping

```typescript
// Clerk User → Supabase Profile
{
  clerk_id: clerkUser.id,
  user_id: null, // Legacy Supabase auth ID (nullable during migration)
  email: clerkUser.emailAddresses[0].emailAddress,
  full_name: clerkUser.fullName || `${clerkUser.firstName} ${clerkUser.lastName}`,
  avatar_url: clerkUser.imageUrl,
  created_at: new Date(clerkUser.createdAt),
  updated_at: new Date(clerkUser.updatedAt),
}
```

### Role Management

Roles will be stored in Clerk's user metadata and synced to Supabase:

```typescript
// Clerk metadata
{
  publicMetadata: {
    role: 'user' | 'moderator' | 'admin',
  },
  privateMetadata: {
    // Internal system data
  },
}
```

## Error Handling

### Authentication Errors

```typescript
enum ClerkErrorCode {
  SIGN_IN_FAILED = 'sign_in_failed',
  SIGN_UP_FAILED = 'sign_up_failed',
  SESSION_EXPIRED = 'session_expired',
  EMAIL_NOT_VERIFIED = 'email_not_verified',
  MFA_REQUIRED = 'mfa_required',
  WEBHOOK_SYNC_FAILED = 'webhook_sync_failed',
}

// Error handling strategy:
// 1. Display user-friendly messages
// 2. Log errors for debugging
// 3. Provide recovery actions
// 4. Fallback to safe states
```

### Webhook Failure Handling

- Implement retry logic with exponential backoff
- Queue failed webhooks for manual review
- Alert administrators of persistent failures
- Maintain audit log of all webhook events

## Testing Strategy

### Unit Tests

1. **Auth Context Tests**
   - Test user state management
   - Test role checking logic
   - Test session handling

2. **Webhook Handler Tests**
   - Test user creation flow
   - Test user update flow
   - Test user deletion flow
   - Test error scenarios

3. **Authorization Tests**
   - Test role-based access control
   - Test resource ownership checks
   - Test permission guards

### Integration Tests

1. **Authentication Flow Tests**
   - Sign up → Email verification → Sign in
   - Social authentication flows
   - Password reset flow
   - MFA setup and verification

2. **Data Sync Tests**
   - Verify Clerk user creates Supabase profile
   - Verify profile updates sync correctly
   - Verify role changes propagate

3. **Protected Route Tests**
   - Test unauthenticated access denial
   - Test role-based route protection
   - Test session expiration handling

### Migration Tests

1. **Data Migration Tests**
   - Verify all users can be migrated
   - Verify data integrity after migration
   - Verify relationships are preserved

2. **Rollback Tests**
   - Test ability to rollback migration
   - Verify data consistency after rollback

## Migration Strategy

### Phase 1: Preparation (Week 1)

1. Set up Clerk account and configure application
2. Install Clerk dependencies
3. Create database migrations
4. Implement webhook handler
5. Set up development and staging environments

### Phase 2: Parallel Implementation (Week 2)

1. Implement Clerk auth context
2. Create new sign-in/sign-up pages
3. Update protected routes
4. Implement user profile management
5. Test in development environment

### Phase 3: Soft Launch (Week 3)

1. Deploy to staging environment
2. Enable Clerk for new user signups only
3. Existing users continue using Supabase Auth
4. Monitor webhook sync and error rates
5. Gather feedback from test users

### Phase 4: Migration (Week 4)

1. Create user migration script
2. Send migration notifications to existing users
3. Migrate users in batches
4. Provide support for migration issues
5. Monitor system health

### Phase 5: Cleanup (Week 5)

1. Remove Supabase Auth code
2. Update documentation
3. Remove legacy database columns
4. Optimize RLS policies
5. Final testing and validation

## Security Considerations

### Authentication Security

1. **Session Management**
   - Clerk handles secure session tokens
   - Automatic session refresh
   - Configurable session timeout

2. **Password Security**
   - Clerk enforces strong password requirements
   - Secure password hashing (bcrypt)
   - Password breach detection

3. **MFA Support**
   - TOTP (Time-based One-Time Password)
   - SMS verification
   - Backup codes

### Authorization Security

1. **Role-Based Access Control**
   - Roles stored in Clerk metadata
   - Synced to Supabase for RLS policies
   - Verified on both client and server

2. **RLS Policy Updates**
   - Update policies to check clerk_id
   - Maintain backward compatibility during migration
   - Remove legacy checks after migration complete

### Data Security

1. **Webhook Security**
   - Verify webhook signatures
   - Use HTTPS for all webhook endpoints
   - Implement rate limiting

2. **Data Encryption**
   - Clerk encrypts data at rest
   - TLS for data in transit
   - Secure token storage

## Performance Considerations

### Client-Side Performance

1. **Code Splitting**
   - Lazy load Clerk components
   - Split authentication routes
   - Optimize bundle size

2. **Caching**
   - Cache user data in context
   - Minimize API calls
   - Use Clerk's built-in caching

### Server-Side Performance

1. **Webhook Processing**
   - Async processing for non-critical updates
   - Batch operations where possible
   - Monitor processing times

2. **Database Queries**
   - Optimize clerk_id lookups with indexes
   - Use connection pooling
   - Monitor query performance

## Monitoring and Observability

### Metrics to Track

1. **Authentication Metrics**
   - Sign-up conversion rate
   - Sign-in success rate
   - Session duration
   - MFA adoption rate

2. **Webhook Metrics**
   - Webhook success rate
   - Processing time
   - Retry count
   - Failure reasons

3. **Migration Metrics**
   - Users migrated
   - Migration success rate
   - Support tickets related to migration

### Logging

1. **Authentication Events**
   - Sign-in/sign-up attempts
   - Password resets
   - MFA events

2. **Webhook Events**
   - All webhook receipts
   - Processing results
   - Errors and retries

3. **Migration Events**
   - Migration attempts
   - Success/failure status
   - Data integrity checks

## Rollback Plan

### Rollback Triggers

- Critical authentication failures
- Data integrity issues
- Unacceptable performance degradation
- Security vulnerabilities discovered

### Rollback Procedure

1. Disable Clerk authentication
2. Re-enable Supabase Auth
3. Restore database from backup if needed
4. Notify users of temporary service disruption
5. Investigate and fix issues
6. Plan re-migration

### Data Preservation

- Maintain Supabase Auth data during migration
- Keep backups of all user data
- Log all migration activities
- Preserve audit trail
