# Quick Start: Apply Database Migration

## For Remote Supabase (No Docker Required) ⭐ RECOMMENDED

### Via Supabase Dashboard (Easiest):

1. Go to https://supabase.com/dashboard/project/rirckslupgqpcohgkomo
2. Click "SQL Editor" → "New query"
3. Copy contents of `supabase/migrations/20251010000000_complete_schema_enhancements.sql`
4. Paste and click "Run"
5. Go to "Storage" → Create buckets: `avatars`, `products`, `documents`

**See `APPLY_MIGRATION_REMOTE.md` for detailed instructions.**

### Via CLI:

```bash
# 1. Link to your remote project
npx supabase link --project-ref rirckslupgqpcohgkomo

# 2. Push the migration
npx supabase db push
```

## For Local Development (Requires Docker Desktop)

```bash
# 1. Start Supabase locally (if not running)
npx supabase start

# 2. Apply the migration
npx supabase db push

# 3. Create storage buckets
npx supabase storage create avatars --public
npx supabase storage create products --public
npx supabase storage create documents
```

## What Was Added?

✅ **Reviews table** - Product reviews and ratings  
✅ **Shipping address** - JSONB column in profiles  
✅ **Product ratings** - Auto-calculated from reviews  
✅ **Full-text search** - Search products by name/description  
✅ **20+ indexes** - Optimized query performance  
✅ **Helper functions** - Rating updates, purchase verification  

## Need More Details?

See `supabase/MIGRATION_GUIDE.md` for complete instructions.

## Troubleshooting

**Migration fails?**
- Check if Supabase is running: `npx supabase status`
- View logs: `npx supabase logs`

**Need to rollback?**
```bash
npx supabase db reset --version 20251009015932
```

---

**Migration File:** `supabase/migrations/20251010000000_complete_schema_enhancements.sql`
