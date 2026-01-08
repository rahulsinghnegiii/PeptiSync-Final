import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Zap, Crown, Sparkles, Shield, ChevronDown } from 'lucide-react';
import { useStripeCheckout } from '@/hooks/useStripeCheckout';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/contexts/AuthContext';
import { getPriceId } from '@/lib/stripeConfig';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

interface PricingTier {
  id: 'free' | 'basic' | 'pro' | 'pro_plus' | 'elite';
  name: string;
  tagline: string;
  icon: React.ReactNode;
  monthlyPrice: number;
  yearlyPrice: number;
  popular?: boolean;
  features: string[];
  color: string;
}

const pricingTiers: PricingTier[] = [
  {
    id: 'free',
    name: 'Free',
    tagline: 'Get started with basics',
    icon: <Shield className="w-6 h-6" />,
    monthlyPrice: 0,
    yearlyPrice: 0,
    color: 'gray',
    features: [
      'Track up to 3 peptides',
      'Basic monthly calendar',
      'Basic symptom tracking',
      '5 progress photos/month',
      '1 stack template',
      'Archive inactive cycles',
      'Dark mode',
      'Basic help/FAQ',
    ],
  },
  {
    id: 'basic',
    name: 'Basic',
    tagline: 'Essential tracking features',
    icon: <Check className="w-6 h-6" />,
    monthlyPrice: 4.99,
    yearlyPrice: 54.99,
    color: 'blue',
    features: [
      'Everything in Free, plus:',
      'Track up to 5 peptides',
      '20 progress photos/month',
      'Reconstitution tracker',
      '3-month calendar view',
      'Symptom severity levels',
      'Body measurement tracking',
      'Private notes and tags',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    tagline: 'Unlimited tracking & analytics',
    icon: <Zap className="w-6 h-6" />,
    monthlyPrice: 9.99,
    yearlyPrice: 99.99,
    popular: true,
    color: 'cyan',
    features: [
      'Everything in Basic, plus:',
      'Unlimited peptides & photos',
      'Advanced analytics hub',
      'Full calendar history',
      'Symptom & dosage trends',
      'Supply inventory tracking',
      'Order tracker',
      'Preset protocol library',
      'Lab test result uploads',
    ],
  },
  {
    id: 'pro_plus',
    name: 'Pro+',
    tagline: 'Advanced vendor pricing',
    icon: <Sparkles className="w-6 h-6" />,
    monthlyPrice: 19.99,
    yearlyPrice: 199.99,
    color: 'purple',
    features: [
      'Everything in Pro, plus:',
      'Vendor pricing comparison',
      'Submit vendor pricing data',
      'Batch tracking for vials',
      'Low supply alerts',
      'Priority cloud sync',
    ],
  },
  {
    id: 'elite',
    name: 'Elite',
    tagline: 'Exclusive annual access',
    icon: <Crown className="w-6 h-6" />,
    monthlyPrice: 0,
    yearlyPrice: 179.99,
    color: 'amber',
    features: [
      'Everything in Pro+, plus:',
      'Data export (CSV/PDF)',
      'Referral rewards system',
      'Beta features early access',
      'Priority support',
      'Limited to 300 users only',
    ],
  },
];

function PricingCard({ tier, billingPeriod }: { tier: PricingTier; billingPeriod: 'monthly' | 'yearly' }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { createCheckout, loading, isAppSubscriber } = useStripeCheckout();
  const { actualPlanTier, isAdmin, loading: subscriptionLoading } = useSubscription();
  const [isExpanded, setIsExpanded] = useState(false);

  const displayPrice = billingPeriod === 'monthly' ? tier.monthlyPrice : tier.yearlyPrice;
  const savings = billingPeriod === 'yearly' && tier.monthlyPrice > 0
    ? Math.round(((tier.monthlyPrice * 12 - tier.yearlyPrice) / (tier.monthlyPrice * 12)) * 100)
    : 0;
  
  // Show first 3 features, rest are expandable
  const visibleFeatures = isExpanded ? tier.features : tier.features.slice(0, 3);
  const hasMoreFeatures = tier.features.length > 3;
  
  // Check if this is the user's current plan (use actualPlanTier for display)
  const isCurrentPlan = user && actualPlanTier === tier.id;
  const hasActivePaidPlan = actualPlanTier !== 'free';

  const handleSubscribe = () => {
    if (!user) {
      navigate('/auth?redirect=/pricing');
      return;
    }

    if (tier.id === 'free') {
      navigate('/auth');
      return;
    }

    const priceId = getPriceId(tier.id, billingPeriod);
    createCheckout(priceId, tier.id);
  };

  const colorClasses = {
    gray: {
      border: 'border-gray-300 dark:border-gray-700',
      badge: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
      button: 'bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900',
      icon: 'text-gray-600 dark:text-gray-400',
    },
    blue: {
      border: 'border-blue-200 dark:border-blue-900',
      badge: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
      button: 'bg-blue-600 hover:bg-blue-700 text-white',
      icon: 'text-blue-600 dark:text-blue-400',
    },
    cyan: {
      border: 'border-cyan-200 dark:border-cyan-900 ring-2 ring-cyan-500',
      badge: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300',
      button: 'bg-cyan-600 hover:bg-cyan-700 text-white',
      icon: 'text-cyan-600 dark:text-cyan-400',
    },
    purple: {
      border: 'border-purple-200 dark:border-purple-900',
      badge: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
      button: 'bg-purple-600 hover:bg-purple-700 text-white',
      icon: 'text-purple-600 dark:text-purple-400',
    },
    amber: {
      border: 'border-amber-200 dark:border-amber-900',
      badge: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
      button: 'bg-amber-600 hover:bg-amber-700 text-white',
      icon: 'text-amber-600 dark:text-amber-400',
    },
  };

  const colors = colorClasses[tier.color as keyof typeof colorClasses];

  return (
    <div
      className={`
        relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 sm:p-6
        border-2 ${colors.border}
        ${tier.popular ? 'scale-105 z-10' : 'hover:scale-[1.02]'}
        transition-all duration-300
        flex flex-col
      `}
    >
      {/* Popular Badge */}
      {tier.popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg">
          Most Popular
        </div>
      )}

      {/* Icon & Name */}
      <div className="flex items-center gap-2 mb-3">
        <div className={`p-1.5 rounded-lg ${colors.badge}`}>
          <div className="w-5 h-5">{tier.icon}</div>
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">{tier.name}</h3>
          <p className="text-xs text-gray-600 dark:text-gray-400">{tier.tagline}</p>
        </div>
      </div>

      {/* Price */}
      <div className="mb-4">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
            ${displayPrice}
          </span>
          {displayPrice > 0 && (
            <span className="text-gray-600 dark:text-gray-400 text-sm">
              /{billingPeriod === 'monthly' ? 'mo' : 'yr'}
            </span>
          )}
        </div>
        {savings > 0 && (
          <p className="text-xs text-green-600 dark:text-green-400 mt-1 font-medium">
            Save {savings}%
          </p>
        )}
        {tier.yearlyPrice > 0 && billingPeriod === 'yearly' && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            ${(tier.yearlyPrice / 12).toFixed(2)}/mo billed annually
          </p>
        )}
      </div>

      {/* Features - Expandable */}
      <div className="mb-4 flex-grow">
        <ul className="space-y-2">
          {visibleFeatures.map((feature, index) => (
            <li 
              key={index} 
              className="flex items-start gap-2 animate-in fade-in slide-in-from-left-2"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <Check className={`w-4 h-4 ${colors.icon} flex-shrink-0 mt-0.5`} />
              <span className="text-xs text-gray-700 dark:text-gray-300">{feature}</span>
            </li>
          ))}
        </ul>
        
        {hasMoreFeatures && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`
              mt-3 w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg
              text-xs font-medium transition-all duration-300
              ${colors.badge}
              hover:opacity-80
            `}
          >
            <span>{isExpanded ? 'Show less' : `+${tier.features.length - 3} more features`}</span>
            <ChevronDown 
              className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} 
            />
          </button>
        )}
      </div>

      {/* CTA Button */}
      <div className="mt-auto">
        {subscriptionLoading ? (
          // Loading subscription data
          <button
            disabled
            className="w-full bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 py-2.5 px-4 rounded-lg font-semibold cursor-wait text-sm"
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
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
              Loading...
            </span>
          </button>
        ) : isAppSubscriber ? (
          // User has app subscription (from mobile - RevenueCat)
          <div>
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-2 mb-2">
              <p className="text-xs text-amber-800 dark:text-amber-200 text-center">
                Active subscription in mobile app
              </p>
            </div>
            <button
              disabled
              className="w-full bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 py-2.5 px-4 rounded-lg font-semibold cursor-not-allowed text-sm"
            >
              Manage in App
            </button>
          </div>
        ) : isCurrentPlan ? (
          // This is user's current plan (from Firebase)
          <button
            disabled
            className="w-full bg-green-100 dark:bg-green-900/30 border-2 border-green-500 text-green-700 dark:text-green-300 py-2.5 px-4 rounded-lg font-semibold cursor-default text-sm flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            Current Plan
          </button>
        ) : hasActivePaidPlan && tier.id !== 'free' ? (
          // User has a different paid plan - allow switching
          <button
            onClick={handleSubscribe}
            disabled={loading}
            className={`
              w-full py-2.5 px-4 rounded-lg font-semibold transition-all duration-200 text-sm
              ${colors.button}
              disabled:opacity-50 disabled:cursor-not-allowed
              transform active:scale-95 hover:shadow-lg
            `}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
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
            ) : (
              'Switch Plan'
            )}
          </button>
        ) : (
          // Free user or new subscriber
          <button
            onClick={handleSubscribe}
            disabled={loading}
            className={`
              w-full py-2.5 px-4 rounded-lg font-semibold transition-all duration-200 text-sm
              ${colors.button}
              disabled:opacity-50 disabled:cursor-not-allowed
              transform active:scale-95 hover:shadow-lg
            `}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
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
            ) : tier.id === 'free' ? (
              user ? 'Current Plan' : 'Get Started'
            ) : (
              'Subscribe Now'
            )}
          </button>
        )}
      </div>
    </div>
  );
}

