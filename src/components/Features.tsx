import { motion } from "framer-motion";
import { 
  Calendar, 
  TrendingUp, 
  Shield, 
  Zap, 
  Brain, 
  Users,
  Clock,
  Target
} from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: Calendar,
      title: "Smart Scheduling",
      description: "AI-powered scheduling that adapts to your lifestyle and optimizes timing for maximum effectiveness.",
      gradient: "from-blue-500 to-cyan-400"
    },
    {
      icon: TrendingUp,
      title: "Progress Analytics",
      description: "Comprehensive tracking with detailed analytics, progress charts, and personalized insights.",
      gradient: "from-purple-500 to-pink-400"
    },
    {
      icon: Brain,
      title: "AI Recommendations",
      description: "Machine learning algorithms provide personalized recommendations based on your unique data.",
      gradient: "from-green-500 to-emerald-400"
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "End-to-end encryption ensures your health data remains private and secure at all times.",
      gradient: "from-red-500 to-orange-400"
    },
    {
      icon: Zap,
      title: "Real-time Sync",
      description: "Instant synchronization across all your devices with offline support and cloud backup.",
      gradient: "from-yellow-500 to-amber-400"
    },
    {
      icon: Users,
      title: "Community Hub",
      description: "Connect with other users, share experiences, and learn from the community.",
      gradient: "from-indigo-500 to-blue-400"
    },
    {
      icon: Clock,
      title: "Reminder System",
      description: "Never miss a dose with intelligent reminders that adapt to your schedule and preferences.",
      gradient: "from-teal-500 to-cyan-400"
    },
    {
      icon: Target,
      title: "Goal Tracking",
      description: "Set and track personalized goals with milestone celebrations and progress rewards.",
      gradient: "from-rose-500 to-pink-400"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 12
      }
    }
  };

  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
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
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Powerful Features</span>
          </motion.div>
          
          <h2 className="text-4xl lg:text-6xl font-bold mb-6">
            Everything you need to{" "}
            <span className="text-gradient">optimize</span> your protocol
          </h2>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            From intelligent scheduling to advanced analytics, PeptiSync provides 
            all the tools you need for successful peptide management.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              whileHover={{ 
                y: -10, 
                transition: { type: "spring", stiffness: 300 } 
              }}
              className="group glass-hover p-6 rounded-xl relative overflow-hidden"
            >
              {/* Animated Background Gradient */}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.2 }}
                transition={{ delay: index * 0.1 }}
                className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${feature.gradient} opacity-10 rounded-bl-full transition-all duration-500 group-hover:opacity-20`}
              />

              {/* Icon */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                whileInView={{ scale: 1, rotate: 0 }}
                transition={{ delay: index * 0.1 + 0.2, type: "spring" }}
                className="relative z-10 mb-4"
              >
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.gradient} p-3 shadow-lg`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
              </motion.div>

              {/* Content */}
              <div className="relative z-10">
                <h3 className="text-lg font-semibold mb-3 group-hover:text-gradient transition-all duration-300">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>

              {/* Hover Glow Effect */}
              <motion.div
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl pointer-events-none"
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="text-center mt-16"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-block"
          >
            <a 
              href="#pricing" 
              className="inline-flex items-center gap-2 gradient-primary px-8 py-4 rounded-lg text-primary-foreground font-semibold shadow-lg hover:shadow-neon transition-all duration-300"
            >
              Explore All Features
              <motion.div
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Zap className="w-5 h-5" />
              </motion.div>
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Features;