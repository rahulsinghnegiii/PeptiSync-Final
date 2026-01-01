/**
 * Research Peptide Comparison Component
 * 
 * Tier 1: Research Peptide Vendors
 * Primary metric: $/mg
 * Sort: By price per mg or alphabetically
 * 
 * Phase 6: Public Comparison Pages
 */

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ExternalLink, TrendingDown, TrendingUp, CheckCircle } from 'lucide-react';
import { useVendorOffers } from '@/hooks/useVendorOffers';
import { useVendors } from '@/hooks/useVendors';

type SortOption = 'price_asc' | 'price_desc' | 'alphabetical';

export const ResearchPeptideComparison = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('price_asc');
  
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

  // Filter and sort offers
  const filteredOffers = useMemo(() => {
    let filtered = offers.filter((offer) => {
      const vendor = getVendor(offer.vendor_id);
      const matchesSearch =
        offer.peptide_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vendor?.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });

    // Sort
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
  }, [offers, vendors, searchQuery, sortBy]);

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
          </div>
        </CardContent>
      </Card>

      {/* Results Info */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredOffers.length} verified offer{filteredOffers.length !== 1 ? 's' : ''}
        </p>
        <Badge variant="outline" className="flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          Verified Only
        </Badge>
      </div>

      {/* Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Research Peptide Vendors — Pricing Verified (Beta)</CardTitle>
          <p className="text-sm text-muted-foreground">
            Primary comparison metric: Price per milligram ($/mg)
          </p>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Peptide</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>$/mg</TableHead>
                  <TableHead>Shipping</TableHead>
                  <TableHead>Lab Test</TableHead>
                  <TableHead className="text-right">Link</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOffers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                      No offers found. Try adjusting your search.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOffers.map((offer) => {
                    const vendor = getVendor(offer.vendor_id);
                    const pricing = offer.research_pricing;
                    if (!pricing) return null;

                    const bestPrice = isBestPrice(offer.peptide_name, pricing.price_per_mg);

                    return (
                      <TableRow 
                        key={offer.id} 
                        className={bestPrice ? 'bg-green-50/50 hover:bg-green-100/50' : 'hover:bg-muted/50'}
                      >
                        <TableCell className="font-medium">
                          {vendor?.name || 'Unknown'}
                          {vendor?.verified && (
                            <CheckCircle className="w-3 h-3 inline ml-1 text-green-600" />
                          )}
                        </TableCell>
                        <TableCell>{offer.peptide_name}</TableCell>
                        <TableCell>{pricing.size_mg} mg</TableCell>
                        <TableCell>${pricing.price_usd.toFixed(2)}</TableCell>
                        <TableCell className="font-semibold">
                          ${pricing.price_per_mg.toFixed(2)}/mg
                          {bestPrice && (
                            <Badge variant="default" className="ml-2 bg-green-600 text-xs">
                              Best
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>${pricing.shipping_usd.toFixed(2)}</TableCell>
                        <TableCell>
                          {pricing.lab_test_url ? (
                            <a
                              href={pricing.lab_test_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline text-xs"
                            >
                              View
                            </a>
                          ) : (
                            <span className="text-muted-foreground text-xs">N/A</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {vendor?.website_url && (
                            <Button variant="ghost" size="sm" asChild>
                              <a
                                href={vendor.website_url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

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

