export interface PricingTier {
  id: string;
  name: string;
  productIds: {
    monthly?: string;
    yearly?: string;
    annual?: string;
  };
  prices: {
    monthly?: number;
    yearly?: number;
    annual?: number;
  };
  entitlement: string;
  badge?: 'popular' | 'limited';
  userLimit?: number;
  features: string[];
  savings?: {
    yearly?: number;
  };
}

export const pricingTiers: PricingTier[] = [
  {
    id: 'free',
    name: 'Free',
    productIds: {},
    prices: { monthly: 0 },
    entitlement: 'free_access',
    features: [
      'Track up to 3 peptides',
      'Basic monthly calendar',
      'Basic symptom tracking',
      '5 progress photos/month',
      '1 stack template',
      'Archive inactive cycles',
      'Dark mode',
      'Basic help/FAQ only',
    ],
  },
  {
    id: 'basic',
    name: 'Basic',
    productIds: {
      monthly: 'basic_monthly',
      yearly: 'basic_yearly',
    },
    prices: {
      monthly: 4.99,
      yearly: 54.99,
    },
    entitlement: 'basic_access',
    savings: {
      yearly: 5,
    },
    features: [
      'Everything in Free, plus:',
      'Track up to 5 peptides',
      '3-month calendar view (daily/weekly/monthly)',
      'Symptom severity levels',
      '20 progress photos/month',
      '3 stack templates',
      'Reconstitution tracker',
      'Measurement tracking',
      'Private notes and tags',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    productIds: {
      monthly: 'pro_monthly',
      yearly: 'pro_yearly',
    },
    prices: {
      monthly: 9.99,
      yearly: 99.99,
    },
    entitlement: 'pro_access',
    savings: {
      yearly: 20,
    },
    features: [
      'Everything in Basic, plus:',
      'Unlimited peptides',
      'Full calendar access',
      'Advanced reminders',
      'Unlimited progress photos',
      'Analytics and dosage charts',
      'Symptom trend tracking',
      'Supply inventory tracking',
      'Order tracker',
      'Preset protocol library',
      'Test result uploads',
    ],
  },
  {
    id: 'pro_plus',
    name: 'Pro+',
    productIds: {
      monthly: 'pro_plus_monthly',
      yearly: 'pro_plus_yearly',
    },
    prices: {
      monthly: 14.99,
      yearly: 159.99,
    },
    entitlement: 'pro_plus_access',
    badge: 'popular',
    savings: {
      yearly: 20,
    },
    features: [
      'Everything in Pro, plus:',
      'Vendor pricing tracker',
      'Batch/vial tracking',
      'Low stock alerts',
      'Protocol note attachments',
      'Advanced priority sync',
    ],
  },
  {
    id: 'elite',
    name: 'Elite',
    productIds: {
      annual: 'elite_annual',
    },
    prices: {
      annual: 149.99,
    },
    entitlement: 'elite_access',
    badge: 'limited',
    userLimit: 300,
    features: [
      'Everything in Pro+, plus:',
      'System level estimation engine',
      'Full data export (CSV/PDF)',
      'Referral rewards system',
      'Beta feature access',
      'Highest priority support',
    ],
  },
];
