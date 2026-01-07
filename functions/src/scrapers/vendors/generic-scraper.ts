/**
 * Generic Vendor Scraper
 * 
 * Creates a scraper for any vendor dynamically
 * Vendor ID resolved automatically from Firestore
 */

import * as admin from 'firebase-admin';
import * as cheerio from 'cheerio';
import { VendorScraper, ScraperResult, VendorUrls, DiscoveredSelectors } from '../types';
import { WhitelistEnforcer } from '../lib/whitelist-enforcer';
import { discoverSelectorsFromWhitelist } from '../lib/selector-discovery';
import { loadCachedSelectors, updateSelectorCache } from '../lib/selector-cache';
import { extractText, extractPrice, extractMg, toAbsoluteUrl, cleanPeptideName } from '../lib/parser-utils';
import { markValidation } from '../lib/data-validator';
import { isWooCommerceSite, scrapeWooCommerceCategoryPage, scrapeWooCommerceProductPage } from '../lib/woocommerce-scraper';

/**
 * Create a scraper for any vendor
 */
export function createVendorScraper(vendorId: string, vendorName: string): VendorScraper {
  return {
    name: vendorName,
    vendorId: vendorId,

    async scrape(): Promise<ScraperResult[]> {
      const db = admin.firestore();

      // Load URL whitelist
      const urlDoc = await db.collection('vendor_urls').doc(this.vendorId).get();

      if (!urlDoc.exists) {
        throw new Error(
          `No URL whitelist configured for ${this.name}. ` +
          `Please configure via Admin Panel → Scraper Configuration.`
        );
      }

      const vendorUrls = urlDoc.data() as VendorUrls;

      if (!vendorUrls.allowed_urls || vendorUrls.allowed_urls.length === 0) {
        throw new Error(`No URLs configured for ${this.name}`);
      }

      console.log(`[${this.name}] Loaded ${vendorUrls.allowed_urls.length} whitelisted URLs`);

      // Create enforcer
      const enforcer = new WhitelistEnforcer(vendorUrls);

      // Check if this is a WooCommerce site
      const firstUrl = vendorUrls.allowed_urls[0];
      const testHtml = await enforcer.fetchWithEnforcement(firstUrl);
      const isWooCommerce = isWooCommerceSite(testHtml);

      if (isWooCommerce) {
        console.log(`[${this.name}] Detected WooCommerce site - using optimized scraper`);
        return await scrapeWooCommerceUrls(this.name, this.vendorId, vendorUrls, enforcer);
      }

      // Load or discover selectors for non-WooCommerce sites
      let selectors = await loadCachedSelectors(db, this.vendorId);

      if (!selectors || selectors.confidence < 0.6) {
        console.log(`[${this.name}] Discovering selectors...`);
        selectors = await discoverSelectorsFromWhitelist(vendorUrls, enforcer);

        if (selectors.confidence < 0.5) {
          throw new Error(
            `Low confidence (${selectors.confidence.toFixed(2)}) - ` +
            `selectors may need manual review`
          );
        }

        await updateSelectorCache(db, this.vendorId, selectors);
      } else {
        console.log(`[${this.name}] Using cached selectors (confidence: ${selectors.confidence.toFixed(2)})`);
      }

      // Scrape all whitelisted URLs
      return await scrapeAllPages(this.name, this.vendorId, vendorUrls, selectors, enforcer);
    },
  };
}

/**
 * Scrape all pages using discovered selectors
 */
async function scrapeAllPages(
  vendorName: string,
  vendorId: string,
  vendorUrls: VendorUrls,
  selectors: DiscoveredSelectors,
  enforcer: WhitelistEnforcer
): Promise<ScraperResult[]> {
  const results: ScraperResult[] = [];
  const seenProductUrls = new Set<string>();

  // Scrape category pages
  for (const categoryPage of selectors.category_pages) {
    try {
      console.log(`[${vendorName}] Scraping category page: ${categoryPage.url}`);
      const html = await enforcer.fetchWithEnforcement(categoryPage.url);
      const $ = cheerio.load(html);

      // Extract product links
      const productLinks: string[] = [];
      $(categoryPage.product_link_selector).each((_, elem) => {
        const href = $(elem).attr('href');
        if (href) {
          const absoluteUrl = toAbsoluteUrl(href, categoryPage.url);

          // Validate product URL (must be same domain)
          if (enforcer.validateProductUrl(absoluteUrl) && !seenProductUrls.has(absoluteUrl)) {
            productLinks.push(absoluteUrl);
            seenProductUrls.add(absoluteUrl);
          }
        }
      });

      console.log(`[${vendorName}] Found ${productLinks.length} product links on ${categoryPage.url}`);

      // Scrape each product
      for (const productUrl of productLinks) {
        const productData = await scrapeProduct(
          vendorName,
          vendorId,
          productUrl,
          selectors,
          enforcer,
          vendorUrls
        );
        if (productData) {
          results.push(productData);
        }
      }
    } catch (error: any) {
      console.error(`[${vendorName}] Error scraping category ${categoryPage.url}:`, error.message);
    }
  }

  // Scrape direct product pages
  for (const productPage of selectors.product_pages) {
    if (seenProductUrls.has(productPage.url)) {
      continue; // Skip if already scraped
    }

    const productData = await scrapeProduct(
      vendorName,
      vendorId,
      productPage.url,
      selectors,
      enforcer,
      vendorUrls
    );
    if (productData) {
      results.push(productData);
      seenProductUrls.add(productPage.url);
    }
  }

  console.log(`[${vendorName}] Scraped ${results.length} products total`);

  return results;
}

