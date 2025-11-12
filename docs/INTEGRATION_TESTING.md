# PeptiSync Nova - Integration Testing Guide

Complete guide for end-to-end integration testing of all features.

## Overview

This document outlines the integration testing strategy for PeptiSync Nova, covering all user journeys, feature integrations, and system interactions.

---

## Test Environment Setup

### Prerequisites

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env
# Fill in all required variables

# 3. Start development server
npm run dev

# 4. Verify Supabase connection
# Check browser console for connection errors
```

### Test Data Setup

1. **Create Test Admin User**
   - Email: admin@test.peptisync.com
   - Password: TestAdmin123!
   - Assign admin role in Supabase

2. **Create Test Regular User**
   - Email: user@test.peptisync.com
   - Password: TestUser123!

3. **Add Test Products**
   - At least 10 products with various categories
   - Mix of in-stock and out-of-stock items
   - Products with and without images

4. **Stripe Test Cards**
   - Success: 4242 4242 4242 4242
   - Decline: 4000 0000 0000 0002
   - 3D Secure: 4000 0027 6000 3184

---

## Integration Test Scenarios

### 1. Complete User Journey: New Customer

**Objective:** Test full flow from registration to order completion

#### Steps

1. **Registration**
   - [ ] Navigate to /auth
   - [ ] Click "Sign Up" tab
   - [ ] Fill in registration form
   - [ ] Submit form
   - [ ] Verify welcome email received
   - [ ] Check email verification link works
   - [ ] Verify profile created in database

2. **Browse Products**
   - [ ] Navigate to /store
   - [ ] Verify products load
   - [ ] Test search functionality
   - [ ] Apply filters (category, price, rating)
   - [ ] Sort products
   - [ ] Click product to view details

3. **Add to Cart**
   - [ ] Click "Add to Cart" on product
   - [ ] Verify cart badge updates
   - [ ] Open cart drawer
   - [ ] Verify product appears in cart
   - [ ] Update quantity
   - [ ] Verify total updates
   - [ ] Add more products

4. **Checkout**
   - [ ] Click "Checkout" in cart
   - [ ] Verify redirect to /checkout
   - [ ] Fill shipping information
   - [ ] Verify address saves to profile
   - [ ] Proceed to payment
   - [ ] Enter test card details
   - [ ] Submit payment
   - [ ] Verify payment processes

5. **Order Confirmation**
   - [ ] Verify redirect to confirmation page
   - [ ] Check order number displays
   - [ ] Verify order details are correct
   - [ ] Check order confirmation email received
   - [ ] Verify cart is cleared
   - [ ] Check order appears in dashboard

6. **Order Tracking**
   - [ ] Navigate to dashboard
   - [ ] Click "View Details" on order
   - [ ] Verify order tracking page loads
   - [ ] Check order timeline displays
   - [ ] Verify order items are correct

**Expected Results:**
- ✅ User can complete entire flow without errors
- ✅ All emails are received
- ✅ Data persists correctly
- ✅ UI updates in real-time

---

### 2. Product Review Integration

**Objective:** Test review system integration with orders

#### Steps

1. **Complete Purchase**
   - [ ] Login as test user
   - [ ] Purchase a product
   - [ ] Complete checkout

2. **Write Review**
   - [ ] Navigate to product detail page
   - [ ] Verify "Write Review" button appears
   - [ ] Click "Write Review"
   - [ ] Select star rating
   - [ ] Write review comment
   - [ ] Submit review
   - [ ] Verify review appears on product page

3. **Verify Integration**
   - [ ] Check product rating updated
   - [ ] Verify review count incremented
   - [ ] Check "Verified Purchase" badge shows
   - [ ] Verify review appears in user's dashboard
   - [ ] Test review cannot be submitted twice

**Expected Results:**
- ✅ Only verified purchasers can review
- ✅ Product ratings update automatically
- ✅ Reviews display correctly
- ✅ One review per product per user

---

### 3. Admin Order Management Integration

**Objective:** Test admin panel integration with order system

#### Steps

1. **Login as Admin**
   - [ ] Login with admin credentials
   - [ ] Navigate to /admin
   - [ ] Verify admin panel loads

2. **View Orders**
   - [ ] Click "Orders" tab
   - [ ] Verify all orders display
   - [ ] Test order filters
   - [ ] Search for specific order

3. **Update Order Status**
   - [ ] Select an order
   - [ ] Change status to "Shipped"
   - [ ] Add tracking number
   - [ ] Add order notes
   - [ ] Save changes

4. **Verify Email Notification**
   - [ ] Check customer receives status update email
   - [ ] Verify email contains tracking number
   - [ ] Check email links work

5. **Verify Customer View**
   - [ ] Login as customer
   - [ ] Navigate to order tracking
   - [ ] Verify status updated
   - [ ] Check tracking number displays
   - [ ] Verify timeline updated

**Expected Results:**
- ✅ Admin can manage all orders
- ✅ Status updates trigger emails
- ✅ Changes reflect in customer view
- ✅ Tracking numbers are clickable

---

### 4. Inventory Management Integration

**Objective:** Test inventory system integration with orders

#### Steps

1. **Check Initial Stock**
   - [ ] Login as admin
   - [ ] Navigate to Products
   - [ ] Note stock quantity for test product

2. **Place Order**
   - [ ] Login as customer
   - [ ] Add product to cart (quantity: 2)
   - [ ] Complete checkout

3. **Verify Stock Update**
   - [ ] Login as admin
   - [ ] Check product stock decreased by 2
   - [ ] Verify low stock alert if applicable

4. **Test Out of Stock**
   - [ ] Set product stock to 0
   - [ ] Login as customer
   - [ ] Navigate to product page
   - [ ] Verify "Out of Stock" badge shows
   - [ ] Verify "Add to Cart" button disabled

5. **Test Stock Validation**
   - [ ] Set product stock to 1
   - [ ] Try to add 5 to cart
   - [ ] Verify error message
   - [ ] Verify only 1 can be added

**Expected Results:**
- ✅ Stock decreases after order
- ✅ Out-of-stock products cannot be purchased
- ✅ Stock validation prevents overselling
- ✅ Low stock alerts work

---

### 5. Email Notification Integration

**Objective:** Test all email triggers and templates

#### Email Types to Test

1. **Welcome Email**
   - Trigger: User registration
   - [ ] Verify email received
   - [ ] Check personalization (user name)
   - [ ] Test verification link
   - [ ] Verify template renders correctly

2. **Order Confirmation**
   - Trigger: Successful order
   - [ ] Verify email received
   - [ ] Check order details correct
   - [ ] Verify order items listed
   - [ ] Check total amount correct

3. **Order Status Update**
   - Trigger: Admin updates order status
   - [ ] Verify email received
   - [ ] Check new status displayed
   - [ ] Verify order link works

4. **Shipping Notification**
   - Trigger: Tracking number added
   - [ ] Verify email received
   - [ ] Check tracking number present
   - [ ] Test carrier link
   - [ ] Verify estimated delivery

5. **Password Reset**
   - Trigger: User requests password reset
   - [ ] Verify email received
   - [ ] Test reset link
   - [ ] Verify link expires after use

**Expected Results:**
- ✅ All emails send correctly
- ✅ Templates render properly
- ✅ Links work as expected
- ✅ Personalization is accurate

---

### 6. Real-Time Cart Synchronization

**Objective:** Test cart sync across tabs and devices

#### Steps

1. **Multi-Tab Test**
   - [ ] Login in Tab 1
   - [ ] Add product to cart in Tab 1
   - [ ] Open Tab 2 (same browser)
   - [ ] Verify cart updates in Tab 2
   - [ ] Update quantity in Tab 2
   - [ ] Verify update in Tab 1

2. **Multi-Device Test**
   - [ ] Login on Device 1
   - [ ] Add products to cart
   - [ ] Login on Device 2 (same account)
   - [ ] Verify cart syncs
   - [ ] Remove item on Device 2
   - [ ] Verify removal on Device 1

**Expected Results:**
- ✅ Cart syncs in real-time
- ✅ Changes reflect across tabs
- ✅ No data loss or conflicts

---

### 7. Payment Processing Integration

**Objective:** Test Stripe integration thoroughly

#### Test Cases

1. **Successful Payment**
   - Card: 4242 4242 4242 4242
   - [ ] Payment processes
   - [ ] Order created
   - [ ] Payment intent ID saved
   - [ ] Confirmation shown

2. **Declined Payment**
   - Card: 4000 0000 0000 0002
   - [ ] Payment fails gracefully
   - [ ] Error message displays
   - [ ] Order not created
   - [ ] Cart not cleared

3. **3D Secure Payment**
   - Card: 4000 0027 6000 3184
   - [ ] 3D Secure modal appears
   - [ ] Can complete authentication
   - [ ] Payment processes after auth
   - [ ] Order created

4. **Network Error**
   - [ ] Disconnect internet
   - [ ] Try to process payment
   - [ ] Verify error handling
   - [ ] Reconnect and retry

**Expected Results:**
- ✅ Successful payments create orders
- ✅ Failed payments show clear errors
- ✅ 3D Secure works correctly
- ✅ Network errors handled gracefully

---

### 8. Search and Filter Integration

**Objective:** Test search and filter system

#### Steps

1. **Full-Text Search**
   - [ ] Search for product name
   - [ ] Search for partial name
   - [ ] Search for description keywords
   - [ ] Verify results are relevant

2. **Filter Combinations**
   - [ ] Apply category filter
   - [ ] Add price range filter
   - [ ] Add rating filter
   - [ ] Verify results match all filters

3. **Sort with Filters**
   - [ ] Apply filters
   - [ ] Sort by price
   - [ ] Verify sort maintains filters
   - [ ] Change sort option
   - [ ] Verify filters persist

4. **URL State**
   - [ ] Apply filters and sort
   - [ ] Copy URL
   - [ ] Open in new tab
   - [ ] Verify filters/sort applied

**Expected Results:**
- ✅ Search returns relevant results
- ✅ Filters work correctly
- ✅ Combinations work as expected
- ✅ State persists in URL

---

## Cross-Browser Testing

### Browsers to Test

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] iOS Safari
- [ ] Android Chrome

### Test Matrix

For each browser, verify:
- [ ] All pages load correctly
- [ ] Forms submit properly
- [ ] Payment processing works
- [ ] Images display correctly
- [ ] Animations work smoothly
- [ ] No console errors
- [ ] Responsive design works

---

## Performance Testing

### Lighthouse Audits

Run on all major pages:
- [ ] Home page (/)
- [ ] Store page (/store)
- [ ] Product detail (/store/:id)
- [ ] Checkout (/checkout)
- [ ] Dashboard (/dashboard)
- [ ] Admin panel (/admin)

### Target Metrics

- Performance: > 90
- Accessibility: > 90
- Best Practices: > 90
- SEO: > 90

### Core Web Vitals

- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1

---

## Security Testing

### Authentication Tests

- [ ] Cannot access protected routes without login
- [ ] Session expires after timeout
- [ ] Password reset works securely
- [ ] Email verification required

### Authorization Tests

- [ ] Regular users cannot access admin panel
- [ ] Users can only view their own orders
- [ ] Users can only edit their own profile
- [ ] RLS policies enforced

### Input Validation

- [ ] XSS attempts blocked
- [ ] SQL injection prevented
- [ ] CSRF tokens validated
- [ ] File uploads validated

---

## Regression Testing

After any code changes, verify:
- [ ] Existing features still work
- [ ] No new console errors
- [ ] Performance not degraded
- [ ] Tests still pass

---

## Bug Reporting Template

```markdown
**Title:** Brief description

**Environment:**
- Browser: Chrome 120
- Device: Desktop
- OS: Windows 11

**Steps to Reproduce:**
1. Step one
2. Step two
3. Step three

**Expected Result:**
What should happen

**Actual Result:**
What actually happened

**Screenshots:**
[Attach screenshots]

**Console Errors:**
[Paste any errors]

**Severity:**
- [ ] Critical (blocks core functionality)
- [ ] High (major feature broken)
- [ ] Medium (minor feature issue)
- [ ] Low (cosmetic issue)
```

---

## Sign-Off Checklist

Before deployment:
- [ ] All integration tests pass
- [ ] Cross-browser testing complete
- [ ] Performance metrics meet targets
- [ ] Security tests pass
- [ ] No critical bugs
- [ ] Documentation updated
- [ ] Stakeholder approval received

---

**Last Updated:** 2025-10-11  
**Version:** 1.0  
**Status:** Ready for Testing

