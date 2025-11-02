import { motion } from "framer-motion";
import { Activity, Calendar, Package, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: Activity,
    title: "Peptide Tracker",
    description: "Log dose, time, injection site with ease. Track multiple peptides simultaneously with detailed history and never miss a dose.",
  },
  {
    icon: Calendar,
    title: "Protocol Calendar",
    description: "Schedule and track your cycles. Visualize your protocol timeline with daily, weekly, and monthly views for complete oversight.",
  },
  {
    icon: Package,
    title: "Inventory Manager",
    description: "Monitor supply levels automatically. Get low stock alerts and track batch numbers for safety and peace of mind.",
  },
  {
    icon: TrendingUp,
    title: "Progress Analytics",
    description: "AI-powered insights for optimization. Visualize trends, track symptoms, and optimize your protocols with data-driven decisions.",
  },
];

export const HowItWorks = () => {
  return (
    <section className="py-20 bg-background" aria-labelledby="how-it-works-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 id="how-it-works-heading" className="text-4xl lg:text-5xl font-bold mb-4">
            How It <span className="text-gradient">Works</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Everything you need to track, manage, and optimize your peptide protocols in one powerful platform
          </p>
        </motion.div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 lg:gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <Card 
                  className="glass border-glass-border h-full group hover:border-primary/30 hover:-translate-y-1 transition-all duration-300 hover:shadow-xl"
                  role="article"
                  aria-labelledby={`feature-${index}-title`}
                >
                  <CardContent className="p-8">
                    {/* Icon */}
                    <div className="mb-6 inline-flex p-4 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300">
                      <Icon 
                        className="w-8 h-8 text-primary" 
                        aria-hidden="true"
                      />
                    </div>

                    {/* Title */}
                    <h3 
                      id={`feature-${index}-title`}
                      className="text-2xl font-bold mb-3 group-hover:text-gradient transition-all duration-300"
                    >
                      {feature.title}
                    </h3>

                    {/* Description */}
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Optional CTA */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-center mt-12"
        >
          <p className="text-muted-foreground mb-4">
            Ready to take control of your peptide journey?
          </p>
          <a
            href="/auth"
            className="inline-flex items-center justify-center px-8 py-3 text-base font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors duration-300"
            aria-label="Get started with PeptiSync"
          >
            Get Started Free
          </a>
        </motion.div>
      </div>
    </section>
  );
};
