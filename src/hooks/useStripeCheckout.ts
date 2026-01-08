import { useState } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from './useSubscription';

interface CheckoutRequest {
  priceId: string;
  planTier: 'basic' | 'pro' | 'pro_plus' | 'elite';
}

interface CheckoutResponse {
  sessionId: string;
  url: string;
}

/**
 * Hook for managing Stripe checkout flow
 * Handles subscription purchase with conflict prevention for app subscribers
 */
export function useStripeCheckout() {
  const { user } = useAuth();
  const subscription = useSubscription();
  const [loading, setLoading] = useState(false);

  const createCheckout = async (priceId: string, tier: 'basic' | 'pro' | 'pro_plus' | 'elite') => {
    if (!user) {
      toast.error('Please sign in to subscribe');
      return;
    }

    // Check if user has active app subscription
    if (subscription.isAppSubscriber()) {
      toast.error('You have an active app subscription. Please manage it through the mobile app.');
      return;
    }

    setLoading(true);

    try {
      const createStripeCheckout = httpsCallable<CheckoutRequest, CheckoutResponse>(
        functions,
        'createStripeCheckout'
      );

      const result = await createStripeCheckout({ priceId, planTier: tier });

      if (result.data.url) {
        // Redirect to Stripe Checkout
        window.location.href = result.data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      
      if (error.code === 'failed-precondition') {
        toast.error('You have an active app subscription. Please cancel it first in the mobile app.');
      } else if (error.code === 'unauthenticated') {
        toast.error('Please sign in to continue');
      } else {
        toast.error(error.message || 'Failed to start checkout. Please try again.');
      }
      
      setLoading(false);
    }
  };

  return {
    createCheckout,
    loading,
    canPurchase: subscription.canPurchaseOnWeb(),
    isAppSubscriber: subscription.isAppSubscriber(),
  };
}

