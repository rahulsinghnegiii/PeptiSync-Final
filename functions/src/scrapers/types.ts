/**
 * Scraper Types
 * 
 * Type definitions for the scraper system
 */

// Note: VendorTier imported from shared module, re-exported for convenience
export type { VendorTier } from '../shared/validation-utils';

// ============================================================================
// SCRAPER RESULTS
// ============================================================================

/**
 * Raw scraped data (before validation)
 */
export interface ScraperResult {
  vendor_name: string;
  peptide_name: string;
  vendor_url?: string;
  product_url?: string;
  
  // Tier-1 (Research) fields
  size_mg?: number;
  price_usd?: number;
  shipping_usd?: number;
  
  // Metadata
  scraped_at: Date;
  price_source_type: 'automated_scrape';
  
  // Internal tracking
  raw_price_text?: string;
  raw_size_text?: string;
  valid: boolean;
  validation_error?: string;
}

// ============================================================================
// SCRAPER JOB TRACKING
// ============================================================================

/**
 * Simplified job tracking for V1
 */
export interface ScraperJob {
  job_id: string;
  trigger_type: 'scheduled' | 'manual';
  triggered_by?: string;
  started_at: Date;
  completed_at?: Date;
  status: 'running' | 'completed' | 'failed';
  
  // Aggregated metrics
  vendors_succeeded: number;
  vendors_failed: number;
  total_products_scraped: number;
  total_products_valid: number;
  total_created: number;
  total_updated: number;
  total_unchanged: number;
  
  // Errors
  error_messages: string[];
}

/**
 * Vendor-level results within a job
 */
export interface ScraperJobVendor {
  job_id: string;
  vendor_id: string;
  vendor_name: string;
  status: 'success' | 'partial' | 'failed';
  
  started_at: Date;
  completed_at?: Date;
  
  // Metrics
  pages_visited: number;
  products_found: number;
  products_scraped: number;
  products_valid: number;
  products_failed: number;
  
  // Firestore actions
  offers_created: number;
  offers_updated: number;
  offers_unchanged: number;
  
  // Validation failures
  validation_failures: { [key: string]: number };
  
  // Error tracking
  errors: string[];
  warnings: string[];
}

/**
 * Item-level details (cost-controlled storage)
 */
export interface ScraperJobItem {
  job_id: string;
  vendor_id: string;
  vendor_name: string;
  
  // Product info
  peptide_name: string;
  product_url?: string;
  
  // Raw scraped values
  raw_price_text?: string;
  raw_size_text?: string;
  
  // Parsed values
  size_mg?: number;
  price_usd?: number;
  shipping_usd?: number;
  
  // Status
  status: 'success' | 'parse_failed' | 'validation_failed' | 'upsert_failed';
  validation_error?: string;
  
  // Firestore action (simplified)
  firestore_action?: {
    action: 'created' | 'updated' | 'unchanged';
  };
  
  // Why was this item stored?
  storage_reason: 'failed' | 'validation_failed' | 'created' | 'updated' | 'sample_unchanged';
  
  // Timestamp
  scraped_at: Date;
}

// ============================================================================
// SCRAPER IMPLEMENTATION
// ============================================================================

/**
 * Vendor scraper interface
 */
export interface VendorScraper {
  name: string;
  vendorId: string;
  scrape(): Promise<ScraperResult[]>;
}

// ============================================================================
// URL WHITELIST
// ============================================================================

/**
 * Vendor URL whitelist (stored in Firestore)
 */
export interface VendorUrls {
  vendor_id: string;
  vendor_name: string;
  allowed_urls: string[];
  last_updated: any; // Firestore Timestamp
}

/**
 * Classified URL types
 */
export type UrlType = 'category' | 'product' | 'unknown';

/**
 * Classified URL
 */
export interface ClassifiedUrl {
  url: string;
  type: UrlType;
  confidence: number; // 0-1
}

// ============================================================================
// SELECTOR DISCOVERY
// ============================================================================

/**
 * Discovered selectors (cached in Firestore)
 */
export interface DiscoveredSelectors {
  vendor_id: string;
  vendor_name: string;
  
  // Category pages
  category_pages: CategoryPageSelectors[];
  
  // Product pages
  product_pages: ProductPageSelectors[];
  
  // Overall confidence
  confidence: number; // 0-1
  
  // Metadata
  discovered_at: Date;
  expires_at: Date; // 7 days from discovery
}

/**
 * Category page selectors
 */
export interface CategoryPageSelectors {
  url: string;
  product_link_selector: string;
  confidence: number;
}

/**
 * Product page selectors
 */
export interface ProductPageSelectors {
  url: string;
  title_selector?: string;
  price_selector?: string;
  size_selector?: string;
  confidence: number;
}

/**
 * Selector confidence score
 */
export interface SelectorConfidence {
  selector: string;
  successRate: number; // 0-1
  sampleSize: number;
}

