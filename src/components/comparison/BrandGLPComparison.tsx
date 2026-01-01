/**
 * Brand GLP Comparison Component
 * 
 * Tier 3: Brand / Originator GLPs
 * Primary metric: Price per dose
 * Display: Dose-level transparency, total package price
 * Reference pricing from manufacturers
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
import { ExternalLink, TrendingDown, TrendingUp, CheckCircle, Package } from 'lucide-react';
import { useTier3ReferencePricing } from '@/hooks/useTier3Reference';
import { useVendors } from '@/hooks/useVendors';

type SortOption = 'price_per_dose_asc' | 'price_per_dose_desc' | 'alphabetical';

export const BrandGLPComparison = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('price_per_dose_asc');
  
  // Fetch Tier 3 reference pricing (verified only)
  const { references: tier3References, loading } = useTier3ReferencePricing();
  const { vendors } = useVendors();

  // Get vendor info
  const getVendor = (vendorId: string) => vendors.find((v) => v.id === vendorId);

  // Filter verified references only
  const verifiedReferences = useMemo(() => {
    return tier3References.filter((ref) => ref.verification_status === 'verified');
  }, [tier3References]);

  // Filter and sort references
  const filteredReferences = useMemo(() => {
    let filtered = verifiedReferences.filter((ref) => {
      const vendor = getVendor(ref.vendor_id);
      const matchesSearch =
        ref.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vendor?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ref.brand_pricing?.dose_strength?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'price_per_dose_asc') {
        return (a.brand_pricing?.price_per_dose || 0) - (b.brand_pricing?.price_per_dose || 0);
      } else if (sortBy === 'price_per_dose_desc') {
        return (b.brand_pricing?.price_per_dose || 0) - (a.brand_pricing?.price_per_dose || 0);
      } else {
        // alphabetical by product name
        return a.product_name.localeCompare(b.product_name);
      }
    });

    return filtered;
  }, [verifiedReferences, searchQuery, sortBy]);

  // Group by peptide for best price highlighting
  const bestPrices = useMemo(() => {
    const priceMap = new Map<string, number>();
    verifiedReferences.forEach((ref) => {
      if (!ref.brand_pricing?.price_per_dose) return;
      
      const currentBest = priceMap.get(ref.glp_type);
      const refPrice = ref.brand_pricing.price_per_dose;
      if (!currentBest || refPrice < currentBest) {
        priceMap.set(ref.glp_type, refPrice);
      }
    });
    return priceMap;
  }, [verifiedReferences]);

  const isBestPrice = (glpType: string, pricePerDose: number) => {
    return bestPrices.get(glpType) === pricePerDose;
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
                placeholder="Search by product, brand, or dose strength..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
              <SelectTrigger className="w-full md:w-[240px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="price_per_dose_asc">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="w-4 h-4" />
                    Lowest Price/Dose First
                  </div>
                </SelectItem>
                <SelectItem value="price_per_dose_desc">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Highest Price/Dose First
                  </div>
                </SelectItem>
                <SelectItem value="alphabetical">Alphabetical (Product)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results Info */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredReferences.length} verified product{filteredReferences.length !== 1 ? 's' : ''}
        </p>
        <Badge variant="outline" className="flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          Verified Only
        </Badge>
      </div>

      {/* Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Brand / Originator GLP Pricing Comparison</CardTitle>
          <p className="text-sm text-muted-foreground">
            Reference pricing for FDA-approved brand name medications
          </p>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Brand</TableHead>
                  <TableHead>GLP Type</TableHead>
                  <TableHead>Dose Strength</TableHead>
                  <TableHead>Price per Dose</TableHead>
                  <TableHead>Doses per Package</TableHead>
                  <TableHead>Total Package Price</TableHead>
                  <TableHead className="text-right">Link</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReferences.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                      No products found. Try adjusting your search.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredReferences.map((ref) => {
                    const vendor = getVendor(ref.vendor_id);
                    const pricing = ref.brand_pricing;
                    
                    // Skip if pricing data is missing
                    if (!pricing?.price_per_dose) {
                      return null;
                    }
                    
                    const bestPrice = isBestPrice(ref.glp_type, pricing.price_per_dose);

                    return (
                      <TableRow 
                        key={ref.id} 
                        className={bestPrice ? 'bg-orange-50/50 hover:bg-orange-100/50' : 'hover:bg-muted/50'}
                      >
                        <TableCell className="font-medium">
                          {ref.product_name}
                          {ref.verification_status === 'verified' && (
                            <CheckCircle className="w-3 h-3 inline ml-1 text-green-600" />
                          )}
                        </TableCell>
                        <TableCell>{vendor?.name || 'Unknown'}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{ref.glp_type}</Badge>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{pricing.dose_strength || 'N/A'}</TableCell>
                        <TableCell className="font-semibold">
                          ${pricing.price_per_dose.toFixed(2)}
                          {bestPrice && (
                            <Badge variant="default" className="ml-2 bg-orange-600 text-xs">
                              Best
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Package className="w-3 h-3 text-muted-foreground" />
                            {pricing.doses_per_package || 'N/A'}
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold">
                          {pricing.total_package_price 
                            ? `$${pricing.total_package_price.toFixed(2)}`
                            : 'N/A'
                          }
                        </TableCell>
                        <TableCell className="text-right">
                          {ref.product_url ? (
                            <Button variant="ghost" size="sm" asChild>
                              <a
                                href={ref.product_url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            </Button>
                          ) : vendor?.website_url ? (
                            <Button variant="ghost" size="sm" asChild>
                              <a
                                href={vendor.website_url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            </Button>
                          ) : null}
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
          <h4 className="font-semibold mb-2">About Brand / Originator GLP Pricing</h4>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li>Prices shown are for FDA-approved brand name medications</li>
            <li>Price per dose allows comparison across different package sizes</li>
            <li>Total package price shows the full cost of a complete prescription</li>
            <li>Insurance coverage may significantly reduce out-of-pocket costs</li>
            <li>Manufacturer patient assistance programs may be available</li>
            <li>Prices may vary by pharmacy and location - verify with your healthcare provider</li>
          </ul>
        </CardContent>
      </Card>

      {/* Reference Note */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Package className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-semibold mb-2 text-blue-900">Reference Pricing</h4>
              <p className="text-sm text-blue-800">
                This data represents reference pricing from manufacturers and pharmacies. Actual costs
                may vary based on insurance coverage, patient assistance programs, and pharmacy choice.
                Always consult with your healthcare provider and insurance company for accurate pricing.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

