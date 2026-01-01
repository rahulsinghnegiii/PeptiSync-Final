/**
 * Vendor Management Tab
 * 
 * Admin interface for managing vendors (CRUD operations)
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Edit, Trash2, Shield, ShieldOff, ExternalLink, Search } from 'lucide-react';
import { useVendors, useDeleteVendor, useToggleVendorVerification } from '@/hooks/useVendors';
import { useAuth } from '@/contexts/AuthContext';
import type { Vendor, VendorTier } from '@/types/vendorComparison';
import { VendorFormDialog } from './VendorFormDialog';

export const VendorManagementTab = () => {
  const { user } = useAuth();
  const [tierFilter, setTierFilter] = useState<VendorTier | 'all'>('all');
  const [verifiedFilter, setVerifiedFilter] = useState<'all' | 'verified' | 'unverified'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);

  const { vendors, loading, refetch } = useVendors(
    tierFilter === 'all' ? undefined : tierFilter,
    verifiedFilter === 'verified' ? true : undefined
  );
  const { deleteVendor, deleting } = useDeleteVendor();
  const { toggleVerification, toggling } = useToggleVendorVerification();

  // Client-side search filter
  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = vendor.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesVerified =
      verifiedFilter === 'all' ||
      (verifiedFilter === 'verified' && vendor.verified) ||
      (verifiedFilter === 'unverified' && !vendor.verified);
    return matchesSearch && matchesVerified;
  });

  const handleCreate = () => {
    setEditingVendor(null);
    setIsFormOpen(true);
  };

  const handleEdit = (vendor: Vendor) => {
    setEditingVendor(vendor);
    setIsFormOpen(true);
  };

  const handleDelete = async (vendor: Vendor) => {
    if (
      window.confirm(
        `Are you sure you want to delete vendor "${vendor.name}"? This action cannot be undone.`
      )
    ) {
      const success = await deleteVendor(vendor.id, vendor.name);
      if (success) {
        refetch();
      }
    }
  };

  const handleToggleVerification = async (vendor: Vendor) => {
    const success = await toggleVerification(vendor.id, vendor.verified, vendor.name);
    if (success) {
      refetch();
    }
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setEditingVendor(null);
    refetch();
  };

  const getTierBadgeVariant = (tier: VendorTier) => {
    switch (tier) {
      case 'research':
        return 'default';
      case 'telehealth':
        return 'secondary';
      case 'brand':
        return 'outline';
    }
  };

  const getTierLabel = (tier: VendorTier) => {
    switch (tier) {
      case 'research':
        return 'Research Peptides';
      case 'telehealth':
        return 'Telehealth & GLP';
      case 'brand':
        return 'Brand / Originator';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading vendors...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Vendor Management</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {filteredVendors.length} vendor{filteredVendors.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Add Vendor
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search vendors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={tierFilter} onValueChange={(value) => setTierFilter(value as VendorTier | 'all')}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by tier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tiers</SelectItem>
              <SelectItem value="research">Research Peptides</SelectItem>
              <SelectItem value="telehealth">Telehealth & GLP</SelectItem>
              <SelectItem value="brand">Brand / Originator</SelectItem>
            </SelectContent>
          </Select>
          <Select value={verifiedFilter} onValueChange={(value) => setVerifiedFilter(value as typeof verifiedFilter)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="verified">Verified</SelectItem>
              <SelectItem value="unverified">Unverified</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Vendors Table */}
        {filteredVendors.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No vendors found</p>
            {(searchQuery || tierFilter !== 'all' || verifiedFilter !== 'all') && (
              <Button
                variant="link"
                onClick={() => {
                  setSearchQuery('');
                  setTierFilter('all');
                  setVerifiedFilter('all');
                }}
                className="mt-2"
              >
                Clear filters
              </Button>
            )}
          </div>
        ) : (
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Website</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVendors.map((vendor) => (
                  <TableRow key={vendor.id}>
                    <TableCell className="font-medium">{vendor.name}</TableCell>
                    <TableCell>
                      <Badge variant={getTierBadgeVariant(vendor.type)}>
                        {getTierLabel(vendor.type)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {vendor.website_url ? (
                        <a
                          href={vendor.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline inline-flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span className="text-sm">Visit</span>
                        </a>
                      ) : (
                        <span className="text-sm text-muted-foreground">No website</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {vendor.verified ? (
                        <Badge variant="default" className="bg-green-500">
                          <Shield className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          Unverified
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleVerification(vendor)}
                          disabled={toggling}
                          title={vendor.verified ? 'Mark as unverified' : 'Mark as verified'}
                        >
                          {vendor.verified ? (
                            <ShieldOff className="w-4 h-4" />
                          ) : (
                            <Shield className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(vendor)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(vendor)}
                          disabled={deleting}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {/* Vendor Form Dialog */}
      <VendorFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        vendor={editingVendor}
        onSuccess={handleFormSuccess}
      />
    </Card>
  );
};

