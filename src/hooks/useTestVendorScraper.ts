/**
 * useTestVendorScraper Hook
 * 
 * Tests a single vendor scraper configuration
 */

import { useState } from 'react';
import { functions } from '@/lib/firebase';
import { httpsCallable } from 'firebase/functions';

interface TestResult {
  success: boolean;
  vendor: string;
  products_found?: number;
  products_valid?: number;
  products_failed?: number;
  sample_results?: Array<{
    peptide_name: string;
    size_mg?: number;
    price_usd?: number;
    product_url?: string;
  }>;
  validation_errors?: Array<{
    peptide_name: string;
    error?: string;
    product_url?: string;
  }>;
  error?: string;
}

export function useTestVendorScraper() {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);

  async function testScraper(vendorId: string, vendorName: string) {
    setTesting(true);
    setResult(null);

    try {
      const testFn = httpsCallable(functions, 'testVendorScraper');
      const response = await testFn({ vendorId, vendorName });

      setResult(response.data as TestResult);
    } catch (error: any) {
      setResult({
        success: false,
        vendor: vendorName,
        error: error.message,
      });
    } finally {
      setTesting(false);
    }
  }

  return { testScraper, testing, result, clearResult: () => setResult(null) };
}

