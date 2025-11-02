import { motion } from "framer-motion";
import { Calendar, Package, TrendingUp, Activity } from "lucide-react";
import { useEventListener } from "@/hooks/useCleanup";
import { useState, useRef, useEffect } from "react";

interface HowItWorksStep {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const steps: HowItWorksStep[] = [
  {
    icon: <Activity className="w-8 h-8 text-wellness-green-500" />,
    title: "Peptide Tracker",
    description: "Log your peptide doses, track timing, and monitor your daily routine with ease. Never miss a dose again.",
  },
  {
    icon: <Calendar className="w-8 h-8 text-wellness-blue-500" />,
    title: "Smart Calendar",
    description: "Visualize your protocol schedule, set reminders, and plan your cycles with our intelligent calendar system.",
  },
  {
    icon: <Package className="w-8 h-8 text-wellness-coral-500" />,
    title: "Inventory Management",
    description: "Keep track of your peptide stock, expiration dates, and reorder alerts. Stay organized and prepared.",
  },
  {
    icon: <TrendingUp className="w-8 h-8 text-wellness-green-600" />,
    title: "Progress Analytics",
    description: "Visualize your results with detailed charts and insights. Make data-driven decisions about your protocols.",
  },
];

const HowItWorks = () => {
  const [visibleSteps, setVisibleSteps] = useState<Set<number>>(new Set());
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute('data-index') || '0');
            setVisibleSteps(prev => new Set(prev).add(index));
          }
        });
      },
      { threshold: 0.2 }
    );

    const stepElements = sectionRef.current?.querySelectorAll('[data-index]');
    stepElements?.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <section 
      ref={sectionRef}
      className="py-20 lg:py-32 bg-gradient-to-b from-white to-wellness-green-50/30"
      aria-labelledby="how-it-works-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 
            id="how-it-works-heading"
            className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-foreground"
          >
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to manage your peptide protocols in one beautiful, intuitive platform.
          </p>
        </motion.div>

        {/* Steps Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              data-index={index}
              initial={{ y: 50, opacity: 0 }}
              animate={visibleSteps.has(index) ? { y: 0, opacity: 1 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="wellness-card-hover p-6 text-center group"
            >
              {/* Icon */}
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-wellness-green-50 to-wellness-blue-50 mb-4 group-hover:shadow-medium transition-shadow"
              >
                {step.icon}
              </motion.div>

              {/* Title */}
              <h3 className="text-xl font-semibold mb-3 text-foreground">
                {step.title}
              </h3>

              {/* Description */}
              <p className="text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
