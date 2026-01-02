import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Lock, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import Navigation from './Navigation';
import Footer from './Footer';
import type { PlanTier } from '@/hooks/useSubscription';

interface FeatureLockedCardProps {
  featureName: string;
  requiredPlan: 'basic' | 'pro' | 'pro_plus' | 'elite';
  currentPlan?: PlanTier;
  benefits?: string[];
  price?: string;
  showNavigation?: boolean;
}

const planDisplayNames: Record<string, string> = {
  'basic': 'Basic',
  'pro': 'Pro',
  'pro_plus': 'Pro+',
  'elite': 'Elite',
};

const planPrices: Record<string, string> = {
  'basic': '$4.99/mo or $54.99/yr',
  'pro': '$9.99/mo or $99.99/yr',
  'pro_plus': '$19.99/mo or $199.99/yr',
  'elite': '$179.99/yr (Annual Only)',
};

const defaultBenefits: Record<string, string[]> = {
  'basic': [
    'Track up to 5 peptides',
    'Upload 20 progress photos per month',
    'Reconstitution tracker',
    '3-month calendar view',
    'Body measurement tracking',
  ],
  'pro': [
    'Unlimited peptides and photos',
    'Advanced analytics hub',
    'Full calendar history',
    'Symptom and dosage trends',
    'Supply inventory management',
  ],
  'pro_plus': [
    'Compare verified vendor pricing across all tiers',
    'Submit and track vendor pricing data',
    'Batch tracking for individual vials',
    'Low supply alerts and priority sync',
    'Plus all Pro features (unlimited tracking, analytics, etc.)',
  ],
  'elite': [
    'Data export (CSV/PDF)',
    'AI-powered dosage predictions',
    'Referral rewards system',
    'Beta features early access',
    'Priority support',
  ],
};

export const FeatureLockedCard = ({
  featureName,
  requiredPlan,
  currentPlan = 'free',
  benefits,
  price,
  showNavigation = true,
}: FeatureLockedCardProps) => {
  const planName = planDisplayNames[requiredPlan] || 'Pro+';
  const planPrice = price || planPrices[requiredPlan] || '$19.99/mo';
  const featureBenefits = benefits || defaultBenefits[requiredPlan] || [];

  const content = (
    <main className="max-w-4xl mx-auto px-4 py-16 mt-16">
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="glass border-glass-border">
          <CardContent className="p-8 lg:p-12">
            {/* Icon and Title */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted/50 mb-6"
              >
                <Lock className="w-10 h-10 text-muted-foreground" />
              </motion.div>
              
              <h1 className="text-3xl lg:text-4xl font-bold mb-4">
                {featureName}
              </h1>
              
              <Badge variant="outline" className="text-base px-4 py-1">
                {planName} Feature
              </Badge>
            </div>

            {/* Description */}
            <div className="text-center mb-8">
              <p className="text-lg text-muted-foreground">
                Upgrade to {planName} to unlock this premium feature and enhance your PeptiSync experience.
              </p>
            </div>

            {/* Benefits Section */}
            {featureBenefits.length > 0 && (
              <div className="bg-muted/30 rounded-lg p-6 lg:p-8 mb-8">
                <h3 className="font-semibold text-lg mb-4 text-center">
                  What you get with {planName}:
                </h3>
                <ul className="space-y-3">
                  {featureBenefits.map((benefit, index) => (
                    <motion.li
                      key={index}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                      className="flex items-start gap-3"
                    >
                      <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{benefit}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            )}

            {/* Pricing Info */}
            <div className="text-center mb-8">
              <p className="text-2xl font-bold text-gradient mb-2">
                {planPrice}
              </p>
              <p className="text-sm text-muted-foreground">
                Cancel anytime • No hidden fees
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/subscription" className="flex-1 sm:flex-initial">
                <Button size="lg" className="w-full bg-gradient-primary hover:opacity-90">
                  Upgrade to {planName}
                </Button>
              </Link>
              <Link to="/" className="flex-1 sm:flex-initial">
                <Button variant="outline" size="lg" className="w-full">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
            </div>

            {/* Current Plan Info */}
            {currentPlan && currentPlan !== 'admin' && (
              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Current plan:{' '}
                  <strong className="capitalize">
                    {currentPlan === 'pro_plus' ? 'Pro+' : currentPlan}
                  </strong>
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </main>
  );

  if (showNavigation) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        {content}
        <Footer />
      </div>
    );
  }

  return content;
};

