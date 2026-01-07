/**
 * Scraper Configuration Tab
 * 
 * Admin UI for configuring vendor URL whitelists
 * No manual Firestore work needed
 */

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Check, X, AlertCircle } from 'lucide-react';
import { useVendors } from '@/hooks/useVendors';
import { useVendorUrls } from '@/hooks/useVendorUrls';
import { useTestVendorScraper } from '@/hooks/useTestVendorScraper';
import { toast } from 'sonner';

/**
 * Format last_updated timestamp from Cloud Function response
 * Handles both Firestore Timestamp objects and serialized timestamps
 */
function formatLastUpdated(timestamp: any): string {
  if (!timestamp) return 'Unknown';
  
  try {
    // Handle serialized Firestore timestamp (from Cloud Functions)
    if (timestamp._seconds !== undefined) {
      const date = new Date(timestamp._seconds * 1000);
      return date.toLocaleString();
    }
    
    // Handle Firestore Timestamp object with toDate()
    if (timestamp.toDate && typeof timestamp.toDate === 'function') {
      return timestamp.toDate().toLocaleString();
    }
    
    // Handle Date object
    if (timestamp instanceof Date) {
      return timestamp.toLocaleString();
    }
    
    // Handle ISO string
    if (typeof timestamp === 'string') {
      return new Date(timestamp).toLocaleString();
    }
    
    return 'Unknown';
  } catch (error) {
    console.error('Error formatting timestamp:', error);
    return 'Unknown';
  }
}

export function ScraperConfigurationTab() {
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);
  const [urlsText, setUrlsText] = useState('');
  const [saving, setSaving] = useState(false);

  const { vendors, loading: loadingVendors } = useVendors('research');
  const { config, loading: loadingConfig, saveConfig } = useVendorUrls(selectedVendorId);
  const { testScraper, testing, result, clearResult } = useTestVendorScraper();

  // Auto-populate URLs when vendor selected
  useEffect(() => {
    if (config) {
      setUrlsText(config.allowed_urls.join('\n'));
    } else {
      setUrlsText('');
    }
  }, [config]);

  const selectedVendor = vendors.find(v => v.id === selectedVendorId);

  async function handleSave() {
    if (!selectedVendorId || !selectedVendor) return;

    // Parse URLs (one per line)
    const urls = urlsText
      .split('\n')
      .map(url => url.trim())
      .filter(url => url.length > 0);

    if (urls.length === 0) {
      toast.error('Please enter at least one URL');
      return;
    }

    // Validate URLs
    for (const url of urls) {
      try {
        new URL(url);
      } catch (e) {
        toast.error(`Invalid URL: ${url}`);
        return;
      }
    }

    setSaving(true);
    try {
      await saveConfig(selectedVendor.name, urls);
      toast.success(`Configuration saved for ${selectedVendor.name}`);
      clearResult();
    } catch (error: any) {
      toast.error(`Failed to save: ${error.message}`);
    } finally {
      setSaving(false);
    }
  }

  async function handleTest() {
    if (!selectedVendorId || !selectedVendor) return;

    if (!config || config.allowed_urls.length === 0) {
      toast.error('Please save configuration first');
      return;
    }

    await testScraper(selectedVendorId, selectedVendor.name);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h2 className="text-2xl font-bold">Scraper Configuration</h2>
          <p className="text-muted-foreground">
            Configure URL whitelists for vendor scrapers. No manual Firestore work needed.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: Select Vendor */}
          <div>
            <label className="block text-sm font-medium mb-2">
              1. Select Vendor
            </label>
            <Select
              value={selectedVendorId || ''}
              onValueChange={setSelectedVendorId}
              disabled={loadingVendors}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose vendor to configure..." />
              </SelectTrigger>
              <SelectContent>
                {vendors.map(vendor => (
                  <SelectItem key={vendor.id} value={vendor.id}>
                    {vendor.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedVendorId && (
            <>
              {/* Step 2: Enter URLs */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  2. Paste Allowed URLs (from CSV pricing_source)
                </label>
                <Textarea
                  value={urlsText}
                  onChange={(e) => setUrlsText(e.target.value)}
                  placeholder={`https://example.com/products\nhttps://example.com/peptides\n(One URL per line)`}
                  rows={10}
                  className="font-mono text-sm"
                />
                <p className="text-sm text-muted-foreground mt-2">
                  Enter one URL per line. Copy from CSV pricing_source column.
                </p>
              </div>

              {/* Step 3: Save */}
              <div className="flex gap-2">
                <Button
                  onClick={handleSave}
                  disabled={saving || !urlsText.trim()}
                >
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  3. Save Configuration
                </Button>

                {config && (
                  <Button
                    onClick={handleTest}
                    variant="outline"
                    disabled={testing || saving}
                  >
                    {testing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    4. Test Scraper
                  </Button>
                )}
              </div>

              {/* Current Configuration */}
              {config && !loadingConfig && (
                <Alert>
                  <Check className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Current configuration:</strong> {config.allowed_urls.length} URLs configured.
                    Last updated: {formatLastUpdated(config.last_updated)}
                  </AlertDescription>
                </Alert>
              )}

              {/* Test Results */}
              {result && (
                <Alert variant={result.success ? 'default' : 'destructive'}>
                  {result.success ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <X className="h-4 w-4" />
                  )}
                  <AlertDescription>
                    {result.success ? (
                      <div>
                        <strong>Test successful!</strong>
                        <ul className="mt-2 space-y-1 text-sm">
                          <li>Products found: {result.products_found}</li>
                          <li>Valid products: {result.products_valid}</li>
                          {result.products_failed! > 0 && (
                            <li className="text-yellow-600">Failed products: {result.products_failed}</li>
                          )}
                        </ul>
                        {result.sample_results && result.sample_results.length > 0 && (
                          <div className="mt-3">
                            <strong className="text-sm">Sample products:</strong>
                            <ul className="mt-1 text-xs space-y-1">
                              {result.sample_results.map((p, i) => (
                                <li key={i}>{p.peptide_name} - {p.size_mg}mg - ${p.price_usd}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {result.validation_errors && result.validation_errors.length > 0 && (
                          <div className="mt-3">
                            <strong className="text-sm text-yellow-600">Validation errors:</strong>
                            <ul className="mt-1 text-xs space-y-1">
                              {result.validation_errors.map((e, i) => (
                                <li key={i}>{e.peptide_name}: {e.error}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div>
                        <strong>Test failed</strong>
                        <p className="mt-2 text-sm">{result.error}</p>
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Quick Start Guide</h3>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Select a vendor from the dropdown</li>
            <li>Open your CSV file and copy URLs from the <code className="bg-muted px-1">pricing_source</code> column</li>
            <li>Paste URLs into the textarea (one per line)</li>
            <li>Click "Save Configuration"</li>
            <li>Click "Test Scraper" to verify it works</li>
            <li>Repeat for each vendor</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}

