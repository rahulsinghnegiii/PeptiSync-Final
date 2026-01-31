/**
 * Vendor Comparison Page (Pro+ Feature)
 * 
 * Premium subscription feature for Pro+ and Elite tier members
 * Requires authentication and Pro+ subscription or higher
 * 
 * Features:
 * - Tier-based tabbed navigation
 * - Verified offers only
 * - Tier-specific sorting and display
 * - No cross-tier math or comparisons
 * - Requires user authentication AND Pro+ subscription
 */

import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { FeatureLockedCard } from '@/components/FeatureLockedCard';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { InfoIcon, ArrowLeft } from 'lucide-react';
import { ResearchPeptideComparison } from '@/components/comparison/ResearchPeptideComparison';
import { TelehealthComparison } from '@/components/comparison/TelehealthComparison';
import { BrandGLPComparison } from '@/components/comparison/BrandGLPComparison';

export default function VendorComparison() {
  const { user, loading } = useAuth();
  const { planTier, loading: subscriptionLoading, hasFeature } = useSubscription();
  const [activeTab, setActiveTab] = useState<'research' | 'telehealth' | 'brand'>('research');

  // Show loading state while checking auth and subscription
  if (loading || subscriptionLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login page if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has Pro+ subscription or higher (vendor_pricing feature)
  if (!hasFeature('vendor_pricing')) {
    return (
      <FeatureLockedCard
        featureName="Vendor Price Comparison"
        requiredPlan="pro_plus"
        currentPlan={planTier}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Page Header with Back Button */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm mt-16">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
          <div className="flex items-center gap-2 mb-3">
            <Link to="/">
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-1 text-xs sm:text-sm"
              >
                <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Back to Home</span>
                <span className="sm:hidden">Back</span>
              </Button>
            </Link>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gradient">Vendor Price Comparison</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Compare verified vendor pricing
              </p>
            </div>
            <Badge variant="outline" className="text-xs w-fit">
              Data Verified
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
        {/* Disclaimer Alert */}
        <Alert className="mb-6">
          <InfoIcon className="w-4 h-4 flex-shrink-0" />
          <AlertDescription>
            <p className="font-medium mb-2 text-sm">Important Information:</p>
            <ul className="text-xs sm:text-sm space-y-1.5">
              <li className="flex gap-2">
                <span className="text-primary flex-shrink-0">•</span>
                <span>Prices shown are for research purposes only</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary flex-shrink-0">•</span>
                <span>Always verify current pricing directly with vendors</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary flex-shrink-0">•</span>
                <span>Pricing data is updated regularly but may not reflect real-time changes</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary flex-shrink-0">•</span>
                <span>Research peptides are not for human consumption</span>
              </li>
            </ul>
          </AlertDescription>
        </Alert>

        {/* Tier Comparison Tabs */}
        <Card className="glass border-glass-border">
          <CardHeader className="px-4 py-5 sm:px-6">
            <CardTitle className="text-xl sm:text-2xl">Select Vendor Tier</CardTitle>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Each tier has different pricing structures
            </p>
          </CardHeader>
          <CardContent className="px-4 pb-6 sm:px-6">
            <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
              <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 mb-6 h-auto">
                <TabsTrigger value="research" className="py-3 sm:py-4">
                  <div className="flex flex-col items-center gap-0.5 sm:gap-1">
                    <span className="text-sm sm:text-base font-medium">Research Peptides</span>
                    <span className="text-xs text-muted-foreground">$/mg comparison</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger value="telehealth" className="py-3 sm:py-4">
                  <div className="flex flex-col items-center gap-0.5 sm:gap-1">
                    <span className="text-sm sm:text-base font-medium">Telehealth & GLP</span>
                    <span className="text-xs text-muted-foreground">Subscription pricing</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger value="brand" className="py-3 sm:py-4">
                  <div className="flex flex-col items-center gap-0.5 sm:gap-1">
                    <span className="text-sm sm:text-base font-medium">Brand / Originator</span>
                    <span className="text-xs text-muted-foreground">Dose pricing</span>
                  </div>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="research">
                <ResearchPeptideComparison />
              </TabsContent>

              <TabsContent value="telehealth">
                <TelehealthComparison />
              </TabsContent>

              <TabsContent value="brand">
                <BrandGLPComparison />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Footer Note */}
        <div className="mt-6 sm:mt-8 mb-6 sm:mb-8 text-center text-xs sm:text-sm text-muted-foreground px-4">
          <p>
            Last updated: {new Date().toLocaleDateString()}. Pricing data is provided for informational
            purposes only.
          </p>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

