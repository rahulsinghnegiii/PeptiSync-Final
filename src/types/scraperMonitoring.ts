/**
 * Scraper Monitoring Types
 * 
 * Frontend types for scraper job tracking and monitoring
 * Mirrors backend types from functions/src/scrapers/types.ts
 */

import { Timestamp } from 'firebase/firestore';

/**
 * Scraper job tracking (top-level)
 */
export interface ScraperJob {
  id: string; // Firestore document ID
  job_id: string;
  trigger_type: 'scheduled' | 'manual';
  triggered_by?: string;
  started_at: Timestamp;
  completed_at?: Timestamp;
  cancelled_at?: Timestamp;
  cancelled_by?: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  
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
  id: string; // Firestore document ID
  job_id: string;
  vendor_id: string;
  vendor_name: string;
  status: 'success' | 'partial' | 'failed';
  
  started_at: Timestamp;
  completed_at?: Timestamp;
  
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
  id: string; // Firestore document ID
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
  scraped_at: Timestamp;
}

/**
 * Trigger scrapers result
 */
export interface TriggerScrapersResult {
  success: boolean;
  jobId: string;
  message?: string;
}

