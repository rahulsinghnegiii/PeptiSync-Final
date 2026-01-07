/**
 * useVendorUrls Hook
 * 
 * Manages vendor URL whitelist configuration
 */

import { useState, useEffect } from 'react';
import { functions } from '@/lib/firebase';
import { httpsCallable } from 'firebase/functions';

interface VendorUrls {
  vendor_id: string;
  vendor_name: string;
  allowed_urls: string[];
  last_updated: any;
}

export function useVendorUrls(vendorId: string | null) {
  const [config, setConfig] = useState<VendorUrls | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!vendorId) {
      setConfig(null);
      return;
    }

    loadConfig();
  }, [vendorId]);

  async function loadConfig() {
    if (!vendorId) return;

    setLoading(true);
    try {
      const getVendorUrlsFn = httpsCallable(functions, 'getVendorUrls');
      const response = await getVendorUrlsFn({ vendorId });
      const data = response.data as { success: boolean; config: VendorUrls | null };
      
      if (data.success) {
        setConfig(data.config);
      }
    } catch (error) {
      console.error('Failed to load vendor URLs:', error);
    } finally {
      setLoading(false);
    }
  }

  async function saveConfig(vendorName: string, urls: string[]) {
    if (!vendorId) return;

    const saveVendorUrlsFn = httpsCallable(functions, 'saveVendorUrls');
    await saveVendorUrlsFn({
      vendorId,
      vendorName,
      allowedUrls: urls,
    });
    
    // Reload config after save
    await loadConfig();
  }

  return { config, loading, saveConfig, reload: loadConfig };
}

