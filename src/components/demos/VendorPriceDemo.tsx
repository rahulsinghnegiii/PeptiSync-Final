import { motion } from "framer-motion";
import { useState } from "react";
import { ArrowUpDown, ExternalLink, Award } from "lucide-react";

interface VendorPrice {
  id: number;
  peptide: string;
  vendor: string;
  price: number;
  url: string;
  isBestPrice: boolean;
}

const samplePrices: VendorPrice[] = [
  { id: 1, peptide: "BPC-157", vendor: "Peptide Sciences", price: 45.00, url: "#", isBestPrice: true },
  { id: 2, peptide: "BPC-157", vendor: "Limitless Life", price: 52.00, url: "#", isBestPrice: false },
  { id: 3, peptide: "BPC-157", vendor: "Xpeptides", price: 48.50, url: "#", isBestPrice: false },
  { id: 4, peptide: "TB-500", vendor: "Peptide Sciences", price: 65.00, url: "#", isBestPrice: false },
  { id: 5, peptide: "TB-500", vendor: "Limitless Life", price: 58.00, url: "#", isBestPrice: true },
  { id: 6, peptide: "TB-500", vendor: "Xpeptides", price: 62.00, url: "#", isBestPrice: false },
];

type SortField = 'peptide' | 'vendor' | 'price';
type SortDirection = 'asc' | 'desc';

const VendorPriceDemo = () => {
  const [prices, setPrices] = useState(samplePrices);
  const [sortField, setSortField] = useState<SortField>('price');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const handleSort = (field: SortField) => {
    const newDirection = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortDirection(newDirection);

    const sorted = [...prices].sort((a, b) => {
      let aVal = a[field];
      let bVal = b[field];
      
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();

      if (aVal < bVal) return newDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return newDirection === 'asc' ? 1 : -1;
      return 0;
    });

    setPrices(sorted);
  };

  return (
    <div className="wellness-card p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-foreground">Vendor Price Tracker</h3>
        <div className="text-sm text-muted-foreground">Live pricing data</div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4">
                <button
                  onClick={() => handleSort('peptide')}
                  className="flex items-center gap-2 font-semibold text-sm text-foreground hover:text-wellness-green-600 transition-colors"
                >
                  Peptide
                  <ArrowUpDown className="w-4 h-4" />
                </button>
              </th>
              <th className="text-left py-3 px-4">
                <button
                  onClick={() => handleSort('vendor')}
                  className="flex items-center gap-2 font-semibold text-sm text-foreground hover:text-wellness-green-600 transition-colors"
                >
                  Vendor
                  <ArrowUpDown className="w-4 h-4" />
                </button>
              </th>
              <th className="text-left py-3 px-4">
                <button
                  onClick={() => handleSort('price')}
                  className="flex items-center gap-2 font-semibold text-sm text-foreground hover:text-wellness-green-600 transition-colors"
                >
                  Price
                  <ArrowUpDown className="w-4 h-4" />
                </button>
              </th>
              <th className="text-right py-3 px-4">
                <span className="font-semibold text-sm text-foreground">Action</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {prices.map((item, index) => (
              <motion.tr
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="border-b border-gray-100 hover:bg-wellness-green-50/30 transition-colors"
              >
                <td className="py-3 px-4">
                  <span className="font-medium text-foreground">{item.peptide}</span>
                </td>
                <td className="py-3 px-4">
                  <span className="text-muted-foreground">{item.vendor}</span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">${item.price.toFixed(2)}</span>
                    {item.isBestPrice && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="flex items-center gap-1 bg-wellness-green-100 text-wellness-green-700 text-xs font-medium px-2 py-1 rounded-full"
                      >
                        <Award className="w-3 h-3" />
                        Best Price
                      </motion.div>
                    )}
                  </div>
                </td>
                <td className="py-3 px-4 text-right">
                  <motion.a
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    href={item.url}
                    className="inline-flex items-center gap-1 text-wellness-blue-600 hover:text-wellness-blue-700 text-sm font-medium"
                  >
                    View
                    <ExternalLink className="w-3 h-3" />
                  </motion.a>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer Note */}
      <div className="mt-4 text-xs text-muted-foreground text-center">
        Prices updated in real-time from verified vendors
      </div>
    </div>
  );
};

export default VendorPriceDemo;
