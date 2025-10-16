# Email Service Setup

This Edge Function handles sending emails using the Resend API with pre-built templates.

## Setup Instructions

### 1. Get a Resend API Key

1. Sign up at [resend.com](https://resend.com)
2. Navigate to API Keys section
3. Create a new API key
4. Copy the API key (starts with `re_`)

### 2. Configure Supabase Edge Function Secrets

You need to set the `RESEND_API_KEY` secret in your Supabase project:

#### Option A: Using Supabase CLI (Recommended)

```bash
# Login to Supabase
supabase login

# Link your project
supabase link --project-ref rirckslupgqpcohgkomo

# Set the secret
supabase secrets set RESEND_API_KEY=re_your_api_key_here
```

#### Option B: Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to Edge Functions → Settings
3. Add a new secret:
   - Name: `RESEND_API_KEY`
   - Value: Your Resend API key

### 3. Set Application URL

Set the `VITE_APP_URL` environment variable for email links:

```bash
# For local development
supabase secrets set VITE_APP_URL=http://localhost:5173

# For production
supabase secrets set VITE_APP_URL=https://your-domain.com
```

### 4. Deploy the Function

```bash
# Deploy the send-email function
supabase functions deploy send-email
```

## Email Types

The function supports the following email types:

### 1. Welcome Email
Sent when a user signs up.

```typescript
{
  type: "welcome",
  to: "user@example.com",
  data: {
    userName: "John Doe",
    verificationUrl: "https://app.com/verify?token=..."
  }
}
```

### 2. Order Confirmation
Sent after a successful order.

```typescript
{
  type: "order-confirmation",
  to: "user@example.com",
  data: {
    orderNumber: "ORD-12345",
    orderDate: "2024-01-15",
    items: [
      { name: "Product A", quantity: 2, price: 29.99 }
    ],
    subtotal: 59.98,
    shipping: 0,
    total: 59.98,
    shippingAddress: {
      fullName: "John Doe",
      address: "123 Main St",
      city: "New York",
      state: "NY",
      zipCode: "10001"
    }
  }
}
```

### 3. Order Status Update
Sent when order status changes.

```typescript
{
  type: "order-status-update",
  to: "user@example.com",
  data: {
    orderNumber: "ORD-12345",
    status: "shipped",
    statusMessage: "Your order has been shipped and is on its way!",
    trackingUrl: "https://tracking.com/..."
  }
}
```

### 4. Shipping Notification
Sent when order is shipped with tracking.

```typescript
{
  type: "shipping-notification",
  to: "user@example.com",
  data: {
    orderNumber: "ORD-12345",
    trackingNumber: "1Z999AA10123456784",
    carrier: "UPS",
    trackingUrl: "https://www.ups.com/track?tracknum=...",
    estimatedDelivery: "January 20, 2024"
  }
}
```

### 5. Password Reset
Sent when user requests password reset.

```typescript
{
  type: "password-reset",
  to: "user@example.com",
  data: {
    userName: "John Doe",
    resetUrl: "https://app.com/reset-password?token=...",
    expiresIn: "1 hour"
  }
}
```

### 6. Custom Email
For sending custom emails.

```typescript
{
  type: "custom",
  to: "user@example.com",
  subject: "Custom Subject",
  html: "<h1>Custom HTML content</h1>"
}
```

## Usage from Frontend

Use the helper functions in `src/lib/email.ts`:

```typescript
import { sendWelcomeEmail, sendOrderConfirmationEmail } from "@/lib/email";

// Send welcome email
await sendWelcomeEmail("user@example.com", {
  userName: "John Doe",
  verificationUrl: "https://app.com/verify?token=..."
});

// Send order confirmation
await sendOrderConfirmationEmail("user@example.com", {
  orderNumber: "ORD-12345",
  orderDate: new Date().toLocaleDateString(),
  items: orderItems,
  subtotal: 59.98,
  shipping: 0,
  total: 59.98,
  shippingAddress: address
});
```

## Testing

You can test the function locally:

```bash
# Start Supabase locally
supabase start

# Serve the function
supabase functions serve send-email --env-file .env.local

# Test with curl
curl -i --location --request POST 'http://localhost:54321/functions/v1/send-email' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"type":"welcome","to":"test@example.com","data":{"userName":"Test User"}}'
```

## Troubleshooting

### Email not sending

1. Check that `RESEND_API_KEY` is set correctly
2. Verify your Resend account is active
3. Check Supabase Edge Function logs
4. Ensure the "from" email domain is verified in Resend

### Template not rendering

1. Check the data structure matches the expected interface
2. Verify all required fields are provided
3. Check Edge Function logs for errors

### Links not working

1. Verify `VITE_APP_URL` is set correctly
2. Check that URLs are properly formatted
3. Test links in different email clients