/**
 * Scrape WooCommerce URLs
 */
async function scrapeWooCommerceUrls(
  vendorName: string,
  vendorId: string,
  vendorUrls: VendorUrls,
  enforcer: WhitelistEnforcer
): Promise<ScraperResult[]> {
  const results: ScraperResult[] = [];
  const seenUrls = new Set<string>();

  for (const url of vendorUrls.allowed_urls) {
    if (seenUrls.has(url)) continue;
    seenUrls.add(url);

    try {
      // Try as category page first
      const categoryResults = await scrapeWooCommerceCategoryPage(url, enforcer, vendorId, vendorName);
      
      if (categoryResults.length > 0) {
        console.log(`[${vendorName}] Found ${categoryResults.length} products from category page`);
        results.push(...categoryResults);
      } else {
        // Try as product page
        const productResult = await scrapeWooCommerceProductPage(url, enforcer, vendorId, vendorName);
        if (productResult) {
          console.log(`[${vendorName}] Found 1 product from product page`);
          results.push(productResult);
        }
      }
    } catch (error: any) {
      console.error(`[${vendorName}] Error scraping ${url}:`, error.message);
    }
  }

  return results;
}

/**
 * Scrape a single product page
 */
async function scrapeProduct(
  vendorName: string,
  vendorId: string,
  productUrl: string,
  selectors: DiscoveredSelectors,
  enforcer: WhitelistEnforcer,
  vendorUrls: VendorUrls
): Promise<ScraperResult | null> {
  try {
    console.log(`[${vendorName}] Scraping product: ${productUrl}`);

    // Find matching product page selectors
    const productPageSelectors = selectors.product_pages.find(p => p.url === productUrl);

    // If not in whitelist, fetch with caution (must be same domain)
    let html: string;
    if (enforcer.isAllowed(productUrl)) {
      html = await enforcer.fetchWithEnforcement(productUrl);
    } else if (enforcer.validateProductUrl(productUrl)) {
      // Same domain but not explicitly whitelisted - allow for discovered products
      html = await enforcer.fetchWithEnforcement(vendorUrls.allowed_urls[0]); // Use base URL for fetch
      // In a real implementation, we'd need to modify fetchWithEnforcement or use a different method
      // For now, we'll skip non-whitelisted products
      console.warn(`[${vendorName}] Skipping non-whitelisted product: ${productUrl}`);
      return null;
    } else {
      console.warn(`[${vendorName}] Skipping invalid product URL: ${productUrl}`);
      return null;
    }

    const $ = cheerio.load(html);

    // Extract fields using selectors or fallback heuristics
    let peptideName: string | null = null;
    let priceText: string | null = null;
    let sizeText: string | null = null;

    if (productPageSelectors) {
      // Use discovered selectors
      if (productPageSelectors.title_selector) {
        peptideName = extractText($, productPageSelectors.title_selector);
      }
      if (productPageSelectors.price_selector) {
        priceText = extractText($, productPageSelectors.price_selector);
      }
      if (productPageSelectors.size_selector) {
        sizeText = extractText($, productPageSelectors.size_selector);
      }
    }

    // Fallback: search page text for patterns
    if (!peptideName) {
      peptideName = extractText($, 'h1') || extractText($, 'title');
    }
    if (!priceText) {
      priceText = extractText($, '.price') || extractText($, '[class*="price"]');
    }
    if (!sizeText) {
      // Search entire page for mg pattern
      const bodyText = $('body').text();
      const mgMatch = bodyText.match(/(\d+)\s*mg/i);
      sizeText = mgMatch ? mgMatch[0] : null;
    }

    // Parse values
    const priceUsd = priceText ? extractPrice(priceText) : null;
    const sizeMg = sizeText ? extractMg(sizeText) : null;

    // Build result
    const result: ScraperResult = {
      vendor_name: vendorName,
      peptide_name: peptideName ? cleanPeptideName(peptideName) : '',
      vendor_url: vendorUrls.allowed_urls[0], // Use first URL as vendor URL
      product_url: productUrl,
      size_mg: sizeMg || undefined,
      price_usd: priceUsd || undefined,
      shipping_usd: 0, // Default to 0 for now
      scraped_at: new Date(),
      price_source_type: 'automated_scrape',
      raw_price_text: priceText || undefined,
      raw_size_text: sizeText || undefined,
      valid: false, // Will be set by validator
    };

    // Validate
    const validatedResult = markValidation(result);

    if (!validatedResult.valid) {
      console.warn(`[${vendorName}] Validation failed for ${productUrl}: ${validatedResult.validation_error}`);
    }

    return validatedResult;
  } catch (error: any) {
    console.error(`[${vendorName}] Error scraping product ${productUrl}:`, error.message);
    return null;
  }
}

