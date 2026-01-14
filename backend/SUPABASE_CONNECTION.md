# Supabase Connection Setup - Final Configuration ✅

## ✅ Working Configuration

### `.env` File

```env
# App
PORT=3001
NODE_ENV=development

# Prisma / Supabase
# Runtime: Use Transaction Pooler (port 6543) - efficient for API queries
DATABASE_URL="postgresql://postgres.rkfnimpgxmkmqxlkzxur:Muhammad%20pbuh1090@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Migrations: Use Session Pooler (port 5432) - works for db push on Windows/IPv4
DIRECT_URL="postgresql://postgres.rkfnimpgxmkmqxlkzxur:Muhammad%20pbuh1090@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres?pgbouncer=true"

# Supabase client keys (for frontend / APIs)
NEXT_PUBLIC_SUPABASE_URL=https://rkfnimpgxmkmqxlkzxur.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=sb_publishable_vl5anaPxMpOojIrGZcp6nQ_Iov5sKjD

EXPO_PUBLIC_SUPABASE_URL=https://rkfnimpgxmkmqxlkzxur.supabase.co
EXPO_PUBLIC_SUPABASE_KEY=sb_publishable_vl5anaPxMpOojIrGZcp6nQ_Iov5sKjD

# Frontend
FRONTEND_URL=http://localhost:3000
```

### `prisma.config.ts`

```typescript
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",

  // Top-level datasource - required for prisma db push (uses DIRECT_URL)
  datasource: {
    url: process.env.DIRECT_URL!,
  },

  // Migrations use DIRECT_URL (Session Pooler port 5432)
  migrate: {
    datasource: "db",
    datasourceUrl: process.env.DIRECT_URL,
  },

  // Runtime queries use DATABASE_URL (Transaction Pooler port 6543)
  db: {
    adapter: {
      provider: "postgresql",
      url: process.env.DATABASE_URL!,
    },
  },
});
```

## 🔑 Key Points

### 1. Connection Pooler Format

**Important**: Use `postgres.[PROJECT-REF]` format for pooler connections:
- ✅ `postgres.rkfnimpgxmkmqxlkzxur` (correct)
- ❌ `postgres` (incorrect for pooler)

### 2. Two Connection Types

- **DATABASE_URL** (port 6543): Transaction Pooler
  - Used by Prisma Client at runtime
  - Efficient for API queries
  - Supports connection pooling

- **DIRECT_URL** (port 5432): Session Pooler
  - Used by `prisma db push` and migrations
  - Works on Windows/IPv4 networks
  - Required for schema changes

### 3. Password Encoding

Always URL-encode passwords with spaces or special characters:
- `Muhammad pbuh1090` → `Muhammad%20pbuh1090`

### 4. Why This Works

- **Windows/IPv4 Compatibility**: Pooler connections work where direct connections fail
- **No P1001 Errors**: Session pooler (port 5432) works for migrations
- **Optimal Performance**: Transaction pooler (port 6543) for runtime queries
- **Prisma v7 Compatible**: Correct configuration for Prisma v7+

## ✅ Verification

Test the setup:

```bash
cd backend

# Generate Prisma Client
npx prisma generate

# Push schema to database
npx prisma db push
```

Expected output:
```
✔ Generated Prisma Client
✔ Your database is now in sync with your Prisma schema
```

## 🚀 Next Steps

1. ✅ Database connection working
2. ✅ Prisma schema synced
3. ⏭️ Enable PostGIS extension in Supabase
4. ⏭️ Import transit data (stops, routes)
5. ⏭️ Test API endpoints

## 📝 Notes

- Both connection strings use the same pooler host
- Only difference is the port (6543 vs 5432)
- Both use `pgbouncer=true` parameter
- Project reference (`rkfnimpgxmkmqxlkzxur`) is required in username

