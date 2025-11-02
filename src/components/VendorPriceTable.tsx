import { motion } from "framer-motion";
import { ExternalLink, TrendingDown, Clock } from "lucide-react";
import { useVendorPrices } from "@/hooks/useVendorPrices";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";

interface VendorPriceRow {
  peptideName: string;
  vendor: string;
  price: number;
  url: string;
  lastUpdated: number;
  isBestPrice: boolean;
}

export function VendorPriceTable() {
  const { data: vendorPrices, loading } = useVendorPrices();
  const [sortBy, setSortBy] = useState<'price' | 'vendor' | 'updated'>('price');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Transform Firebase data into table rows
  const rows: VendorPriceRow[] = [];
  
  Object.entries(vendorPrices).forEach(([peptideId, vendors]) => {
    const prices = Object.entries(vendors).map(([vendorId, data]) => ({
      peptideName: peptideId,
      vendor: vendorId,
      price: data.price,
      url: data.url,
      lastUpdated: data.lastUpdated,
      isBestPrice: false,
    }));

    // Find best price for this peptide
    if (prices.length > 0) {
      const minPrice = Math.min(...prices.map(p => p.price));
      prices.forEach(p => {
        p.isBestPrice = p.price === minPrice;
        rows.push(p);
      });
    }
  });

  // Sort rows
  const sortedRows = [...rows].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'price':
        comparison = a.price - b.price;
        break;
      case 'vendor':
        comparison = a.vendor.localeCompare(b.vendor);
        break;
      case 'updated':
        comparison = b.lastUpdated - a.lastUpdated;
        break;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const handleSort = (column: 'price' | 'vendor' | 'updated') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Loading vendor prices...</p>
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow-md">
        <p className="text-gray-600 mb-2">No vendor prices available yet</p>
        <p className="text-sm text-gray-500">Check back soon for pricing updates</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Vendor Price Comparison
        </h3>
        <p className="text-gray-600">
          Real-time pricing from trusted peptide vendors
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Peptide
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('vendor')}
              >
                Vendor {sortBy === 'vendor' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('price')}
              >
                Price {sortBy === 'price' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('updated')}
              >
                Last Updated {sortBy === 'updated' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedRows.map((row, index) => (
              <motion.tr
                key={`${row.peptideName}-${row.vendor}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="hover:bg-gray-50"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {row.peptideName}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{row.vendor}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900">
                      ${row.price.toFixed(2)}
                    </span>
                    {row.isBestPrice && (
                      <Badge className="bg-primary-100 text-primary-700 border-primary-200">
                        <TrendingDown className="w-3 h-3 mr-1" />
                        Best Price
                      </Badge>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    {formatDistanceToNow(row.lastUpdated, { addSuffix: true })}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                  >
                    <a
                      href={row.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1"
                    >
                      View
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </Button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="p-4 bg-gray-50 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          Prices are updated in real-time from vendor sources. Always verify pricing on vendor websites.
        </p>
      </div>
    </div>
  );
}
