# 💳 How to Add Subscribe Buttons to Your Pricing Page

This guide shows you how to integrate the Stripe subscription system into your pricing page.

---

## 🎯 Quick Example

Here's a complete example of a pricing card component with Stripe integration:

```typescript
import { useState } from 'react';
import { useStripeCheckout } from '@/hooks/useStripeCheckout';
import { getPriceId } from '@/lib/stripeConfig';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface PricingCardProps {
  plan: 'basic' | 'pro' | 'pro_plus' | 'elite';
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
  popular?: boolean;
}

export function PricingCard({ 
  plan, 
  name, 
  monthlyPrice, 
  yearlyPrice, 
  features,
  popular 
}: PricingCardProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { createCheckout, loading, canPurchase, isAppSubscriber } = useStripeCheckout();
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('yearly');

  const handleSubscribe = () => {
    // Redirect to login if not authenticated
    if (!user) {
      navigate('/auth?redirect=/pricing');
      return;
    }

    // Get the appropriate price ID
    const priceId = getPriceId(plan, billingPeriod);
    
    // Create checkout session and redirect to Stripe
    createCheckout(priceId, plan);
  };

  const displayPrice = billingPeriod === 'monthly' ? monthlyPrice : yearlyPrice;
  const savings = billingPeriod === 'yearly' 
    ? Math.round(((monthlyPrice * 12 - yearlyPrice) / (monthlyPrice * 12)) * 100)
    : 0;

  return (
    <div className={`
      relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8
      ${popular ? 'ring-2 ring-cyan-500 scale-105' : ''}
    `}>
      {/* Popular Badge */}
      {popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-cyan-500 text-white px-4 py-1 rounded-full text-sm font-medium">
          Most Popular
        </div>
      )}

      {/* Plan Name */}
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        {name}
      </h3>

      {/* Billing Period Toggle */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setBillingPeriod('monthly')}
          className={`
            flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors
            ${billingPeriod === 'monthly' 
              ? 'bg-cyan-600 text-white' 
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
            }
          `}
        >
          Monthly
        </button>
        <button
          onClick={() => setBillingPeriod('yearly')}
          className={`
            flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors relative
            ${billingPeriod === 'yearly' 
              ? 'bg-cyan-600 text-white' 
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
            }
          `}
        >
          Yearly
          {savings > 0 && (
            <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
              Save {savings}%
            </span>
          )}
        </button>
      </div>

      {/* Price */}
      <div className="mb-6">
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold text-gray-900 dark:text-white">
            ${displayPrice}
          </span>
          <span className="text-gray-600 dark:text-gray-400">
            /{billingPeriod === 'monthly' ? 'mo' : 'yr'}
          </span>
        </div>
        {billingPeriod === 'yearly' && (
          <p className="text-sm text-green-600 dark:text-green-400 mt-1">
            ${(yearlyPrice / 12).toFixed(2)}/mo billed annually
          </p>
        )}
      </div>

      {/* Features */}
      <ul className="space-y-3 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3">
            <svg 
              className="w-5 h-5 text-cyan-500 flex-shrink-0 mt-0.5" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M5 13l4 4L19 7" 
              />
            </svg>
            <span className="text-gray-700 dark:text-gray-300 text-sm">
              {feature}
            </span>
          </li>
        ))}
      </ul>

      {/* Subscribe Button */}
      {isAppSubscriber ? (
        <div className="text-center">
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-3">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              You have an active subscription in the mobile app
            </p>
          </div>
          <button
            disabled
            className="w-full bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 py-3 px-6 rounded-lg font-medium cursor-not-allowed"
          >
            Manage in App
          </button>
        </div>
      ) : (
        <button
          onClick={handleSubscribe}
          disabled={loading || !canPurchase}
          className={`
            w-full py-3 px-6 rounded-lg font-medium transition-colors
            ${popular
              ? 'bg-cyan-600 hover:bg-cyan-700 text-white'
              : 'bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900'
            }
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle 
                  className="opacity-25" 
                  cx="12" 
                  cy="12" 
                  r="10" 
                  stroke="currentColor" 
                  strokeWidth="4"
                  fill="none"
                />
                <path 
                  className="opacity-75" 
                  fill="currentColor" 
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Processing...
            </span>
          ) : user ? (
            'Subscribe Now'
          ) : (
            'Sign Up to Subscribe'
          )}
        </button>
      )}
    </div>
  );
}
```

---

## 🎨 Usage Example

```typescript
export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Start tracking your peptides with advanced features
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <PricingCard
            plan="basic"
            name="Basic"
            monthlyPrice={4.99}
            yearlyPrice={54.99}
            features={[
              'Track up to 5 peptides',
              '20 progress photos/month',
              'Reconstitution tracker',
              '3-month calendar view',
              'Body measurement tracking',
            ]}
          />

          <PricingCard
            plan="pro"
            name="Pro"
            monthlyPrice={9.99}
            yearlyPrice={99.99}
            popular
            features={[
              'Unlimited peptides & photos',
              'Advanced analytics hub',
              'Full calendar history',
              'Symptom & dosage trends',
              'Supply inventory management',
            ]}
          />

          <PricingCard
            plan="pro_plus"
            name="Pro+"
            monthlyPrice={19.99}
            yearlyPrice={199.99}
            features={[
              'All Pro features',
              'Vendor pricing comparison',
              'Batch tracking',
              'Low supply alerts',
              'Priority sync',
            ]}
          />

          <PricingCard
            plan="elite"
            name="Elite"
            monthlyPrice={0}
            yearlyPrice={179.99}
            features={[
              'All Pro+ features',
              'Data export (CSV/PDF)',
              'Referral rewards',
              'Beta features access',
              'Priority support',
            ]}
          />
        </div>
      </div>
    </div>
  );
}
```

---

## 🔧 Alternative: Simple Button Only

If you already have pricing cards and just need the subscribe button:

```typescript
import { useStripeCheckout } from '@/hooks/useStripeCheckout';
import { getPriceId } from '@/lib/stripeConfig';

export function SubscribeButton({ 
  plan,
  billingPeriod = 'yearly'
}: { 
  plan: 'basic' | 'pro' | 'pro_plus' | 'elite',
  billingPeriod?: 'monthly' | 'yearly'
}) {
  const { createCheckout, loading, isAppSubscriber } = useStripeCheckout();

  const handleClick = () => {
    const priceId = getPriceId(plan, billingPeriod);
    createCheckout(priceId, plan);
  };

  if (isAppSubscriber) {
    return (
      <button disabled className="btn-disabled">
        Manage in App
      </button>
    );
  }

  return (
    <button 
      onClick={handleClick} 
      disabled={loading}
      className="btn-primary"
    >
      {loading ? 'Processing...' : 'Subscribe'}
    </button>
  );
}
```

---

## 📋 Features Explained

### Conflict Prevention
- `isAppSubscriber` checks if user has an app subscription (blocks web purchase)
- Shows "Manage in App" message for app subscribers

### Billing Period Toggle
- Switch between monthly and yearly pricing
- Shows savings percentage for annual plans
- Dynamically updates price display

### Authentication Check
- Redirects to login if user not signed in
- Passes redirect parameter to return to pricing page after login

### Loading States
- Disables button while creating checkout session
- Shows loading spinner
- Prevents double-clicks

### Error Handling
- Errors are handled by the `useStripeCheckout` hook
- Toast notifications show user-friendly error messages

---

## 🎯 Next Steps

1. Copy the `PricingCard` component code above
2. Customize the styling to match your design
3. Add it to your pricing page
4. Test with Stripe test mode before going live

That's it! Your pricing page is now ready for web subscriptions. 🚀

