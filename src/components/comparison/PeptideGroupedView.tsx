/**
 * Peptide Grouped View Component
 * 
 * Displays offers grouped by peptide with expandable cards
 * Shows best price summary and all vendor options
 */

import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ExternalLink, CheckCircle, Award } from 'lucide-react';
import type { VendorOffer, Vendor } from '@/types/vendorComparison';

interface PeptideGroup {
  peptide_name: string;
  offers: VendorOffer[];
  bestPrice: number;
  bestVendor: Vendor | undefined;
  offerCount: number;
}

interface PeptideGroupedViewProps {
  offers: VendorOffer[];
  vendors: Vendor[];
  searchQuery: string;
}

export const PeptideGroupedView = ({ offers, vendors, searchQuery }: PeptideGroupedViewProps) => {
  const getVendor = (vendorId: string) => vendors.find((v) => v.id === vendorId);

  // Group offers by peptide
  const peptideGroups = useMemo(() => {
    const groupMap = new Map<string, VendorOffer[]>();
    
    // Filter by search query first
    const filteredOffers = offers.filter((offer) => {
      const vendor = getVendor(offer.vendor_id);
      const matchesSearch =
        offer.peptide_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vendor?.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });

    // Group by peptide
    filteredOffers.forEach((offer) => {
      const existing = groupMap.get(offer.peptide_name) || [];
      groupMap.set(offer.peptide_name, [...existing, offer]);
    });

    // Convert to array and calculate best prices
    const groups: PeptideGroup[] = [];
    groupMap.forEach((offers, peptideName) => {
      // Sort offers by price_per_mg
      const sortedOffers = [...offers].sort((a, b) => {
        const priceA = a.research_pricing?.price_per_mg || Infinity;
        const priceB = b.research_pricing?.price_per_mg || Infinity;
        return priceA - priceB;
      });

      const bestOffer = sortedOffers[0];
      const bestPrice = bestOffer.research_pricing?.price_per_mg || 0;
      const bestVendor = getVendor(bestOffer.vendor_id);

      groups.push({
        peptide_name: peptideName,
        offers: sortedOffers,
        bestPrice,
        bestVendor,
        offerCount: sortedOffers.length,
      });
    });

    // Sort groups alphabetically by peptide name
    return groups.sort((a, b) => a.peptide_name.localeCompare(b.peptide_name));
  }, [offers, vendors, searchQuery]);

  const isBestInGroup = (group: PeptideGroup, pricePerMg: number) => {
    return group.bestPrice === pricePerMg;
  };

  if (peptideGroups.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          No peptides found. Try adjusting your search.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Accordion type="multiple" className="space-y-4">
        {peptideGroups.map((group) => (
          <AccordionItem
            key={group.peptide_name}
            value={group.peptide_name}
            className="border-0"
          >
            <Card className="glass border-glass-border overflow-hidden hover:shadow-lg transition-shadow duration-200">
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <div className="flex items-center justify-between w-full pr-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-primary" />
                      <h3 className="text-xl font-bold text-left">{group.peptide_name}</h3>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Best Price:</span>
                        <Badge variant="default" className="bg-green-600 text-sm font-bold">
                          ${group.bestPrice.toFixed(2)}/mg
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 mt-1 justify-end">
                        <span className="text-xs text-muted-foreground">
                          {group.bestVendor?.name || 'Unknown'}
                        </span>
                        {group.bestVendor?.verified && (
                          <CheckCircle className="w-3 h-3 text-green-600" />
                        )}
                      </div>
                    </div>
                    
                    <Badge variant="outline" className="text-xs">
                      {group.offerCount} vendor{group.offerCount !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                </div>
              </AccordionTrigger>
              
              <AccordionContent>
                <CardContent className="pt-0 pb-4 px-6">
                  <div className="rounded-md border overflow-x-auto mt-2">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Vendor</TableHead>
                          <TableHead>Size</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>$/mg</TableHead>
                          <TableHead>Shipping</TableHead>
                          <TableHead>Lab Test</TableHead>
                          <TableHead className="text-right">Link</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {group.offers.map((offer) => {
                          const vendor = getVendor(offer.vendor_id);
                          const pricing = offer.research_pricing;
                          if (!pricing) return null;

                          const isBest = isBestInGroup(group, pricing.price_per_mg);

                          return (
                            <TableRow
                              key={offer.id}
                              className={isBest ? 'bg-green-50/50 hover:bg-green-100/50 dark:bg-green-950/20 dark:hover:bg-green-950/30' : 'hover:bg-muted/50'}
                            >
                              <TableCell className="font-medium">
                                {vendor?.name || 'Unknown'}
                                {vendor?.verified && (
                                  <CheckCircle className="w-3 h-3 inline ml-1 text-green-600" />
                                )}
                              </TableCell>
                              <TableCell>{pricing.size_mg} mg</TableCell>
                              <TableCell>${pricing.price_usd.toFixed(2)}</TableCell>
                              <TableCell className="font-semibold">
                                ${pricing.price_per_mg.toFixed(2)}/mg
                                {isBest && (
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
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </AccordionContent>
            </Card>
          </AccordionItem>
        ))}
      </Accordion>

      {/* Info Card */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <h4 className="font-semibold mb-2">About Peptide-First View</h4>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li>Peptides are grouped and sorted alphabetically</li>
            <li>Best price shown is the lowest $/mg for that specific peptide</li>
            <li>Click any peptide to expand and see all vendor options</li>
            <li>Vendors within each group are automatically sorted by price (lowest first)</li>
            <li>Green "Best" badge indicates the lowest price for that peptide</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

