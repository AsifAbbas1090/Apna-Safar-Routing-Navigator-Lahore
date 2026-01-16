# Apna Safar Backend

Scalable NestJS backend for public transport navigation system in Lahore.

## Tech Stack

- **Node.js 20**
- **NestJS 11** - Enterprise-grade framework
- **TypeScript** (strict mode)
- **Prisma ORM** - Type-safe database access
- **PostgreSQL** (Supabase) with PostGIS extension
- **Class Validator** - Request validation

## Architecture

Clean architecture with clear separation of concerns:

```
src/
├── prisma/          # Database service (Prisma client)
├── stops/           # Stops module (repository, service, controller)
├── routes/          # Routes module
├── routing/         # Routing engine (pathfinding algorithm)
└── app.module.ts    # Root module
```

### Design Principles

- **Repository Pattern**: All database access through repositories
- **Service Layer**: Business logic in services, not controllers
- **Dependency Injection**: Clean, testable code
- **SOLID Principles**: Scalable and maintainable

## Database Schema

### Core Tables

1. **stops** - Transport stop locations
2. **routes** - Transport routes (bus lines, metro lines)
3. **route_stops** - Junction table (routes ↔ stops with order)
4. **transfers** - Walking connections between stops
5. **fare_rules** - Pricing rules (future)

## Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

Create `.env` file (see `.env.example`):

```env
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.rkfnimpgxmkmqxlkzxur.supabase.co:5432/postgres"
PORT=3001
NODE_ENV=development
```

### 3. Enable PostGIS Extension

Connect to your Supabase database and run:

```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```

### 4. Run Prisma Migrations

```bash
# Generate Prisma Client
npx prisma generate

# Create and apply migrations
npx prisma migrate dev --name init

# Or push schema directly (for development)
npx prisma db push
```

### 5. Seed Database (Optional)

Create seed data for stops and routes:

```bash
npx prisma db seed
```

## Running the Application

### Development

```bash
npm run start:dev
```

Server runs on `http://localhost:3001`

### Production

```bash
npm run build
npm run start:prod
```

## API Endpoints

### Health Check

```
GET /health
```

### Route Planning

```
POST /route/plan
Content-Type: application/json

{
  "from": { "lat": 31.4697, "lng": 74.2728 },
  "to": { "lat": 31.5204, "lng": 74.3587 },
  "preference": "fastest"
}
```

Response:
```json
{
  "estimatedTime": 38,
  "transfers": 1,
  "steps": [
    {
      "type": "walk",
      "from": "Current Location",
      "to": "Thokar Station",
      "time": 5
    },
    {
      "type": "train",
      "from": "Thokar",
      "to": "GPO",
      "route": "Orange Line",
      "time": 25
    },
    {
      "type": "walk",
      "from": "GPO",
      "to": "Destination",
      "time": 8
    }
  ]
}
```

### Stops

```
GET /stops                    # Get all stops
GET /stops/:id                 # Get stop by ID
GET /stops/nearest?lat=31.52&lng=74.35&radius=1000  # Find nearest stops
```

### Routes

```
GET /routes                    # Get all routes
GET /routes/:id                # Get route by ID with stops
```

## Routing Algorithm

The routing engine uses **Dijkstra's algorithm** for pathfinding:

1. **Find nearest stops** to origin and destination
2. **Build graph** of stops and route connections
3. **Find shortest path** using Dijkstra's algorithm
4. **Convert path to steps** with walking segments

### Route Preferences

- `fastest` - Minimize total travel time
- `least-walking` - Minimize walking distance
- `least-transfers` - Minimize number of transfers

## Database Setup Checklist

Before running the backend, ensure:

- [ ] PostGIS extension is enabled in Supabase
- [ ] Database connection string is correct
- [ ] Prisma migrations are applied
- [ ] Stops and routes data is seeded (or imported)

## Next Steps

1. **Import Transit Data**: Add Lahore's stops and routes
2. **Optimize Routing**: Improve graph algorithm performance
3. **Add Real-time Data**: Integrate live transit schedules
4. **Caching**: Add Redis for route caching
5. **Authentication**: Add user authentication (Supabase Auth)

## Development Notes

- All database queries go through repositories
- Business logic stays in services
- Controllers only handle HTTP requests/responses
- Use Prisma migrations for schema changes
- PostGIS is used for efficient geo queries

## License

MIT


