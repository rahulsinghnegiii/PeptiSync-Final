import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Check, Sparkles, Crown } from "lucide-react";
import { pricingTiers, PricingTier } from "@/types/pricing";
import { useNavigate } from "react-router-dom";

type BillingPeriod = 'monthly' | 'yearly';

export const PricingComparison = () => {
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('monthly');
  const navigate = useNavigate();

  const handleChoosePlan = (tier: PricingTier) => {
    if (tier.id === 'free') {
      // Free plan - navigate to signup
      navigate('/auth?mode=signup');
    } else if (tier.id === 'elite') {
      // Elite plan - always annual
      navigate('/auth?mode=signup&plan=elite');
    } else {
      // Paid plans with monthly/yearly options
      navigate(`/auth?mode=signup&plan=${tier.id}&billing=${billingPeriod}`);
    }
  };

  const getDisplayPrice = (tier: PricingTier) => {
    if (tier.id === 'free') {
      return { amount: 'Free', period: '' };
    }
    if (tier.id === 'elite') {
      return { amount: `$${tier.prices.annual}`, period: '/year' };
    }
    if (billingPeriod === 'yearly' && tier.prices.yearly) {
      return { amount: `$${tier.prices.yearly}`, period: '/year' };
    }
    return { amount: `$${tier.prices.monthly}`, period: '/month' };
  };

  const showSavingsBadge = (tier: PricingTier) => {
    if (billingPeriod === 'yearly' && tier.savings?.yearly) {
      return (
        <Badge variant="secondary" className="bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30">
          Save ${tier.savings.yearly}/year
        </Badge>
      );
    }
    return null;
  };

  return (
    <section className="py-20 bg-background" aria-labelledby="pricing-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 id="pricing-heading" className="text-4xl lg:text-5xl font-bold mb-4">
            Choose Your <span className="text-gradient">Plan</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Start free and upgrade as you grow. All plans include our core tracking features.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <span className={`text-base font-medium transition-colors ${billingPeriod === 'monthly' ? 'text-foreground' : 'text-muted-foreground'}`}>
              Monthly
            </span>
            <Switch
              checked={billingPeriod === 'yearly'}
              onCheckedChange={(checked) => setBillingPeriod(checked ? 'yearly' : 'monthly')}
              aria-label="Toggle between monthly and yearly billing"
            />
            <span className={`text-base font-medium transition-colors ${billingPeriod === 'yearly' ? 'text-foreground' : 'text-muted-foreground'}`}>
              Yearly
              <Badge variant="secondary" className="ml-2 bg-primary/20 text-primary">
                Save up to $20
              </Badge>
            </span>
          </div>
        </motion.div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 lg:gap-4">
          {pricingTiers.map((tier, index) => {
            const price = getDisplayPrice(tier);
            const isPopular = tier.badge === 'popular';
            const isLimited = tier.badge === 'limited';

            return (
              <motion.div
                key={tier.id}
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className={`relative ${isPopular || isLimited ? 'lg:scale-105' : ''}`}
              >
                <Card
                  className={`glass border-glass-border h-full flex flex-col relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl
                    ${isPopular ? 'border-primary shadow-lg shadow-primary/20' : ''}
                    ${isLimited ? 'border-yellow-500/50 shadow-lg shadow-yellow-500/20' : ''}
                  `}
                  role="article"
                  aria-labelledby={`plan-${tier.id}-title`}
                >
                  {/* Badge */}
                  {isPopular && (
                    <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50" aria-hidden="true" />
                  )}
                  {isLimited && (
                    <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-yellow-500/50 via-yellow-500 to-yellow-500/50" aria-hidden="true" />
                  )}

                  <CardHeader className="text-center pb-4">
                    {/* Plan Badge */}
                    {isPopular && (
                      <Badge className="mb-3 bg-primary text-primary-foreground">
                        <Sparkles className="w-3 h-3 mr-1" aria-hidden="true" />
                        Most Popular
                      </Badge>
                    )}
                    {isLimited && (
                      <Badge className="mb-3 bg-yellow-500 text-yellow-950 dark:text-yellow-50">
                        <Crown className="w-3 h-3 mr-1" aria-hidden="true" />
                        Only {tier.userLimit} Spots Available
                      </Badge>
                    )}

                    {/* Plan Name */}
                    <CardTitle id={`plan-${tier.id}-title`} className="text-2xl font-bold mb-2">
                      {tier.name}
                    </CardTitle>

                    {/* Price */}
                    <div className="mb-2">
                      <span className="text-4xl font-bold text-primary">
                        {price.amount}
                      </span>
                      {price.period && (
                        <span className="text-muted-foreground text-lg">
                          {price.period}
                        </span>
                      )}
                    </div>

                    {/* Savings Badge */}
                    <div className="h-6">
                      {showSavingsBadge(tier)}
                    </div>
                  </CardHeader>

                  <CardContent className="flex-1 flex flex-col">
                    {/* Features List */}
                    <ul className="space-y-3 mb-6 flex-1" role="list" aria-label={`${tier.name} plan features`}>
                      {tier.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check 
                            className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" 
                            aria-hidden="true"
                          />
                          <span className={`text-sm ${feature.includes('Everything in') ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA Button */}
                    <Button
                      variant={isPopular ? 'hero' : isLimited ? 'default' : 'outline'}
                      className={`w-full ${isLimited ? 'bg-yellow-500 hover:bg-yellow-600 text-yellow-950 dark:text-yellow-50' : ''}`}
                      onClick={() => handleChoosePlan(tier)}
                      aria-label={`Choose ${tier.name} plan`}
                    >
                      {tier.id === 'free' ? 'Get Started' : isLimited ? 'Claim Limited Spot' : 'Choose Plan'}
                    </Button>

                    {/* Entitlement Info */}
                    <p className="text-xs text-center text-muted-foreground mt-3">
                      Entitlement: {tier.entitlement}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Additional Info */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="text-center mt-12"
        >
          <p className="text-sm text-muted-foreground">
            All plans include 14-day money-back guarantee. Cancel anytime.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Need help choosing? <a href="/faq" className="text-primary hover:underline">View our FAQ</a>
          </p>
        </motion.div>
      </div>
    </section>
  );
};
