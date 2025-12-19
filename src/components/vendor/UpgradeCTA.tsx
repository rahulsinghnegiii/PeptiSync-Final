import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Crown, Check } from "lucide-react";
import { Link } from "react-router-dom";

export const UpgradeCTA = () => {
  const features = [
    "Full vendor details and contact info",
    "Exclusive discount codes",
    "Price history and trends",
    "Compare 50+ verified vendors",
    "Real-time price alerts",
    "Priority support",
  ];

  return (
    <motion.div
      initial={{ y: 30, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <Card className="glass border-primary/50 bg-gradient-to-br from-primary/10 to-transparent">
        <CardContent className="p-8 md:p-12">
          <div className="text-center mb-8">
            <Crown className="w-16 h-16 mx-auto mb-4 text-primary" />
            <h3 className="text-3xl font-bold mb-4">
              Unlock Full Vendor Comparison
            </h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Upgrade to Pro+ to access complete vendor information, exclusive discounts, 
              and advanced price comparison features.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-8 max-w-3xl mx-auto">
            {features.map((feature, index) => (
              <motion.div
                key={feature}
                initial={{ x: -20, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="flex items-start gap-3"
              >
                <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-sm">{feature}</span>
              </motion.div>
            ))}
          </div>

          <div className="text-center">
            <Link to="/auth">
              <Button size="lg" className="gradient-primary">
                <Crown className="w-5 h-5 mr-2" />
                Upgrade to Pro+
              </Button>
            </Link>
            <p className="text-xs text-muted-foreground mt-4">
              7-day free trial • Cancel anytime
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

