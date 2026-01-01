/**
 * Offer Detail Dialog
 * 
 * Displays detailed information about a vendor offer
 * Phase 5: Review & Verification Queue
 */

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, XCircle, Calendar, DollarSign } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { VendorOffer, VendorTier } from '@/types/vendorComparison';

interface OfferDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  offer: VendorOffer;
  vendorName: string;
}

export const OfferDetailDialog = ({
  open,
  onOpenChange,
  offer,
  vendorName,
}: OfferDetailDialogProps) => {
  const getTierLabel = (tier: VendorTier) => {
    const labels = {
      research: 'Research Peptides',
      telehealth: 'Telehealth & GLP Clinics',
      brand: 'Brand / Originator GLPs',
    };
    return labels[tier];
  };

  const formatPrice = (price: number) => `$${price.toFixed(2)}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Offer Details</DialogTitle>
          <DialogDescription>
            Complete information for this vendor pricing offer
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Vendor</p>
              <p className="text-base font-semibold">{vendorName}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Peptide</p>
              <p className="text-base font-semibold">{offer.peptide_name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Tier</p>
              <p className="text-sm">{getTierLabel(offer.tier)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Status</p>
              <div className="flex gap-2 mt-1">
                <Badge variant={offer.status === 'active' ? 'default' : 'secondary'}>
                  {offer.status}
                </Badge>
                <Badge
                  variant={
                    offer.verification_status === 'verified'
                      ? 'default'
                      : offer.verification_status === 'disputed'
                      ? 'destructive'
                      : 'secondary'
                  }
                >
                  {offer.verification_status}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Pricing Details by Tier */}
          {offer.tier === 'research' && offer.research_pricing && (
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Research Pricing
              </h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Size:</span>
                  <span className="ml-2 font-medium">{offer.research_pricing.size_mg} mg</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Price:</span>
                  <span className="ml-2 font-medium">{formatPrice(offer.research_pricing.price_usd)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Price per mg:</span>
                  <span className="ml-2 font-medium">{formatPrice(offer.research_pricing.price_per_mg)}/mg</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Shipping:</span>
                  <span className="ml-2 font-medium">{formatPrice(offer.research_pricing.shipping_usd)}</span>
                </div>
                {offer.research_pricing.lab_test_url && (
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Lab Test:</span>
                    <a
                      href={offer.research_pricing.lab_test_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 text-primary hover:underline text-xs"
                    >
                      View Certificate
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {offer.tier === 'telehealth' && offer.telehealth_pricing && (
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Telehealth Pricing
              </h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Subscription (Monthly):</span>
                  <span className="ml-2 font-medium">
                    {formatPrice(offer.telehealth_pricing.subscription_price_monthly)}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Medication Included:</span>
                  <span className="ml-2 font-medium">
                    {offer.telehealth_pricing.subscription_includes_medication ? (
                      <CheckCircle2 className="w-4 h-4 inline text-green-600" />
                    ) : (
                      <XCircle className="w-4 h-4 inline text-red-600" />
                    )}
                  </span>
                </div>
                {!offer.telehealth_pricing.subscription_includes_medication &&
                  offer.telehealth_pricing.medication_separate_cost && (
                    <div>
                      <span className="text-muted-foreground">Medication Cost:</span>
                      <span className="ml-2 font-medium">
                        {formatPrice(offer.telehealth_pricing.medication_separate_cost)}
                      </span>
                    </div>
                  )}
                {offer.telehealth_pricing.medication_dose && (
                  <div>
                    <span className="text-muted-foreground">Dose:</span>
                    <span className="ml-2 font-medium">{offer.telehealth_pricing.medication_dose}</span>
                  </div>
                )}
                <div>
                  <span className="text-muted-foreground">Consultation:</span>
                  <span className="ml-2 font-medium">
                    {offer.telehealth_pricing.consultation_included ? 'Included' : 'Not Included'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {offer.tier === 'brand' && offer.brand_pricing && (
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Brand Pricing
              </h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Dose Strength:</span>
                  <span className="ml-2 font-medium">{offer.brand_pricing.dose_strength}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Price per Dose:</span>
                  <span className="ml-2 font-medium">{formatPrice(offer.brand_pricing.price_per_dose)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Doses per Package:</span>
                  <span className="ml-2 font-medium">{offer.brand_pricing.doses_per_package}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Total Package Price:</span>
                  <span className="ml-2 font-medium">{formatPrice(offer.brand_pricing.total_package_price)}</span>
                </div>
              </div>
            </div>
          )}

          <Separator />

          {/* Additional Info */}
          <div>
            <h4 className="font-semibold mb-3">Additional Information</h4>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-muted-foreground">Source:</span>
                <span className="ml-2 font-medium">{offer.price_source_type.replace('_', ' ')}</span>
              </div>
              {offer.discount_code && (
                <div>
                  <span className="text-muted-foreground">Discount Code:</span>
                  <Badge variant="outline" className="ml-2">
                    {offer.discount_code}
                  </Badge>
                </div>
              )}
              {offer.notes && (
                <div>
                  <span className="text-muted-foreground">Notes:</span>
                  <p className="ml-2 text-xs mt-1">{offer.notes}</p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Verification Info */}
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Timeline
            </h4>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-muted-foreground">Last Price Check:</span>
                <span className="ml-2">
                  {offer.last_price_check
                    ? formatDistanceToNow(offer.last_price_check.toDate(), { addSuffix: true })
                    : 'Never'}
                </span>
              </div>
              {offer.verified_at && (
                <div>
                  <span className="text-muted-foreground">Verified:</span>
                  <span className="ml-2">
                    {formatDistanceToNow(offer.verified_at.toDate(), { addSuffix: true })}
                  </span>
                </div>
              )}
              <div>
                <span className="text-muted-foreground">Created:</span>
                <span className="ml-2">
                  {formatDistanceToNow(offer.created_at.toDate(), { addSuffix: true })}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Last Updated:</span>
                <span className="ml-2">
                  {formatDistanceToNow(offer.updated_at.toDate(), { addSuffix: true })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

