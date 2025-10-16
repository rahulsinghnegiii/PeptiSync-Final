import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import Features from "@/components/Features";
import { motion } from "framer-motion";

const FeaturesPage = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background"></div>
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl lg:text-6xl font-bold mb-6">
                Advanced <span className="text-gradient">Features</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Discover the powerful tools and capabilities that make PeptiSync 
                the ultimate peptide tracking platform.
              </p>
            </motion.div>
          </div>
        </section>
        
        <Features />
      </main>
      <Footer />
    </div>
  );
};

export default FeaturesPage;