export default function Pricing() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('yearly');
  const { user } = useAuth();
  const { planTier, actualPlanTier, subscriptionSource, isAdmin, loading } = useSubscription();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <Navigation />

      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Debug Panel - Remove this after testing */}
          {user && (
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg">
              <h3 className="text-sm font-bold text-blue-900 dark:text-blue-200 mb-2">🔍 Debug Info (Remove after testing)</h3>
              <div className="text-xs text-blue-800 dark:text-blue-300 space-y-1">
                <p><strong>User ID:</strong> {user.uid}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Plan Tier (for features):</strong> {loading ? 'Loading...' : planTier}</p>
                <p><strong>Actual Plan (for display):</strong> {loading ? 'Loading...' : actualPlanTier}</p>
                <p><strong>Is Admin:</strong> {loading ? 'Loading...' : (isAdmin ? 'Yes' : 'No')}</p>
                <p><strong>Subscription Source:</strong> {loading ? 'Loading...' : (subscriptionSource || 'null (app subscriber)')}</p>
              </div>
            </div>
          )}
          
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-4">
              Choose Your <span className="text-cyan-600 dark:text-cyan-400">Plan</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Start tracking your peptides with advanced features. Upgrade anytime.
            </p>
          </div>

          {/* Billing Period Toggle */}
          <div className="flex justify-center mb-12">
            <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-lg inline-flex">
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={`
                  px-6 py-2 rounded-md text-sm font-medium transition-all duration-200
                  ${billingPeriod === 'monthly'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-md'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }
                `}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod('yearly')}
                className={`
                  px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 relative
                  ${billingPeriod === 'yearly'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-md'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }
                `}
              >
                Yearly
                <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                  Save 17%
                </span>
              </button>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className={`grid grid-cols-1 md:grid-cols-2 ${billingPeriod === 'monthly' ? 'lg:grid-cols-4' : 'lg:grid-cols-5'} gap-6 lg:gap-4 mb-16`}>
            {pricingTiers
              .filter((tier) => {
                // Hide Elite tier when monthly billing is selected (Elite is annual-only)
                if (billingPeriod === 'monthly' && tier.id === 'elite') {
                  return false;
                }
                return true;
              })
              .map((tier) => (
                <PricingCard key={tier.id} tier={tier} billingPeriod={billingPeriod} />
              ))}
          </div>

          {/* FAQ Section */}
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-8">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Can I upgrade or downgrade my plan?
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Yes! You can upgrade anytime and changes take effect immediately. Downgrades take effect at the end of your current billing period.
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  What payment methods do you accept?
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  We accept all major credit cards through Stripe. Your payment information is securely processed and never stored on our servers.
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Can I cancel my subscription?
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Yes, you can cancel anytime. You'll retain access to premium features until the end of your billing period. No refunds for partial months.
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  What if I have a mobile app subscription?
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Mobile app subscriptions are managed through the App Store or Play Store. You'll need to manage or cancel those subscriptions directly in your app store account.
                </p>
              </div>
            </div>
          </div>

          {/* Trust Signals */}
          <div className="mt-16 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Trusted by peptide enthusiasts worldwide
            </p>
            <div className="flex justify-center items-center gap-8 flex-wrap">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-600" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Secure Payments</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-600" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Cancel Anytime</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-green-600" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Instant Access</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

