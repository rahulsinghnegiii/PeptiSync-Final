import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { PageHeader } from "@/components/PageHeader";
import { MedicalDisclaimer } from "@/components/MedicalDisclaimer";
import { VendorPricingTable } from "@/components/vendor/VendorPricingTable";
import { UpgradeCTA } from "@/components/vendor/UpgradeCTA";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { DollarSign, TrendingDown, Shield, Clock } from "lucide-react";
import { useApprovedVendorPrices } from "@/hooks/useVendorSubmissions";
import { Link } from "react-router-dom";

const VendorPricing = () => {
  const { submissions, loading } = useApprovedVendorPrices(10); // Show only 10 for preview

  const lastUpdated = submissions.length > 0 && submissions[0].reviewedAt
    ? submissions[0].reviewedAt.toDate().toLocaleDateString()
    : "Recently";

  const features = [
    {
      icon: <DollarSign className="w-6 h-6" />,
      title: "Best Prices",
      description: "Compare prices from 50+ verified vendors to find the best deals"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Verified Vendors",
      description: "All vendors are verified and reviewed by our community"
    },
    {
      icon: <TrendingDown className="w-6 h-6" />,
      title: "Price Trends",
      description: "Track price history and get alerts when prices drop"
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Real-Time Updates",
      description: "Prices updated daily to ensure accuracy"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main id="main-content" className="flex-grow pt-16">
        <PageHeader
          title="Vendor Price Comparison"
          subtitle="Find the best peptide prices from verified vendors worldwide"
          badge="Community Powered"
          icon={<DollarSign className="w-4 h-4 text-primary" />}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
          {/* Feature Explanation */}
          <motion.section
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="glass border-glass-border h-full">
                    <CardContent className="p-6">
                      <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center mb-4 text-white">
                        {feature.icon}
                      </div>
                      <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Medical Disclaimer */}
          <motion.section
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <MedicalDisclaimer variant="medium" />
          </motion.section>

          {/* Preview Table */}
          <motion.section
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-3xl font-bold mb-2">Price Preview</h2>
                <p className="text-sm text-muted-foreground">
                  Last updated: {lastUpdated}
                </p>
              </div>
              <Link to="/contact">
                <Button variant="outline">
                  Submit a Price
                </Button>
              </Link>
            </div>

            {loading ? (
              <Card className="glass border-glass-border">
                <CardContent className="p-12 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading prices...</p>
                </CardContent>
              </Card>
            ) : (
              <VendorPricingTable submissions={submissions} showFullDetails={false} />
            )}

            <p className="text-center text-sm text-muted-foreground mt-4">
              Showing limited preview • Full details available in Pro+
            </p>
          </motion.section>

          {/* Upgrade CTA */}
          <UpgradeCTA />

          {/* How It Works */}
          <motion.section
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="glass border-glass-border">
              <CardContent className="p-8 md:p-12">
                <h2 className="text-3xl font-bold mb-8 text-center">How It Works</h2>
                <div className="grid md:grid-cols-3 gap-8">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                      1
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Community Submits</h3>
                    <p className="text-muted-foreground">
                      Users submit vendor prices they've found with proof
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                      2
                    </div>
                    <h3 className="text-xl font-semibold mb-2">We Verify</h3>
                    <p className="text-muted-foreground">
                      Our team reviews and verifies all submissions for accuracy
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                      3
                    </div>
                    <h3 className="text-xl font-semibold mb-2">You Save</h3>
                    <p className="text-muted-foreground">
                      Compare verified prices and find the best deals instantly
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.section>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default VendorPricing;

