/**
 * Research Peptide Comparison Component
 * 
 * Tier 1: Research Peptide Vendors
 * Primary metric: $/mg
 * Sort: By price per mg or alphabetically
 * 
 * Phase 6: Public Comparison Pages
 * Updated: Dual-view support (peptide-first and vendor-first)
 */

import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TrendingDown, TrendingUp, CheckCircle } from 'lucide-react';
import { useVendorOffers } from '@/hooks/useVendorOffers';
import { useVendors } from '@/hooks/useVendors';
import { ViewToggle, type ViewMode } from './ViewToggle';
import { PeptideGroupedView } from './PeptideGroupedView';
import { VendorTableView } from './VendorTableView';

type SortOption = 'price_asc' | 'price_desc' | 'alphabetical';

export const ResearchPeptideComparison = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('price_asc');
  const [viewMode, setViewMode] = useState<ViewMode>('peptide');
  
  // Fetch verified offers only
  const { offers, loading } = useVendorOffers('research', undefined, undefined, 'verified');
  const { vendors } = useVendors('research', true);

  // Get vendor info
  const getVendor = (vendorId: string) => vendors.find((v) => v.id === vendorId);

  // Get unique peptides for filtering
  const uniquePeptides = useMemo(() => {
    const peptides = new Set(offers.map((o) => o.peptide_name));
    return Array.from(peptides).sort();
  }, [offers]);

  // Filter and sort offers (only for vendor view)
  const filteredOffers = useMemo(() => {
    // Skip filtering in peptide view (handled by PeptideGroupedView)
    if (viewMode === 'peptide') {
      return offers;
    }

    let filtered = offers.filter((offer) => {
      const vendor = getVendor(offer.vendor_id);
      const matchesSearch =
        offer.peptide_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vendor?.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });

    // Sort (only applies to vendor view)
    filtered.sort((a, b) => {
      if (sortBy === 'price_asc') {
        return (a.research_pricing?.price_per_mg || 0) - (b.research_pricing?.price_per_mg || 0);
      } else if (sortBy === 'price_desc') {
        return (b.research_pricing?.price_per_mg || 0) - (a.research_pricing?.price_per_mg || 0);
      } else {
        // alphabetical by vendor name
        const vendorA = getVendor(a.vendor_id)?.name || '';
        const vendorB = getVendor(b.vendor_id)?.name || '';
        return vendorA.localeCompare(vendorB);
      }
    });

    return filtered;
  }, [offers, vendors, searchQuery, sortBy, viewMode]);

  // Find best price for each peptide (for highlighting)
  const bestPrices = useMemo(() => {
    const priceMap = new Map<string, number>();
    offers.forEach((offer) => {
      const currentBest = priceMap.get(offer.peptide_name);
      const offerPrice = offer.research_pricing?.price_per_mg || Infinity;
      if (!currentBest || offerPrice < currentBest) {
        priceMap.set(offer.peptide_name, offerPrice);
      }
    });
    return priceMap;
  }, [offers]);

  const isBestPrice = (peptideName: string, pricePerMg: number) => {
    return bestPrices.get(peptideName) === pricePerMg;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading pricing data...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by peptide or vendor name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {viewMode === 'vendor' && (
              <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
                <SelectTrigger className="w-full md:w-[220px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="price_asc">
                    <div className="flex items-center gap-2">
                      <TrendingDown className="w-4 h-4" />
                      Lowest $/mg First
                    </div>
                  </SelectItem>
                  <SelectItem value="price_desc">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Highest $/mg First
                    </div>
                  </SelectItem>
                  <SelectItem value="alphabetical">Alphabetical (Vendor)</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </CardContent>
      </Card>

      {/* View Toggle */}
      <ViewToggle view={viewMode} onViewChange={setViewMode} />

      {/* Results Info */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {viewMode === 'peptide' ? uniquePeptides.length : filteredOffers.length} {viewMode === 'peptide' ? 'peptide' : 'verified offer'}{(viewMode === 'peptide' ? uniquePeptides.length : filteredOffers.length) !== 1 ? 's' : ''}
        </p>
        <Badge variant="outline" className="flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          Verified Only
        </Badge>
      </div>

      {/* Conditional View Rendering */}
      {viewMode === 'peptide' ? (
        <PeptideGroupedView 
          offers={offers}
          vendors={vendors}
          searchQuery={searchQuery}
        />
      ) : (
        <VendorTableView
          offers={filteredOffers}
          vendors={vendors}
          isBestPrice={isBestPrice}
        />
      )}

      {/* Tier-Specific Notes */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <h4 className="font-semibold mb-2">About Research Peptide Pricing</h4>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li>Prices shown are per milligram ($/mg) for easy comparison</li>
            <li>Shipping costs are additional and shown separately</li>
            <li>Lab test certificates may be available from some vendors</li>
            <li>Research peptides are for research purposes only, not for human consumption</li>
            <li>Always verify current pricing and availability with vendors directly</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

