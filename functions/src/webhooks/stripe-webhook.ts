import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import Stripe from 'stripe';

const stripe = new Stripe(functions.config().stripe?.secret_key || process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia' as any,
});

export const handleStripeWebhook = functions.https.onRequest(async (req, res): Promise<void> => {
  const sig = req.headers['stripe-signature'] as string;
  const webhookSecret = functions.config().stripe?.webhook_secret || process.env.STRIPE_WEBHOOK_SECRET;
  
  if (!webhookSecret) {
    console.error('Stripe webhook secret not configured');
    res.status(500).send('Webhook secret not configured');
    return;
  }

  let event: Stripe.Event;
  
  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    res.status(400).send(`Webhook Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    return;
  }
  
  const db = admin.firestore();
  
  console.log(`Stripe webhook received: ${event.type}`);
  
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const planTier = session.metadata?.planTier;
        
        if (!userId || !planTier) {
          console.error('Missing userId or planTier in session metadata');
          break;
        }
        
        console.log(`Checkout completed for user ${userId}, plan: ${planTier}`);
        
        await db.collection('users').doc(userId).update({
          planTier,
          subscriptionStatus: 'active',
          subscriptionSource: 'stripe',
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: session.subscription as string,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        
        console.log(`✅ User ${userId} upgraded to ${planTier} via Stripe`);
        break;
      }
      
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        
        const usersSnapshot = await db.collection('users')
          .where('stripeCustomerId', '==', subscription.customer)
          .limit(1)
          .get();
        
        if (usersSnapshot.empty) {
          console.log('No user found for customer:', subscription.customer);
          break;
        }
        
        const userDoc = usersSnapshot.docs[0];
        const status = subscription.status === 'active' ? 'active' : 
                       subscription.status === 'canceled' ? 'canceled' : 
                       subscription.status;
        
        const currentPeriodEnd = (subscription as any).current_period_end;
        
        await userDoc.ref.update({
          subscriptionStatus: status,
          subscriptionEndsAt: currentPeriodEnd ? admin.firestore.Timestamp.fromDate(
            new Date(currentPeriodEnd * 1000)
          ) : null,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        
        console.log(`✅ Subscription updated for user ${userDoc.id}: ${status}`);
        break;
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        
        const usersSnapshot = await db.collection('users')
          .where('stripeCustomerId', '==', subscription.customer)
          .limit(1)
          .get();
        
        if (usersSnapshot.empty) {
          console.log('No user found for customer:', subscription.customer);
          break;
        }
        
        const userDoc = usersSnapshot.docs[0];
        
        const endedAt = (subscription as any).ended_at;
        
        await userDoc.ref.update({
          planTier: 'free',
          subscriptionStatus: 'canceled',
          subscriptionEndsAt: endedAt ? admin.firestore.Timestamp.fromDate(
            new Date(endedAt * 1000)
          ) : null,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        
        console.log(`✅ Subscription canceled for user ${userDoc.id}`);
        break;
      }
      
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = (invoice as any).subscription;
        
        if (subscriptionId) {
          const usersSnapshot = await db.collection('users')
            .where('stripeSubscriptionId', '==', subscriptionId)
            .limit(1)
            .get();
          
          if (!usersSnapshot.empty) {
            const userDoc = usersSnapshot.docs[0];
            await userDoc.ref.update({
              subscriptionStatus: 'past_due',
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
            
            console.log(`⚠️ Payment failed for user ${userDoc.id}`);
          }
        }
        break;
      }
    }
    
    res.status(200).json({ received: true });
    return;
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).send('Webhook processing error');
    return;
  }
});

