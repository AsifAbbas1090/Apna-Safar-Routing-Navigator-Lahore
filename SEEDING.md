# Database Seeding Instructions

## Quick Start

1. **Update Database Schema** (if needed):
   ```bash
   cd backend
   npx prisma db push
   ```

2. **Run SQL in Supabase**:
   - Open Supabase Dashboard → SQL Editor
   - Copy **entire contents** of `SUPABASE_SEED.sql` (from line 1 to end)
   - Paste and click "Run"
   - Script will automatically clear old data first, then insert fresh data
   - Wait for completion (should take a few seconds)

3. **Verify**:
   - Check the verification query at the end of the script
   - Should show: ~65+ stops, 4 routes, ~75+ route-stops

## What Gets Created

- **27 Metro Bus Stations** (Gajjumata → Shahdara)
- **26 Orange Line Stations** (Ali Town → Dera Gujran)
- **12+ Feeder Bus Stops** (Sample routes: FRT01, FRT10)
- **4 Routes** (2 Metro/Orange Line + 2 Feeder) with all stops linked in correct order

## After Seeding

Route planning will work! The system will:
- ✅ Find actual bus/metro stops
- ✅ Plan routes using transit (not just walking)
- ✅ Show proper route paths on map
- ✅ Generate AI navigation instructions

## Troubleshooting

**If you get enum errors:**
- Run `npx prisma db push` first to update schema

**If you have existing data:**
- Clear it first (see note at top of SQL file)

**If stops aren't found:**
- Check coordinates are in Lahore area
- Verify: `SELECT COUNT(*) FROM stops;` should show ~65+
- Check feeder routes: `SELECT * FROM routes WHERE "transportType" = 'FEEDER';`

