# Vendor Comparison V1 - Required Dependencies

## 📦 NPM Packages to Install

Before testing Phase 3 (CSV/Excel Ingestion), install these dependencies:

### Production Dependencies
```bash
npm install papaparse date-fns
```

### Development Dependencies
```bash
npm install --save-dev @types/papaparse
```

---

## Package Details

### 1. **papaparse** (^5.4.1)
- **Purpose**: CSV and Excel file parsing
- **Features**: 
  - Header-based parsing
  - Dynamic typing
  - Transform functions
  - Error handling
- **Used in**: `src/lib/csvParser.ts`

### 2. **date-fns** (^3.0.0)
- **Purpose**: Date formatting and manipulation
- **Features**:
  - `formatDistanceToNow()`: Relative timestamps
  - Lightweight alternative to Moment.js
- **Used in**: `src/components/admin/vendorComparison/UploadHistoryTable.tsx`

### 3. **@types/papaparse** (^5.3.14)
- **Purpose**: TypeScript type definitions for Papa Parse
- **Used in**: Type safety for CSV parser

---

## Installation Instructions

### Option 1: Install All at Once
```bash
npm install papaparse date-fns && npm install --save-dev @types/papaparse
```

### Option 2: Using Yarn
```bash
yarn add papaparse date-fns
yarn add -D @types/papaparse
```

### Option 3: Using PNPM
```bash
pnpm add papaparse date-fns
pnpm add -D @types/papaparse
```

---

## Verification

After installation, verify the packages are in `package.json`:

```json
{
  "dependencies": {
    "papaparse": "^5.4.1",
    "date-fns": "^3.0.0"
  },
  "devDependencies": {
    "@types/papaparse": "^5.3.14"
  }
}
```

---

## Build & Test

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Dev Server
```bash
npm run dev
```

### 3. Access Admin Panel
Navigate to: `/admin` → **Vendor Comparison** → **Uploads** tab

### 4. Test CSV Upload
1. Select a tier (Research, Telehealth, or Brand)
2. Download the CSV template
3. Upload the template file
4. Verify parsing and preview dialog

---

## Notes

- **Papa Parse** is a peer-reviewed, battle-tested CSV parser with excellent TypeScript support
- **date-fns** is already used elsewhere in the PeptiSync codebase (check existing imports)
- These dependencies have **zero breaking changes** and are widely used in production apps
- No additional configuration needed - they work out of the box

---

## Troubleshooting

### Issue: "Cannot find module 'papaparse'"
**Solution**: Run `npm install papaparse`

### Issue: TypeScript errors for Papa Parse
**Solution**: Run `npm install --save-dev @types/papaparse`

### Issue: "date-fns/formatDistanceToNow not found"
**Solution**: Ensure you're importing from `date-fns` correctly:
```typescript
import { formatDistanceToNow } from 'date-fns';
```

---

## Next Steps

After installing dependencies:
1. Proceed to Phase 4: PDF Upload + Manual Entry
2. Run seed script to populate vendors: `npm run seed-vendors` (to be created)
3. Test CSV uploads for all three tiers
4. Verify upload history and preview dialog

---

**Status**: Dependencies required before Phase 3 testing  
**Action Required**: Run installation commands above  
**Estimated Time**: < 1 minute

