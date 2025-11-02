import { motion } from "framer-motion";
import { TrackerDemo } from "./FeaturePreviews/TrackerDemo";
import { ProtocolLibrary } from "./FeaturePreviews/ProtocolLibrary";
import { VendorPriceTracker } from "./FeaturePreviews/VendorPriceTracker";

export const FeaturePreviews = () => {
  return (
    <section className="py-20 bg-muted/30" aria-labelledby="feature-previews-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 id="feature-previews-heading" className="text-4xl lg:text-5xl font-bold mb-4">
            See PeptiSync in <span className="text-gradient">Action</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Explore the powerful features that make PeptiSync the ultimate peptide tracking platform
          </p>
        </motion.div>

        {/* Tracker Demo */}
        <div className="mb-24">
          <TrackerDemo />
        </div>

        {/* Protocol Library */}
        <div className="mb-24">
          <ProtocolLibrary />
        </div>

        {/* Vendor Price Tracker */}
        <div>
          <VendorPriceTracker />
        </div>
      </div>
    </section>
  );
};
