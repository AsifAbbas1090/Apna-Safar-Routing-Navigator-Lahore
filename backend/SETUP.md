# Backend Setup Guide

## Prerequisites

- Node.js 20+
- PostgreSQL database (Supabase)
- npm or yarn

## Step-by-Step Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Database Configuration

#### Enable PostGIS Extension

Connect to your Supabase database via SQL Editor and run:

```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```

This enables geographic queries for finding nearest stops.

#### Configure Connection

Create `.env` file in the `backend/` directory with your database credentials:

```env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.rkfnimpgxmkmqxlkzxur.supabase.co:5432/postgres"
PORT=3001
NODE_ENV=development
```

**Important Notes**:
- The `.env` file must be in `backend/` root (not parent folder)
- Prisma v7+ reads `DATABASE_URL` from `.env` via `prisma.config.ts`
- The password in the connection string should be URL-encoded if it contains special characters
- Copy `.env.example` to `.env` and update the values

### 3. Database Migration

**Important**: Ensure `.env` file exists in `backend/` directory before running Prisma commands.

Generate Prisma Client and apply schema:

```bash
# Generate Prisma Client (reads DATABASE_URL from .env via prisma.config.ts)
npx prisma generate

# Push schema to database (creates tables)
npx prisma db push
```

Or use migrations for production:

```bash
npx prisma migrate dev --name init
```

**Prisma v7+ Note**: 
- Database connection is configured in `prisma.config.ts`, not in `schema.prisma`
- The `DATABASE_URL` is read from your `.env` file
- Two connection points are needed:
  - `migrate.datasourceUrl` → For `prisma db push` and migrations
  - `db.adapter.url` → For Prisma Client at runtime
- Both use the same `DATABASE_URL` from `.env` (no duplication)

### 4. Verify Database Schema

Check that tables are created:

```bash
npx prisma studio
```

This opens a GUI to view your database. You should see:
- `stops`
- `routes`
- `route_stops`
- `transfers`
- `fare_rules`

### 5. Start Development Server

```bash
npm run start:dev
```

Server should start on `http://localhost:3001`

### 6. Test API

```bash
# Health check
curl http://localhost:3001/health

# Route planning (example)
curl -X POST http://localhost:3001/route/plan \
  -H "Content-Type: application/json" \
  -d '{
    "from": { "lat": 31.4697, "lng": 74.2728 },
    "to": { "lat": 31.5204, "lng": 74.3587 },
    "preference": "fastest"
  }'
```

## Database Data Requirements

Before the routing engine can work, you need to populate:

1. **Stops** - Transport stop locations (bus stops, metro stations)
2. **Routes** - Transport routes (Orange Line, Metro Bus lines, etc.)
3. **Route Stops** - Which stops belong to which routes and in what order
4. **Transfers** - Walking connections between nearby stops

### Example Data Structure

**Stop:**
```json
{
  "name": "Thokar Niaz Baig",
  "latitude": 31.4697,
  "longitude": 74.2728,
  "type": "METRO"
}
```

**Route:**
```json
{
  "name": "Orange Line",
  "transportType": "METRO",
  "color": "#FF6B35"
}
```

**Route Stop:**
```json
{
  "routeId": "route-uuid",
  "stopId": "stop-uuid",
  "stopOrder": 0
}
```

## Troubleshooting

### PostGIS Not Found

If you get PostGIS errors:
1. Ensure PostGIS extension is enabled in Supabase
2. Check database connection string
3. Verify you have admin access to the database

### Connection Issues

- Verify database URL is correct
- Check if password needs URL encoding
- Ensure database is accessible from your network

### Prisma Client Not Generated

```bash
npx prisma generate
```

### Schema Sync Issues

```bash
npx prisma db push --force-reset  # WARNING: Deletes all data
```

## Next Steps

1. Import Lahore transit data (stops, routes)
2. Test route planning with real coordinates
3. Optimize routing algorithm performance
4. Add caching layer (Redis)

## Production Deployment

1. Set `NODE_ENV=production`
2. Use migrations instead of `db push`
3. Set up proper environment variables
4. Enable CORS for your frontend domain
5. Add rate limiting
6. Set up monitoring and logging

