/**
 * Admin Vendor Comparison - Main Component
 * 
 * Container for all Vendor Comparison V1 admin functionality
 * Provides tabbed interface for:
 * - Vendor management
 * - Offer management
 * - Upload (CSV/Excel)
 * - Tier 3 reference pricing
 */

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Store, Package, Award, Upload, CheckCircle, Settings, Activity } from 'lucide-react';
import { VendorManagementTab } from './vendorComparison/VendorManagementTab';
import { OfferManagementTab } from './vendorComparison/OfferManagementTab';
import { Tier3ReferenceTab } from './vendorComparison/Tier3ReferenceTab';
import { UploadTab } from './vendorComparison/UploadTab';
import { ReviewQueueTab } from './vendorComparison/ReviewQueueTab';
import { ScraperConfigurationTab } from './vendorComparison/ScraperConfigurationTab';
import { ScraperMonitoringTab } from './vendorComparison/ScraperMonitoringTab';

export const AdminVendorComparison = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Vendor Comparison V1</h2>
        <p className="text-muted-foreground mt-2">
          Manage vendors, pricing offers, uploads, and brand GLP reference pricing
        </p>
      </div>

      <Tabs defaultValue="vendors" className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="vendors" className="flex items-center gap-2">
            <Store className="w-4 h-4" />
            Vendors
          </TabsTrigger>
          <TabsTrigger value="offers" className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            Offers
          </TabsTrigger>
          <TabsTrigger value="uploads" className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Uploads
          </TabsTrigger>
          <TabsTrigger value="review-queue" className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Review Queue
          </TabsTrigger>
          <TabsTrigger value="tier3-reference" className="flex items-center gap-2">
            <Award className="w-4 h-4" />
            Tier 3 Reference
          </TabsTrigger>
          <TabsTrigger value="scraper-config" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Scraper Config
          </TabsTrigger>
          <TabsTrigger value="scraper-monitoring" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Monitoring
          </TabsTrigger>
        </TabsList>

        <TabsContent value="vendors">
          <VendorManagementTab />
        </TabsContent>

        <TabsContent value="offers">
          <OfferManagementTab />
        </TabsContent>

        <TabsContent value="uploads">
          <UploadTab />
        </TabsContent>

        <TabsContent value="review-queue">
          <ReviewQueueTab />
        </TabsContent>

        <TabsContent value="tier3-reference">
          <Tier3ReferenceTab />
        </TabsContent>

        <TabsContent value="scraper-config">
          <ScraperConfigurationTab />
        </TabsContent>

        <TabsContent value="scraper-monitoring">
          <ScraperMonitoringTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

