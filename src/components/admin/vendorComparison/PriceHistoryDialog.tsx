/**
 * Price History Dialog
 * 
 * Shows timeline of price changes for a vendor offer
 */

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, TrendingUp, TrendingDown, Minus, AlertCircle } from 'lucide-react';
import { useOfferPriceHistory } from '@/hooks/useOfferPriceHistory';
import { formatDistanceToNow } from 'date-fns';
import type { VendorOfferPriceHistory } from '@/types/vendorComparison';

interface PriceHistoryDialogProps {
  offerId: string;
  open: boolean;
  onClose: () => void;
}

export const PriceHistoryDialog = ({ offerId, open, onClose }: PriceHistoryDialogProps) => {
  const { history, loading, error } = useOfferPriceHistory(offerId);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Unknown';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return 'Unknown';
    }
  };

  const getOldPrice = (entry: VendorOfferPriceHistory): number | null => {
    if (entry.old_research_pricing) {
      return entry.old_research_pricing.price_per_mg;
    } else if (entry.old_telehealth_pricing) {
      return entry.old_telehealth_pricing.subscription_price_monthly;
    } else if (entry.old_brand_pricing) {
      return entry.old_brand_pricing.price_per_dose;
    }
    return null;
  };

  const getNewPrice = (entry: VendorOfferPriceHistory): number | null => {
    if (entry.new_research_pricing) {
      return entry.new_research_pricing.price_per_mg;
    } else if (entry.new_telehealth_pricing) {
      return entry.new_telehealth_pricing.subscription_price_monthly;
    } else if (entry.new_brand_pricing) {
      return entry.new_brand_pricing.price_per_dose;
    }
    return null;
  };

  const getPriceChangeIcon = (changePercent?: number) => {
    if (!changePercent) return <Minus className="w-4 h-4" />;
    if (changePercent > 0) return <TrendingUp className="w-4 h-4" />;
    if (changePercent < 0) return <TrendingDown className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };

  const getPriceChangeBadge = (changePercent?: number) => {
    if (!changePercent) {
      return <Badge variant="secondary">No change</Badge>;
    }

    if (changePercent > 0) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <TrendingUp className="w-3 h-3" />
          +{changePercent}%
        </Badge>
      );
    }

    return (
      <Badge variant="default" className="bg-green-600 flex items-center gap-1">
        <TrendingDown className="w-3 h-3" />
        {changePercent}%
      </Badge>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Price Change History</DialogTitle>
        </DialogHeader>

        {loading && (
          <div className="py-12 text-center">
            <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Loading price history...</p>
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!loading && !error && history.length === 0 && (
          <div className="py-12 text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No price changes recorded yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Price history will appear when offers are updated via CSV imports
            </p>
          </div>
        )}

        {!loading && !error && history.length > 0 && (
          <div className="space-y-6">
            <p className="text-sm text-muted-foreground">
              {history.length} price change{history.length !== 1 ? 's' : ''} recorded
            </p>

            <div className="space-y-4">
              {history.map((entry, index) => {
                const oldPrice = getOldPrice(entry);
                const newPrice = getNewPrice(entry);

                return (
                  <div
                    key={entry.id}
                    className={`border-l-4 pl-4 py-3 ${
                      entry.price_change_pct && entry.price_change_pct > 0
                        ? 'border-red-500'
                        : entry.price_change_pct && entry.price_change_pct < 0
                        ? 'border-green-500'
                        : 'border-gray-300'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          {getPriceChangeIcon(entry.price_change_pct)}
                          <span className="font-medium text-sm">
                            {formatDate(entry.changed_at)}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {entry.changed_fields.length > 0
                            ? `Changed: ${entry.changed_fields.join(', ')}`
                            : 'Price updated'}
                        </p>
                      </div>
                      {getPriceChangeBadge(entry.price_change_pct)}
                    </div>

                    <div className="flex items-center gap-3 text-sm">
                      <span className="line-through text-muted-foreground">
                        ${oldPrice?.toFixed(2) || '—'}
                      </span>
                      <span className="text-muted-foreground">→</span>
                      <span className="font-bold text-lg">
                        ${newPrice?.toFixed(2) || '—'}
                      </span>
                    </div>

                    {index === 0 && (
                      <Badge variant="outline" className="mt-2 text-xs">
                        Latest
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

