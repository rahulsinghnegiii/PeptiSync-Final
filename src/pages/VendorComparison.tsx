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
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Link to="/">
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Button>
            </Link>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gradient">Vendor Price Comparison</h1>
              <p className="text-muted-foreground mt-1">
                Compare verified vendor pricing across different tiers
              </p>
            </div>
            <Badge variant="outline" className="text-xs">
              Data Verified
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Disclaimer Alert */}
        <Alert className="mb-6">
          <InfoIcon className="w-4 h-4" />
          <AlertDescription>
            <p className="font-medium mb-1">Important Information:</p>
            <ul className="text-sm space-y-1 list-disc list-inside">
              <li>Prices shown are for research purposes only</li>
              <li>Always verify current pricing directly with vendors</li>
              <li>Pricing data is updated regularly but may not reflect real-time changes</li>
              <li>Research peptides are not for human consumption</li>
            </ul>
          </AlertDescription>
        </Alert>

        {/* Tier Comparison Tabs */}
        <Card className="glass border-glass-border">
          <CardHeader>
            <CardTitle className="text-2xl">Select Vendor Tier</CardTitle>
            <p className="text-sm text-muted-foreground">
              Each tier has different pricing structures and comparison metrics
            </p>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="research">
                  <div className="flex flex-col items-center gap-1">
                    <span>Research Peptides</span>
                    <span className="text-xs text-muted-foreground">$/mg comparison</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger value="telehealth">
                  <div className="flex flex-col items-center gap-1">
                    <span>Telehealth & GLP Clinics</span>
                    <span className="text-xs text-muted-foreground">Subscription pricing</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger value="brand">
                  <div className="flex flex-col items-center gap-1">
                    <span>Brand / Originator GLPs</span>
                    <span className="text-xs text-muted-foreground">Dose-level pricing</span>
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
        <div className="mt-8 mb-8 text-center text-sm text-muted-foreground">
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

