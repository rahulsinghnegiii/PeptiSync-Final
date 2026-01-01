import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Download, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { AppStoreButtons } from "@/components/AppStoreButtons";
import heroBg from "@/assets/hero-bg.jpg";
import appPreview from "@/assets/app-preview.png";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden" aria-labelledby="hero-heading">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0" aria-hidden="true">
        <img 
          src={heroBg} 
          alt="" 
          className="w-full h-full object-cover opacity-20"
          role="presentation"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background"></div>
      </div>

      {/* Animated Background Particles */}
      <div className="absolute inset-0" aria-hidden="true">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary rounded-full"
            initial={{ 
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              opacity: 0 
            }}
            animate={{
              y: [null, -100, -200],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Text Content */}
          <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center lg:text-left"
          >
            {/* Badge */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
              className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full mb-6"
              aria-label="Feature badge"
            >
              <Sparkles className="w-4 h-4 text-primary" aria-hidden="true" />
              <span className="text-sm font-medium">Next-gen peptide tracking</span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              id="hero-heading"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-5xl lg:text-7xl font-bold leading-tight mb-6"
            >
              Track peptides.{" "}
              <span className="text-gradient">Stay on schedule.</span>{" "}
              See your progress.
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="text-xl text-muted-foreground mb-8 max-w-2xl"
            >
              The most advanced peptide tracking platform. Monitor your protocols, 
              track progress, and optimize results with AI-powered insights.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="flex flex-col gap-4 justify-center lg:justify-start"
            >
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/auth">
                  <Button variant="hero" size="xl" className="group w-full sm:w-auto" aria-label="Get started with PeptiSync">
                    Get Started
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                  </Button>
                </Link>
                <Link to="/download">
                  <Button variant="glass" size="xl" className="w-full sm:w-auto" aria-label="Download PeptiSync app">
                    <Download className="w-5 h-5 mr-2" aria-hidden="true" />
                    Download App
                  </Button>
                </Link>
              </div>
              
              {/* App Store Buttons */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 0.8 }}
                className="flex justify-center lg:justify-start"
              >
                <AppStoreButtons />
              </motion.div>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.8 }}
              className="flex justify-center lg:justify-start gap-8 mt-12"
              role="region"
              aria-label="Platform statistics"
            >
              {[
                { label: "Active Users", value: "50K+" },
                { label: "Tracked Protocols", value: "1M+" },
                { label: "Success Rate", value: "98%" },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1.4 + index * 0.1, type: "spring" }}
                  className="text-center"
                >
                  <div className="text-2xl font-bold text-gradient" aria-label={`${stat.value} ${stat.label}`}>
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground" aria-hidden="true">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right Column - App Preview */}
          <motion.div
            initial={{ x: 100, opacity: 0, scale: 0.8 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 1, ease: "easeOut" }}
            className="relative"
            aria-label="Application preview"
          >
            <div className="relative">
              {/* Floating Glow Effect */}
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, 0] 
                }}
                transition={{ 
                  duration: 6, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
                className="absolute inset-0 gradient-glow rounded-2xl blur-3xl opacity-30"
                aria-hidden="true"
              />
              
              {/* App Preview Image */}
              <motion.div
                whileHover={{ scale: 1.02, rotateY: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="relative glass p-4 rounded-2xl"
              >
                <img
                  src={appPreview}
                  alt="PeptiSync application interface showing peptide tracking dashboard with charts and protocol management"
                  className="w-full rounded-xl shadow-2xl"
                />
              </motion.div>

              {/* Floating UI Elements */}
              <motion.div
                animate={{ y: [-10, 10, -10] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-4 -right-4 glass p-3 rounded-lg"
                aria-label="Live tracking indicator"
              >
                <div className="w-3 h-3 bg-success rounded-full animate-pulse" aria-hidden="true"></div>
                <span className="text-xs font-medium ml-2">Live Tracking</span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;