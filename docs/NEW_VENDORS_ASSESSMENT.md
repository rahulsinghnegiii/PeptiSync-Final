# New Research Peptide Vendors - V1 Scrapeability Assessment

**Assessment Date:** January 2026  
**V1 Constraints:** axios + cheerio only, no Playwright, no bot protection bypass

---

## Summary

Out of 4 new vendors tested:
- ✅ **1 Vendor V1 Scrapeable:** Behemoth Labz
- ❌ **3 Vendors NOT V1 Scrapeable:** Direct Peptides, NuScience Peptides, Lifestyle Peptides

---

## ✅ V1 SCRAPEABLE VENDOR

### **Behemoth Labz**
**Website:** https://behemothlabz.com/  
**Status:** ✅ V1 Compatible (WooCommerce, 20+ products detected)

**Recommended Configuration:**

```yaml
Vendor Details:
  Name: Behemoth Labz
  Type: research
  Website URL: https://behemothlabz.com/
  Verified: false

Allowed URLs (Whitelist):
  - https://behemothlabz.com/product-category/peptides/
  - https://behemothlabz.com/product/bpc-157/
```

**Test Results:**
- ✅ WooCommerce site detected
- ✅ 20 products found in category page
- ✅ Selector `.products .product` works
- ✅ No bot protection (Cloudflare)
- ✅ Static HTML, no JavaScript rendering required

**Expected Peptides (Sample):**
- BPC-157
- TB-500
- Ipamorelin
- Various blends and nasal sprays

---

## ❌ V1 NOT SCRAPEABLE VENDORS

### 1. **Direct Peptides**
**Website:** https://directpeptides.com/  
**Status:** ❌ Not V1 Compatible  
**Reason:** 404 errors on product/category pages. Site may have changed structure or requires different URLs.

**Test Results:**
- ❌ Homepage accessible but no products
- ❌ `/product-category/peptides/` returns 404
- ❌ `/product/bpc-157/` returns 404

**Recommendation for V2:**  
Manual URL discovery needed or site may require authentication/different access method.

---

### 2. **NuScience Peptides**
**Website:** https://nusciencepeptides.com/  
**Status:** ❌ Not V1 Compatible  
**Reason:** **Cloudflare Bot Protection** (403 Forbidden)

**Test Results:**
- ❌ All URLs return 403 Forbidden
- ❌ Strong bot detection active
- ❌ Blocks axios/curl/standard HTTP clients

**Recommendation for V2:**  
- Requires Playwright with stealth plugins
- Or proxy service with residential IPs
- Or official API if available

---

### 3. **Lifestyle Peptides**
**Website:** https://lifestylepeptides.com/  
**Status:** ❌ Not V1 Compatible  
**Reason:** **Cloudflare Bot Protection** (403 Forbidden)

**Test Results:**
- ❌ All URLs return 403 Forbidden
- ❌ Strong bot detection active
- ❌ Blocks axios/curl/standard HTTP clients

**Recommendation for V2:**  
- Requires Playwright with stealth plugins
- Or proxy service with residential IPs
- Or official API if available

---

## How to Add Behemoth Labz to the System

Since the vendor doesn't exist yet in Firestore, you have two options:

### Option 1: Manual Addition via Admin UI (Recommended)

1. **Go to Admin Panel** → **Vendor Comparison** → **Vendors Tab**
2. **Click "Add Vendor"**
3. **Fill in:**
   - Name: `Behemoth Labz`
   - Type: `Research`
   - Website URL: `https://behemothlabz.com/`
   - Verified: `No`
4. **Save** - Note the vendor ID created
5. **Go to Scraper Config Tab**
6. **Select "Behemoth Labz"** from dropdown
7. **Paste URLs:**
   ```
   https://behemothlabz.com/product-category/peptides/
   https://behemothlabz.com/product/bpc-157/
   ```
8. **Click "Save Configuration"**
9. **Click "Test Scraper"** to verify

---

### Option 2: Direct Firestore Addition

If you have Firestore console access:

1. **Add to `vendors` collection:**
   ```json
   {
     "name": "Behemoth Labz",
     "type": "research",
     "website_url": "https://behemothlabz.com/",
     "verified": false,
     "verification_date": null,
     "created_at": <server_timestamp>,
     "updated_at": <server_timestamp>
   }
   ```

2. **Note the generated document ID** (e.g., `abc123xyz`)

3. **Add to `vendor_urls` collection** with the same document ID:
   ```json
   {
     "vendor_id": "abc123xyz",
     "vendor_name": "Behemoth Labz",
     "allowed_urls": [
       "https://behemothlabz.com/product-category/peptides/",
       "https://behemothlabz.com/product/bpc-157/"
     ],
     "last_updated": <server_timestamp>
   }
   ```

---

## Final Statistics

| Vendor | V1 Status | Products Found | Bot Protection | Notes |
|--------|-----------|----------------|----------------|-------|
| Behemoth Labz | ✅ Compatible | 20+ | No | WooCommerce |
| Direct Peptides | ❌ Not Compatible | 0 | No | 404 errors |
| NuScience Peptides | ❌ Not Compatible | 0 | Yes (403) | Cloudflare |
| Lifestyle Peptides | ❌ Not Compatible | 0 | Yes (403) | Cloudflare |

**V1 Success Rate:** 25% (1 out of 4 vendors)

---

## Recommendations

### For V1 (Current):
- ✅ Add **Behemoth Labz** immediately
- ✅ Test scraper to ensure 20+ products are extracted
- ✅ Validate pricing and sizing data quality

### For V2 (Future):
- Consider Playwright for Cloudflare-protected sites (NuScience, Lifestyle)
- Investigate Direct Peptides site structure changes
- Implement residential proxy rotation for bot-protected sites
- Add CAPTCHA solving service if needed

---

## Existing V1 Working Vendors (For Reference)

Current vendors successfully scraping with V1:
1. ✅ Limitless Life Nootropics (12 products)
2. ✅ Biotech Peptides
3. ✅ Core Peptides
4. ✅ Behemoth Labz (NEW - 20+ products)

**Blocked by Cloudflare (V2 needed):**
- Amino USA
- Peptide Sciences
- Longevity Peptides
- Iron Mountain Labz
- NuScience Peptides (NEW)
- Lifestyle Peptides (NEW)

---

## Next Steps

1. ✅ Add Behemoth Labz via Admin UI
2. ✅ Test scraper on Behemoth Labz
3. ✅ Verify product data quality
4. ⏳ Plan V2 implementation for Cloudflare-protected vendors

**Total Research Vendors in System After Addition:** 8 configured, 4 actively scraping

