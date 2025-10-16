import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, Star, Zap, Crown } from "lucide-react";

const Pricing = () => {
  const plans = [
    {
      name: "Free",
      price: "0",
      period: "forever",
      description: "Perfect for getting started with basic peptide tracking",
      icon: Star,
      gradient: "from-gray-500 to-gray-600",
      features: [
        "Basic peptide tracking",
        "Simple scheduling",
        "7-day history",
        "Manual reminders",
        "Basic analytics",
        "Community access"
      ],
      cta: "Get Started Free",
      popular: false
    },
    {
      name: "Pro",
      price: "19",
      period: "month",
      description: "Advanced features for serious peptide users",
      icon: Zap,
      gradient: "from-blue-500 to-cyan-400",
      features: [
        "Everything in Free",
        "AI-powered scheduling",
        "Unlimited history",
        "Smart reminders",
        "Advanced analytics",
        "Progress insights",
        "Goal tracking",
        "Priority support"
      ],
      cta: "Start Pro Trial",
      popular: true
    },
    {
      name: "Pro+",
      price: "39",
      period: "month",
      description: "Complete solution with premium features and support",
      icon: Crown,
      gradient: "from-purple-500 to-pink-400",
      features: [
        "Everything in Pro",
        "Personal coach access",
        "Custom protocols",
        "Lab integrations",
        "Telehealth consultations",
        "Priority lab processing",
        "White-glove onboarding",
        "24/7 dedicated support"
      ],
      cta: "Go Premium",
      popular: false
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { y: 50, opacity: 0, scale: 0.9 },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 15
      }
    }
  };

  return (
    <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, type: "spring" }}
            className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full mb-6"
          >
            <Crown className="w-4 h-4 text-secondary" />
            <span className="text-sm font-medium">Simple Pricing</span>
          </motion.div>
          
          <h2 className="text-4xl lg:text-6xl font-bold mb-6">
            Choose your{" "}
            <span className="text-gradient">perfect plan</span>
          </h2>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Start free and upgrade as you grow. All plans include core features 
            with 14-day money-back guarantee.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto"
        >
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              variants={cardVariants}
              whileHover={{ 
                y: -10,
                transition: { type: "spring", stiffness: 300 }
              }}
              className={`relative glass-hover p-8 rounded-2xl ${
                plan.popular 
                  ? 'border-2 border-primary glow' 
                  : 'border border-glass-border/50'
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <motion.div
                  initial={{ scale: 0, rotate: -10 }}
                  whileInView={{ scale: 1, rotate: 0 }}
                  transition={{ delay: index * 0.2 + 0.3, type: "spring" }}
                  className="absolute -top-4 left-1/2 transform -translate-x-1/2"
                >
                  <div className="gradient-primary px-4 py-1 rounded-full text-sm font-semibold text-primary-foreground">
                    Most Popular
                  </div>
                </motion.div>
              )}

              {/* Plan Icon */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                whileInView={{ scale: 1, rotate: 0 }}
                transition={{ delay: index * 0.2 + 0.1, type: "spring" }}
                className="mb-6"
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${plan.gradient} p-3 shadow-lg`}>
                  <plan.icon className="w-8 h-8 text-white" />
                </div>
              </motion.div>

              {/* Plan Details */}
              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  {plan.description}
                </p>
                
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-gradient">${plan.price}</span>
                  <span className="text-muted-foreground">/{plan.period}</span>
                </div>
              </div>

              {/* Features List */}
              <motion.ul 
                initial="hidden"
                whileInView="visible"
                variants={{
                  visible: {
                    transition: {
                      staggerChildren: 0.05,
                      delayChildren: index * 0.2 + 0.4
                    }
                  }
                }}
                className="space-y-3 mb-8"
              >
                {plan.features.map((feature, featureIndex) => (
                  <motion.li
                    key={featureIndex}
                    variants={{
                      hidden: { x: -20, opacity: 0 },
                      visible: { x: 0, opacity: 1 }
                    }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-5 h-5 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-success" />
                    </div>
                    <span className="text-sm text-foreground">{feature}</span>
                  </motion.li>
                ))}
              </motion.ul>

              {/* CTA Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 + 0.6 }}
              >
                <Button
                  variant={plan.popular ? "hero" : "glass"}
                  size="lg"
                  className="w-full"
                >
                  {plan.cta}
                </Button>
              </motion.div>

              {/* Hover Glow Effect */}
              <motion.div
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                className={`absolute inset-0 bg-gradient-to-br ${plan.gradient} opacity-5 rounded-2xl pointer-events-none`}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="text-center mt-16"
        >
          <p className="text-muted-foreground mb-6">
            All plans include 14-day free trial • Cancel anytime • No setup fees
          </p>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="inline-block"
          >
            <a 
              href="#" 
              className="text-primary hover:text-primary/80 font-medium underline underline-offset-4"
            >
              Compare all features →
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Pricing;