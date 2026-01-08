import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import Stripe from 'stripe';

const stripe = new Stripe(functions.config().stripe?.secret_key || process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia' as any,
});

interface CheckoutRequest {
  priceId: string;
  planTier: 'basic' | 'pro' | 'pro_plus' | 'elite';
}

export const createStripeCheckout = functions.https.onCall(async (data: CheckoutRequest, context) => {
  // Require authentication
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const userId = context.auth.uid;
  const { priceId, planTier } = data;

  if (!priceId || !planTier) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing priceId or planTier');
  }

  try {
    // Check user's current subscription status
    const db = admin.firestore();
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();

    // Prevent checkout if user has active app subscription
    const currentPlanTier = userData?.planTier || userData?.plan_tier || 'free';
    const subscriptionSource = userData?.subscriptionSource;

    if (subscriptionSource === null && currentPlanTier !== 'free') {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'You have an active app subscription. Please manage it through the mobile app.'
      );
    }

    // Get user email
    const userEmail = userData?.email || context.auth.token.email;

    // Determine success and cancel URLs
    const origin = context.rawRequest.headers.origin || 'https://peptisync.com';

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      success_url: `${origin}/subscription-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing`,
      customer_email: userEmail,
      metadata: {
        userId,
        planTier,
        source: 'web',
      },
      subscription_data: {
        metadata: {
          userId,
          planTier,
        },
      },
      allow_promotion_codes: true,
    });

    console.log(`✅ Checkout session created for user ${userId}: ${session.id}`);

    return {
      sessionId: session.id,
      url: session.url,
    };
  } catch (error) {
    console.error('Error creating checkout session:', error);
    
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    
    throw new functions.https.HttpsError(
      'internal',
      `Failed to create checkout session: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
});

