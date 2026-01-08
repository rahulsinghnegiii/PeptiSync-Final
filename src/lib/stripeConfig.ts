/**
 * Stripe Configuration
 * 
 * Centralized configuration for Stripe price IDs and keys
 */

// Stripe Price IDs from environment variables
export const STRIPE_PRICES = {
  BASIC_MONTHLY: import.meta.env.VITE_STRIPE_PRICE_BASIC_MONTHLY,
  BASIC_YEARLY: import.meta.env.VITE_STRIPE_PRICE_BASIC_YEARLY,
  PRO_MONTHLY: import.meta.env.VITE_STRIPE_PRICE_PRO_MONTHLY,
  PRO_YEARLY: import.meta.env.VITE_STRIPE_PRICE_PRO_YEARLY,
  PRO_PLUS_MONTHLY: import.meta.env.VITE_STRIPE_PRICE_PRO_PLUS_MONTHLY,
  PRO_PLUS_YEARLY: import.meta.env.VITE_STRIPE_PRICE_PRO_PLUS_YEARLY,
  ELITE_YEARLY: import.meta.env.VITE_STRIPE_PRICE_ELITE_YEARLY,
} as const;

export const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

// Helper to get price ID based on plan and billing period
export function getPriceId(plan: 'basic' | 'pro' | 'pro_plus' | 'elite', period: 'monthly' | 'yearly'): string {
  if (plan === 'basic') {
    return period === 'monthly' ? STRIPE_PRICES.BASIC_MONTHLY : STRIPE_PRICES.BASIC_YEARLY;
  } else if (plan === 'pro') {
    return period === 'monthly' ? STRIPE_PRICES.PRO_MONTHLY : STRIPE_PRICES.PRO_YEARLY;
  } else if (plan === 'pro_plus') {
    return period === 'monthly' ? STRIPE_PRICES.PRO_PLUS_MONTHLY : STRIPE_PRICES.PRO_PLUS_YEARLY;
  } else {
    return STRIPE_PRICES.ELITE_YEARLY;
  }
}

