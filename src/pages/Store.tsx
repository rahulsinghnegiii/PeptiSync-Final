import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ExternalLink, ShoppingBag } from "lucide-react";

const Store = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main id="main-content" className="pt-20">
        {/* Hero Section */}
        <section className="relative py-32 overflow-hidden" aria-labelledby="store-heading">
          <div className="absolute inset-0" aria-hidden="true">
            {Array.from({ length: 15 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-primary rounded-full"
                initial={{ 
                  x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200),
                  y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
                  opacity: 0 
                }}
                animate={{
                  y: [null, -100, -200],
                  opacity: [0, 0.6, 0],
                }}
                transition={{
                  duration: 4 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 3,
                }}
              />
            ))}
          </div>
          
          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
                <ShoppingBag className="w-10 h-10 text-primary" />
              </div>
              
              <h1 id="store-heading" className="text-5xl lg:text-6xl font-bold mb-6">
                Shop Physical <span className="text-gradient">Products</span>
              </h1>
              
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
                Looking for peptide tracking accessories, supplies, and tools? 
                Visit our dedicated e-commerce store for all physical products.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button
                  variant="hero"
                  size="lg"
                  className="group"
                  onClick={() => window.open('https://your-external-store.com', '_blank')}
                >
                  Visit Our Store
                  <ExternalLink className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => window.location.href = '/'}
                >
                  Back to Home
                </Button>
              </div>

              <div className="mt-16 pt-16 border-t border-border">
                <p className="text-sm text-muted-foreground mb-4">
                  Our external store offers:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                  <div className="glass p-6 rounded-lg">
                    <h3 className="font-semibold mb-2">Premium Supplies</h3>
                    <p className="text-sm text-muted-foreground">
                      High-quality peptide tracking accessories and tools
                    </p>
                  </div>
                  <div className="glass p-6 rounded-lg">
                    <h3 className="font-semibold mb-2">Fast Shipping</h3>
                    <p className="text-sm text-muted-foreground">
                      Quick delivery on all orders with tracking
                    </p>
                  </div>
                  <div className="glass p-6 rounded-lg">
                    <h3 className="font-semibold mb-2">Secure Checkout</h3>
                    <p className="text-sm text-muted-foreground">
                      Safe and secure payment processing
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Store;