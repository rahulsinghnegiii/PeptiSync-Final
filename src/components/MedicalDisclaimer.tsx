import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { MEDICAL_DISCLAIMER } from "@/lib/constants";

interface MedicalDisclaimerProps {
  variant?: "full" | "medium" | "short";
  className?: string;
}

export const MedicalDisclaimer = ({ 
  variant = "medium",
  className = "" 
}: MedicalDisclaimerProps) => {
  const disclaimerText = MEDICAL_DISCLAIMER[variant];

  return (
    <Card className={`border-warning bg-warning/10 ${className}`}>
      <CardContent className="p-4">
        <div className="flex gap-3">
          <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold mb-1 text-warning">Medical Disclaimer</h4>
            <p className="text-sm text-muted-foreground whitespace-pre-line">
              {disclaimerText}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const FooterDisclaimer = () => {
  return (
    <p className="text-xs text-muted-foreground text-center">
      {MEDICAL_DISCLAIMER.short}
    </p>
  );
};

