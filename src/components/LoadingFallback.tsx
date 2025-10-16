import { Loader2 } from "lucide-react";

export const LoadingFallback = () => {
  return (
    <div className="flex items-center justify-center min-h-screen" role="status" aria-live="polite" aria-label="Loading page content">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden="true" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
};
