import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

export type PlanTier = 'free' | 'basic' | 'pro' | 'pro_plus' | 'elite' | 'admin';

export interface SubscriptionInfo {
  planTier: PlanTier;
  loading: boolean;
  hasFeature: (feature: string) => boolean;
  getRequiredPlan: (feature: string) => PlanTier;
  isPro: boolean;
  isProPlus: boolean;
  isElite: boolean;
  isAdmin: boolean;
  // Stripe subscription fields
  subscriptionSource: 'stripe' | null;
  isAppSubscriber: () => boolean;
  isWebSubscriber: () => boolean;
  canPurchaseOnWeb: () => boolean;
}

/**
 * Hook to check user subscription status and feature access
 * Based on the PeptiSync subscription plan document
 */
export const useSubscription = (): SubscriptionInfo => {
  const { user, loading: authLoading } = useAuth();
  const [planTier, setPlanTier] = useState<PlanTier>('free');
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserPlan = async () => {
      if (!user) {
        setPlanTier('free');
        setUserData(null);
        setLoading(false);
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const data = userDoc.data();
        setUserData(data);

        // Check for admin/moderator (bypass all restrictions)
        if (data?.isAdmin || data?.is_admin || data?.isModerator || data?.is_moderator) {
          setPlanTier('admin');
          setLoading(false);
          return;
        }

        // Get plan tier (handle both field names for compatibility)
        const plan = data?.planTier || data?.plan_tier || data?.membershipTier || data?.membership_tier || 'free';
        setPlanTier(plan as PlanTier);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user plan:', error);
        setPlanTier('free');
        setUserData(null);
        setLoading(false);
      }
    };

    fetchUserPlan();
  }, [user]);

  /**
   * Check if user has access to a specific feature
   * Based on feature codes from the subscription plan document
   */
  const hasFeature = (feature: string): boolean => {
    // Admins and moderators have access to everything
    if (planTier === 'admin') return true;

    // Feature to plan tier mapping
    const featureMap: Record<string, PlanTier[]> = {
      // Basic features ($4.99/mo)
      'reconstitution_tracker': ['basic', 'pro', 'pro_plus', 'elite'],
      'calendar_3month': ['basic', 'pro', 'pro_plus', 'elite'],
      'symptom_severity': ['basic', 'pro', 'pro_plus', 'elite'],
      'measurement_tracking': ['basic', 'pro', 'pro_plus', 'elite'],
      'private_notes': ['basic', 'pro', 'pro_plus', 'elite'],
      
      // Pro features ($9.99/mo)
      'analytics': ['pro', 'pro_plus', 'elite'],
      'calendar_full': ['pro', 'pro_plus', 'elite'],
      'symptom_trends': ['pro', 'pro_plus', 'elite'],
      'advanced_reminders': ['pro', 'pro_plus', 'elite'],
      'supply_inventory': ['pro', 'pro_plus', 'elite'],
      'order_tracker': ['pro', 'pro_plus', 'elite'],
      'protocol_library': ['pro', 'pro_plus', 'elite'],
      'test_uploads': ['pro', 'pro_plus', 'elite'],
      
      // Pro+ features ($19.99/mo) - THE PAID VENDOR PRICING FEATURE
      'vendor_pricing': ['pro_plus', 'elite'],
      'batch_tracking': ['pro_plus', 'elite'],
      'low_supply_alerts': ['pro_plus', 'elite'],
      'priority_sync': ['pro_plus', 'elite'],
      
      // Elite features ($179.99/yr)
      'data_export': ['elite'],
      'referral_rewards': ['elite'],
      'estimation_engine': ['elite'],
      'beta_features': ['elite'],
    };

    const allowedPlans = featureMap[feature] || [];
    return allowedPlans.includes(planTier);
  };

  /**
   * Get the minimum required plan for a feature
   */
  const getRequiredPlan = (feature: string): PlanTier => {
    const featurePlanMap: Record<string, PlanTier> = {
      // Basic tier features
      'reconstitution_tracker': 'basic',
      'calendar_3month': 'basic',
      'symptom_severity': 'basic',
      'measurement_tracking': 'basic',
      'private_notes': 'basic',
      
      // Pro tier features
      'analytics': 'pro',
      'calendar_full': 'pro',
      'symptom_trends': 'pro',
      'advanced_reminders': 'pro',
      'supply_inventory': 'pro',
      'order_tracker': 'pro',
      'protocol_library': 'pro',
      'test_uploads': 'pro',
      
      // Pro+ tier features
      'vendor_pricing': 'pro_plus',
      'batch_tracking': 'pro_plus',
      'low_supply_alerts': 'pro_plus',
      'priority_sync': 'pro_plus',
      
      // Elite tier features
      'data_export': 'elite',
      'referral_rewards': 'elite',
      'estimation_engine': 'elite',
      'beta_features': 'elite',
    };
    
    return featurePlanMap[feature] || 'pro';
  };

  /**
   * Check if user is an app subscriber (RevenueCat)
   * Logic: subscriptionSource is null AND planTier is not free
   */
  const isAppSubscriber = (): boolean => {
    return userData?.subscriptionSource === null && planTier !== 'free';
  };

  /**
   * Check if user is a web subscriber (Stripe)
   */
  const isWebSubscriber = (): boolean => {
    return userData?.subscriptionSource === 'stripe';
  };

  /**
   * Check if user can purchase subscriptions on the web
   * Allow if: free tier OR already a web subscriber (for upgrades)
   */
  const canPurchaseOnWeb = (): boolean => {
    return planTier === 'free' || userData?.subscriptionSource === 'stripe';
  };

  return {
    planTier,
    loading: authLoading || loading,
    hasFeature,
    getRequiredPlan,
    isPro: planTier === 'pro' || planTier === 'pro_plus' || planTier === 'elite' || planTier === 'admin',
    isProPlus: planTier === 'pro_plus' || planTier === 'elite' || planTier === 'admin',
    isElite: planTier === 'elite' || planTier === 'admin',
    isAdmin: planTier === 'admin',
    // Stripe subscription fields
    subscriptionSource: userData?.subscriptionSource || null,
    isAppSubscriber,
    isWebSubscriber,
    canPurchaseOnWeb,
  };
};

