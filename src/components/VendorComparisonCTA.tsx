/**
 * Vendor Comparison CTA
 * 
 * Call-to-action section for the vendor comparison feature
 * Displayed on homepage to drive discovery
 */

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { LoginPromptDialog } from "./LoginPromptDialog";
import { useState } from "react";
import { 
  TrendingDown, 
  Shield, 
  CheckCircle2, 
  ArrowRight,
  DollarSign,
  Sparkles,
  Lock
} from "lucide-react";

export const VendorComparisonCTA = () => {
  const { user } = useAuth();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const features = [
    {
      icon: <DollarSign className="w-5 h-5" />,
      text: "Compare $/mg across research peptide vendors",
    },
    {
      icon: <Shield className="w-5 h-5" />,
      text: "Verified pricing data",
    },
    {
      icon: <TrendingDown className="w-5 h-5" />,
      text: "Find the best deals instantly",
    },
  ];

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-background to-muted/20">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <Badge variant="outline" className="mb-4">
            <Sparkles className="w-3 h-3 mr-1" />
            New Feature
          </Badge>
          <h2 className="text-4xl font-bold mb-4 text-gradient">
            Compare Vendor Pricing
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Stop overpaying. Compare verified pricing across 50+ vendors in seconds.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="glass border-glass-border overflow-hidden max-w-4xl mx-auto">
            <CardContent className="p-8 md:p-12">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                {/* Left: Features */}
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold">3 Tiers of Vendors</h3>
                  <div className="space-y-4">
                    {features.map((feature, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                        className="flex items-start gap-3"
                      >
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                          {feature.icon}
                        </div>
                        <p className="text-muted-foreground pt-1">{feature.text}</p>
                      </motion.div>
                    ))}
                  </div>

                  {/* Tier Pills */}
                  <div className="flex flex-wrap gap-2 pt-4">
                    <Badge variant="outline" className="bg-blue-500/10">
                      Research Peptides
                    </Badge>
                    <Badge variant="outline" className="bg-purple-500/10">
                      Telehealth Clinics
                    </Badge>
                    <Badge variant="outline" className="bg-orange-500/10">
                      Brand GLPs
                    </Badge>
                  </div>
                </div>

                {/* Right: CTA */}
                <div className="flex flex-col items-center justify-center space-y-6 p-8 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg border border-primary/20">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mb-4">
                      {user ? (
                        <CheckCircle2 className="w-8 h-8 text-primary" />
                      ) : (
                        <Lock className="w-8 h-8 text-primary" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Updated daily with verified pricing
                    </p>
                    <p className="text-3xl font-bold mb-1">Members Only</p>
                    <p className="text-sm text-muted-foreground">
                      {user ? "You have access" : "Login required"}
                    </p>
                  </div>

                  {user ? (
                    <Link to="/vendor-comparison" className="w-full">
                      <Button size="lg" className="w-full group" variant="hero">
                        Compare Prices Now
                        <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  ) : (
                    <Button 
                      size="lg" 
                      className="w-full group" 
                      variant="hero"
                      onClick={() => setShowLoginPrompt(true)}
                    >
                      Login to Access
                      <Lock className="ml-2 w-4 h-4" />
                    </Button>
                  )}

                  <p className="text-xs text-center text-muted-foreground">
                    {user 
                      ? "Exclusive member benefit • Updated daily"
                      : "Free for all members • Sign up today"
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 text-center"
        >
          <p className="text-sm text-muted-foreground mb-4">Trusted by the peptide community</p>
          <div className="flex justify-center items-center gap-8 flex-wrap">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-sm">Verified Data</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              <span className="text-sm">Daily Updates</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-primary" />
              <span className="text-sm">Best Price Guarantee</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Login Prompt Dialog */}
      <LoginPromptDialog
        open={showLoginPrompt}
        onOpenChange={setShowLoginPrompt}
        featureName="Vendor Comparison"
      />
    </section>
  );
};
