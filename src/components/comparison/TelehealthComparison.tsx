/**
 * Telehealth Comparison Component
 * 
 * Tier 2: Telehealth & GLP Clinics
 * Primary metric: Subscription price
 * Display: Medication cost ONLY if not included
 * No inferred pricing allowed
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
import { ExternalLink, TrendingDown, TrendingUp, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { useVendorOffers } from '@/hooks/useVendorOffers';
import { useVendors } from '@/hooks/useVendors';

type SortOption = 'subscription_asc' | 'subscription_desc' | 'alphabetical';

export const TelehealthComparison = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('subscription_asc');
  
  // Fetch verified offers only
  const { offers, loading } = useVendorOffers('telehealth', undefined, undefined, 'verified');
  const { vendors } = useVendors('telehealth', true);

  // Get vendor info
  const getVendor = (vendorId: string) => vendors.find((v) => v.id === vendorId);

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
      if (sortBy === 'subscription_asc') {
        return (
          (a.telehealth_pricing?.subscription_price_monthly || 0) -
          (b.telehealth_pricing?.subscription_price_monthly || 0)
        );
      } else if (sortBy === 'subscription_desc') {
        return (
          (b.telehealth_pricing?.subscription_price_monthly || 0) -
          (a.telehealth_pricing?.subscription_price_monthly || 0)
        );
      } else {
        // alphabetical by vendor name
        const vendorA = getVendor(a.vendor_id)?.name || '';
        const vendorB = getVendor(b.vendor_id)?.name || '';
        return vendorA.localeCompare(vendorB);
      }
    });

    return filtered;
  }, [offers, vendors, searchQuery, sortBy]);

  // Find best subscription price for each peptide
  const bestPrices = useMemo(() => {
    const priceMap = new Map<string, number>();
    offers.forEach((offer) => {
      const currentBest = priceMap.get(offer.peptide_name);
      const offerPrice = offer.telehealth_pricing?.subscription_price_monthly || Infinity;
      if (!currentBest || offerPrice < currentBest) {
        priceMap.set(offer.peptide_name, offerPrice);
      }
    });
    return priceMap;
  }, [offers]);

  const isBestPrice = (peptideName: string, subscriptionPrice: number) => {
    return bestPrices.get(peptideName) === subscriptionPrice;
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
              <SelectTrigger className="w-full md:w-[240px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="subscription_asc">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="w-4 h-4" />
                    Lowest Subscription First
                  </div>
                </SelectItem>
                <SelectItem value="subscription_desc">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Highest Subscription First
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
          <CardTitle className="text-lg">Telehealth & GLP Clinic Pricing Comparison</CardTitle>
          <p className="text-sm text-muted-foreground">
            Primary comparison metric: Monthly subscription price
          </p>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vendor</TableHead>
                  <TableHead>GLP Type</TableHead>
                  <TableHead>Subscription (Monthly)</TableHead>
                  <TableHead>Medication Included</TableHead>
                  <TableHead>Medication Cost</TableHead>
                  <TableHead>Dose/Injection</TableHead>
                  <TableHead>Injections/Mo</TableHead>
                  <TableHead>Total mg/Mo</TableHead>
                  <TableHead>Consultation</TableHead>
                  <TableHead className="text-right">Link</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOffers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="h-24 text-center text-muted-foreground">
                      No offers found. Try adjusting your search.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOffers.map((offer) => {
                    const vendor = getVendor(offer.vendor_id);
                    const pricing = offer.telehealth_pricing;
                    if (!pricing) return null;

                    const bestPrice = isBestPrice(
                      offer.peptide_name,
                      pricing.subscription_price_monthly
                    );

                    return (
                      <TableRow 
                        key={offer.id} 
                        className={bestPrice ? 'bg-purple-50/50 hover:bg-purple-100/50' : 'hover:bg-muted/50'}
                      >
                        <TableCell className="font-medium">
                          {vendor?.name || 'Unknown'}
                          {vendor?.verified && (
                            <CheckCircle className="w-3 h-3 inline ml-1 text-green-600" />
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-mono text-xs">
                            {pricing.glp_type || 'N/A'}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-semibold">
                          ${pricing.subscription_price_monthly.toFixed(2)}/mo
                          {bestPrice && (
                            <Badge variant="default" className="ml-2 bg-purple-600 text-xs">
                              Best
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {pricing.subscription_includes_medication ? (
                            <Badge variant="default" className="bg-green-600 flex items-center gap-1 w-fit">
                              <CheckCircle className="w-3 h-3" />
                              Yes
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                              <XCircle className="w-3 h-3" />
                              No
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {!pricing.subscription_includes_medication &&
                          pricing.medication_separate_cost ? (
                            <span className="text-sm">
                              ${pricing.medication_separate_cost.toFixed(2)}
                            </span>
                          ) : pricing.subscription_includes_medication ? (
                            <span className="text-xs text-muted-foreground">Included</span>
                          ) : (
                            <span className="text-xs text-muted-foreground">Not listed</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm font-mono">
                          {pricing.dose_mg_per_injection ? (
                            <span>{pricing.dose_mg_per_injection} mg</span>
                          ) : (
                            <span className="text-muted-foreground">N/A</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-center">
                          {pricing.injections_per_month || (
                            <span className="text-muted-foreground">N/A</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm font-semibold">
                          {pricing.total_mg_per_month ? (
                            <span>{pricing.total_mg_per_month} mg</span>
                          ) : (
                            <span className="text-muted-foreground">N/A</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {pricing.consultation_included ? (
                            <span className="text-xs text-green-600">Included</span>
                          ) : (
                            <span className="text-xs text-muted-foreground">Separate</span>
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

      {/* Transparency Alert */}
      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <h4 className="font-semibold mb-2 text-amber-900">Pricing Transparency</h4>
              <ul className="text-sm text-amber-800 space-y-1 list-disc list-inside">
                <li>Medication cost is shown ONLY when NOT included in subscription</li>
                <li>No "total cost" is calculated - pricing structures vary significantly</li>
                <li>Some vendors include consultations, others charge separately</li>
                <li>Always verify complete pricing details directly with the provider</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tier-Specific Notes */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <h4 className="font-semibold mb-2">About Telehealth & GLP Clinic Pricing</h4>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li>Subscription prices are monthly and may include consultations</li>
            <li>Medication may be included or billed separately - check the "Medication Included" column</li>
            <li>Some clinics require ongoing consultations or lab work (not reflected in pricing)</li>
            <li>Doses and treatment plans vary by provider and patient needs</li>
            <li>Insurance coverage varies - contact providers directly for details</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

