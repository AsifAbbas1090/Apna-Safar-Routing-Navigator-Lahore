# Apna Safar - Public Transport Navigation System

A full-stack SaaS MVP for navigating Lahore's public transport system.

## Project Structure

```
.
├── frontend/          # Next.js 14 frontend
│   ├── app/          # App Router pages
│   ├── components/   # React components
│   ├── store/        # Zustand state management
│   └── lib/          # Utilities and mock data
│
└── backend/          # NestJS backend
    ├── src/
    │   ├── prisma/   # Database service
    │   ├── stops/    # Stops module
    │   ├── routes/   # Routes module
    │   └── routing/  # Routing engine
    └── prisma/       # Database schema
```

## Tech Stack

### Frontend
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- Zustand
- Mapbox GL JS
- React Hook Form + Zod
- Framer Motion

### Backend
- NestJS 11
- TypeScript (strict)
- Prisma ORM
- PostgreSQL (Supabase) with PostGIS
- Class Validator

## Quick Start

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:3000`

### Backend

```bash
cd backend
npm install

# Configure .env with database URL
# Enable PostGIS extension in Supabase

npx prisma generate
npx prisma db push

npm run start:dev
```

Backend runs on `http://localhost:3001`

See `backend/SETUP.md` for detailed setup instructions.

## Database Setup

### Required: Enable PostGIS

Connect to Supabase SQL Editor and run:

```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```

### Database Schema

The backend uses these tables:
- `stops` - Transport stop locations
- `routes` - Transport routes
- `route_stops` - Route-stop relationships
- `transfers` - Walking connections
- `fare_rules` - Pricing (future)

## What You Need to Provide

### 1. Transit Data

To make the routing engine work, you need to import:

1. **Stops Data** (CSV/JSON)
   - Stop names
   - Coordinates (latitude, longitude)
   - Stop types (BUS, TRAIN, METRO)

2. **Routes Data**
   - Route names
   - Transport types
   - Colors (for UI)

3. **Route-Stop Relationships**
   - Which stops belong to which routes
   - Stop order in each route

4. **Transfers Data** (optional)
   - Walking connections between nearby stops
   - Walking distances and times

### 2. Data Import Scripts

You can create scripts to import this data:

```typescript
// Example: backend/prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Import stops
  // Import routes
  // Import route stops
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

## API Endpoints

### Health Check
```
GET /health
```

### Route Planning
```
POST /route/plan
{
  "from": { "lat": 31.4697, "lng": 74.2728 },
  "to": { "lat": 31.5204, "lng": 74.3587 },
  "preference": "fastest"
}
```

### Stops
```
GET /stops
GET /stops/:id
GET /stops/nearest?lat=31.52&lng=74.35&radius=1000
```

### Routes
```
GET /routes
GET /routes/:id
```

## Features

### Frontend
- ✅ Landing page
- ✅ Route planner with map
- ✅ Live navigation
- ✅ Saved routes
- ✅ Dashboard
- ✅ Pricing page
- ✅ Login page

### Backend
- ✅ Clean architecture (Repository Pattern)
- ✅ Graph-based routing engine (Dijkstra's algorithm)
- ✅ PostGIS geo queries
- ✅ REST API
- ✅ Request validation
- ✅ CORS enabled

## Next Steps

1. **Import Transit Data**: Add Lahore's stops and routes to database
2. **Connect Frontend to Backend**: Update API calls in frontend
3. **Test Route Planning**: Verify routing with real coordinates
4. **Optimize Performance**: Add caching, optimize queries
5. **Add Real-time Data**: Integrate live transit schedules
6. **Authentication**: Add user authentication (Supabase Auth)

## Documentation

- Frontend: `frontend/README.md`
- Backend: `backend/README.md`
- Backend Setup: `backend/SETUP.md`

## License

MIT
