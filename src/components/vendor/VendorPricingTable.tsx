import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Shield, Lock } from "lucide-react";
import type { VendorPriceSubmission } from "@/types/vendor";

interface VendorPricingTableProps {
  submissions: VendorPriceSubmission[];
  showFullDetails?: boolean;
}

export const VendorPricingTable = ({ 
  submissions, 
  showFullDetails = false 
}: VendorPricingTableProps) => {
  if (submissions.length === 0) {
    return (
      <Card className="glass border-glass-border">
        <CardContent className="p-12 text-center">
          <p className="text-muted-foreground">No vendor prices available yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass border-glass-border overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Peptide</TableHead>
              <TableHead>Price (USD)</TableHead>
              <TableHead>Origin</TableHead>
              {showFullDetails ? (
                <>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Discount Code</TableHead>
                </>
              ) : (
                <TableHead>Details</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {submissions.map((submission) => {
              // Safely get price value with fallback
              const price = submission.priceUsd ?? (submission as any).price_usd ?? 0;
              const peptideName = submission.peptideName || (submission as any).peptide_name || "Unknown";
              const shippingOrigin = submission.shippingOrigin || (submission as any).shipping_origin || "Unknown";
              const vendorName = submission.vendorName || (submission as any).vendor_name || "N/A";
              
              return (
                <TableRow key={submission.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {peptideName}
                      {submission.verifiedVendor && (
                        <Shield className="w-4 h-4 text-primary" title="Verified Vendor" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-primary font-semibold">
                    ${typeof price === 'number' ? price.toFixed(2) : '0.00'}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{shippingOrigin}</Badge>
                  </TableCell>
                  {showFullDetails ? (
                    <>
                      <TableCell>
                        {vendorName}
                      </TableCell>
                      <TableCell>
                        {submission.discountCode || (submission as any).discount_code || "None"}
                      </TableCell>
                    </>
                  ) : (
                    <TableCell>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Lock className="w-4 h-4" />
                        <span className="text-sm">Pro+ Only</span>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};

