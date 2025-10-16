import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, ExternalLink } from "lucide-react";

interface ShippingInfoProps {
  address: string | null;
  trackingNumber: string | null;
}

const ShippingInfo = ({ address, trackingNumber }: ShippingInfoProps) => {
  const getTrackingUrl = (trackingNumber: string) => {
    // Default to USPS tracking, can be enhanced to detect carrier
    return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingNumber}`;
  };

  return (
    <Card className="glass border-glass-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Shipping Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {address && (
          <div>
            <p className="text-sm text-muted-foreground mb-2">Delivery Address</p>
            <p className="text-sm whitespace-pre-line">{address}</p>
          </div>
        )}

        {trackingNumber && (
          <div>
            <p className="text-sm text-muted-foreground mb-2">Tracking Number</p>
            <div className="flex items-center gap-3">
              <code className="flex-1 text-sm bg-muted px-3 py-2 rounded font-mono">
                {trackingNumber}
              </code>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(getTrackingUrl(trackingNumber), "_blank")}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Track
              </Button>
            </div>
          </div>
        )}

        {!address && !trackingNumber && (
          <p className="text-sm text-muted-foreground">
            Shipping information will be available once your order is processed.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default ShippingInfo;
