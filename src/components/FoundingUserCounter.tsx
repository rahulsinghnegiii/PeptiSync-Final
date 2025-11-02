import { motion, useInView } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useFoundingUserCounter } from "@/hooks/useFoundingUserCounter";
import { useRef, useState, useEffect } from "react";
import { Sparkles } from "lucide-react";

export const FoundingUserCounter = () => {
  const { current, total } = useFoundingUserCounter();
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.5 });

  const percentage = (current / total) * 100;
  const spotsRemaining = total - current;

  // Animate progress bar when section comes into view
  useEffect(() => {
    if (isInView && !hasAnimated) {
      setHasAnimated(true);
      // Animate from 0 to actual percentage
      const duration = 1500; // 1.5 seconds
      const steps = 60;
      const increment = percentage / steps;
      const stepDuration = duration / steps;

      let currentStep = 0;
      const timer = setInterval(() => {
        currentStep++;
        setAnimatedProgress(Math.min(increment * currentStep, percentage));
        
        if (currentStep >= steps) {
          clearInterval(timer);
        }
      }, stepDuration);

      return () => clearInterval(timer);
    }
  }, [isInView, hasAnimated, percentage]);

  // Announce to screen readers when counter updates
  useEffect(() => {
    if (current > 0) {
      const announcement = `${current} of ${total} founding member spots claimed. ${spotsRemaining} spots remaining.`;
      // Create a live region announcement
      const liveRegion = document.createElement('div');
      liveRegion.setAttribute('role', 'status');
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.className = 'sr-only';
      liveRegion.textContent = announcement;
      document.body.appendChild(liveRegion);
      
      setTimeout(() => {
        document.body.removeChild(liveRegion);
      }, 1000);
    }
  }, [current, total, spotsRemaining]);

  return (
    <section 
      ref={sectionRef}
      className="py-20 relative overflow-hidden"
      aria-labelledby="founding-user-heading"
    >
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background" aria-hidden="true" />
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary/30 rounded-full"
            initial={{
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200),
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
              scale: Math.random() * 0.5 + 0.5,
            }}
            animate={{
              y: [null, -50, -100],
              opacity: [0, 0.8, 0],
              scale: [null, 1.2, 0.8],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          {/* Icon */}
          <div className="inline-flex items-center justify-center p-3 rounded-full bg-primary/10 mb-6">
            <Sparkles className="w-8 h-8 text-primary" aria-hidden="true" />
          </div>

          {/* Heading */}
          <h2 id="founding-user-heading" className="text-4xl lg:text-5xl font-bold mb-4">
            Join the <span className="text-gradient">Founding Members</span>
          </h2>

          {/* Subheading */}
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Exclusive lifetime pricing for early adopters
          </p>

          {/* Progress Bar Container */}
          <div className="glass border-glass-border rounded-2xl p-8 mb-6">
            {/* Counter Display */}
            <div className="mb-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-5xl font-bold text-gradient">
                  {current}
                </span>
                <span className="text-2xl text-muted-foreground">
                  of {total}
                </span>
              </div>
              <p className="text-lg text-muted-foreground">
                Lifetime Deals Claimed
              </p>
            </div>

            {/* Progress Bar */}
            <div className="relative mb-4">
              <Progress 
                value={animatedProgress} 
                className="h-4"
                aria-label={`${percentage.toFixed(1)}% of founding member spots claimed`}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-foreground drop-shadow-lg">
                  {animatedProgress.toFixed(1)}%
                </span>
              </div>
            </div>

            {/* Urgency Message */}
            <div className="flex items-center justify-center gap-2 text-sm">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/20 text-primary font-medium">
                <Sparkles className="w-3 h-3" aria-hidden="true" />
                Only {spotsRemaining} spots remaining
              </span>
            </div>
          </div>

          {/* CTA Button */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <Button 
              variant="hero" 
              size="lg"
              className="text-lg px-8 py-6 h-auto"
              onClick={() => window.location.href = '/auth'}
              aria-label="Claim your founding member spot"
            >
              <Sparkles className="w-5 h-5 mr-2" aria-hidden="true" />
              Claim Your Spot
            </Button>
            <p className="text-sm text-muted-foreground mt-4">
              Lock in lifetime pricing before it's gone forever
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
