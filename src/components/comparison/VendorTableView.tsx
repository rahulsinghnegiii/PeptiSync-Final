/**
 * Vendor Table View Component
 * 
 * Traditional vendor-first table view for research peptide comparison
 * Extracted from ResearchPeptideComparison for dual-view support
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ExternalLink, CheckCircle } from 'lucide-react';
import type { VendorOffer, Vendor } from '@/types/vendorComparison';

interface VendorTableViewProps {
  offers: VendorOffer[];
  vendors: Vendor[];
  isBestPrice: (peptideName: string, pricePerMg: number) => boolean;
}

export const VendorTableView = ({ offers, vendors, isBestPrice }: VendorTableViewProps) => {
  const getVendor = (vendorId: string) => vendors.find((v) => v.id === vendorId);

  return (
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
              {offers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                    No offers found. Try adjusting your search.
                  </TableCell>
                </TableRow>
              ) : (
                offers.map((offer) => {
                  const vendor = getVendor(offer.vendor_id);
                  const pricing = offer.research_pricing;
                  if (!pricing) return null;

                  const bestPrice = isBestPrice(offer.peptide_name, pricing.price_per_mg);

                  return (
                    <TableRow 
                      key={offer.id} 
                      className={bestPrice ? 'bg-green-50/50 hover:bg-green-100/50 dark:bg-green-950/20 dark:hover:bg-green-950/30' : 'hover:bg-muted/50'}
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
  );
};

