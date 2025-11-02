import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingDown, Store, ArrowRight, Star } from "lucide-react";

const sampleListings = [
  { 
    id: 1, 
    product: 'BPC-157 (5mg)', 
    vendor: 'VendorX', 
    price: 45.99,
    rating: 4.8,
    inStock: true,
  },
  { 
    id: 2, 
    product: 'TB-500 (5mg)', 
    vendor: 'VendorY', 
    price: 52.99,
    rating: 4.6,
    inStock: true,
  },
  { 
    id: 3, 
    product: 'Semaglutide (2mg)', 
    vendor: 'VendorZ', 
    price: 89.99,
    rating: 4.9,
    inStock: false,
  },
  { 
    id: 4, 
    product: 'GHK-Cu (50mg)', 
    vendor: 'VendorA', 
    price: 38.99,
    rating: 4.7,
    inStock: true,
  },
  { 
    id: 5, 
    product: 'Ipamorelin (5mg)', 
    vendor: 'VendorB', 
    price: 42.99,
    rating: 4.5,
    inStock: true,
  },
];

export const VendorPriceTracker = () => {
  return (
    <div className="space-y-8">
      {/* Section Header */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <h3 className="text-3xl font-bold mb-4">
          Vendor <span className="text-gradient">Price Tracker</span>
        </h3>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Compare prices from 50+ verified vendors in real-time. Find the best deals and save money on your peptide purchases.
        </p>
      </motion.div>

      {/* Price Comparison Table */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Card className="glass border-glass-border overflow-hidden">
          {/* Table Header */}
          <div className="bg-primary/5 border-b border-glass-border px-6 py-4">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-primary" aria-hidden="true" />
              <h4 className="font-semibold">Current Best Prices</h4>
            </div>
          </div>

          {/* Table Content */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-glass-border text-sm text-muted-foreground">
                  <th className="text-left px-6 py-3 font-medium">Product</th>
                  <th className="text-left px-6 py-3 font-medium">Vendor</th>
                  <th className="text-left px-6 py-3 font-medium">Rating</th>
                  <th className="text-right px-6 py-3 font-medium">Price</th>
                  <th className="text-center px-6 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {sampleListings.map((listing, index) => (
                  <motion.tr
                    key={listing.id}
                    initial={{ x: -20, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1, duration: 0.4 }}
                    className="border-b border-glass-border/50 hover:bg-primary/5 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className="font-medium">{listing.product}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Store className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
                        <span className="text-muted-foreground">{listing.vendor}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-primary text-primary" aria-hidden="true" />
                        <span className="text-sm font-medium">{listing.rating}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-lg font-bold text-primary">
                        ${listing.price.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {listing.inStock ? (
                        <Badge variant="secondary" className="bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30">
                          In Stock
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30">
                          Out of Stock
                        </Badge>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="bg-muted/30 px-6 py-4 border-t border-glass-border">
            <p className="text-sm text-muted-foreground text-center">
              Compare prices from 50+ verified vendors in the app
            </p>
          </div>
        </Card>
      </motion.div>

      {/* Features List */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="grid md:grid-cols-3 gap-6"
      >
        <div className="text-center">
          <div className="inline-flex p-3 rounded-xl bg-primary/10 mb-3">
            <TrendingDown className="w-6 h-6 text-primary" aria-hidden="true" />
          </div>
          <h5 className="font-semibold mb-2">Real-Time Pricing</h5>
          <p className="text-sm text-muted-foreground">
            Prices updated daily from verified vendors
          </p>
        </div>
        <div className="text-center">
          <div className="inline-flex p-3 rounded-xl bg-primary/10 mb-3">
            <Store className="w-6 h-6 text-primary" aria-hidden="true" />
          </div>
          <h5 className="font-semibold mb-2">Verified Vendors</h5>
          <p className="text-sm text-muted-foreground">
            Only trusted and reviewed suppliers
          </p>
        </div>
        <div className="text-center">
          <div className="inline-flex p-3 rounded-xl bg-primary/10 mb-3">
            <Star className="w-6 h-6 text-primary" aria-hidden="true" />
          </div>
          <h5 className="font-semibold mb-2">User Reviews</h5>
          <p className="text-sm text-muted-foreground">
            Real ratings from verified purchases
          </p>
        </div>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className="text-center"
      >
        <Button variant="hero" size="lg" onClick={() => window.location.href = '/auth'}>
          View All Prices
          <ArrowRight className="w-4 h-4 ml-2" aria-hidden="true" />
        </Button>
      </motion.div>
    </div>
  );
};
