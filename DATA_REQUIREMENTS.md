# Data Requirements for Apna Safar

This document outlines what transit data you need to provide to make the routing engine functional.

## Database Tables Overview

The backend expects data in these tables:

1. **stops** - Transport stop locations
2. **routes** - Transport routes (bus lines, metro lines)
3. **route_stops** - Which stops belong to which routes (with order)
4. **transfers** - Walking connections between stops (optional)
5. **fare_rules** - Pricing information (optional, for future)

## Required Data

### 1. Stops Data

**Table**: `stops`

**Required Fields**:
- `name` (string) - Stop name (e.g., "Thokar Niaz Baig")
- `latitude` (float) - Latitude coordinate
- `longitude` (float) - Longitude coordinate
- `type` (enum) - One of: `BUS`, `TRAIN`, `METRO`, `WALKING`

**Example**:
```json
{
  "name": "Thokar Niaz Baig",
  "latitude": 31.4697,
  "longitude": 74.2728,
  "type": "METRO"
}
```

**Sources**:
- Lahore Metro Orange Line stations
- Metro Bus stops
- Major bus stops
- Railway stations

### 2. Routes Data

**Table**: `routes`

**Required Fields**:
- `name` (string) - Route name (e.g., "Orange Line")
- `transportType` (enum) - One of: `BUS`, `TRAIN`, `METRO`
- `color` (string, optional) - Hex color for UI (e.g., "#FF6B35")

**Example**:
```json
{
  "name": "Orange Line",
  "transportType": "METRO",
  "color": "#FF6B35"
}
```

**Sources**:
- Orange Line Metro route
- Metro Bus routes
- Major bus routes

### 3. Route Stops Data

**Table**: `route_stops`

**Required Fields**:
- `routeId` (uuid) - Reference to route
- `stopId` (uuid) - Reference to stop
- `stopOrder` (integer) - Order of stop in route (0, 1, 2, ...)

**Important**: This defines the sequence of stops in each route. The order matters for routing.

**Example**:
```json
{
  "routeId": "route-uuid-here",
  "stopId": "stop-uuid-here",
  "stopOrder": 0
}
```

**Sources**:
- Route schedules
- Transit agency data
- GTFS data (if available)

### 4. Transfers Data (Optional but Recommended)

**Table**: `transfers`

**Required Fields**:
- `fromStopId` (uuid) - Starting stop
- `toStopId` (uuid) - Destination stop
- `walkingDistanceM` (float) - Distance in meters
- `estimatedTimeMin` (integer) - Walking time in minutes

**Purpose**: Defines walking connections between nearby stops (e.g., between metro station and bus stop).

**Example**:
```json
{
  "fromStopId": "stop-uuid-1",
  "toStopId": "stop-uuid-2",
  "walkingDistanceM": 250,
  "estimatedTimeMin": 3
}
```

## Data Import Methods

### Option 1: Prisma Seed Script

Create `backend/prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create stops
  const stop1 = await prisma.stop.create({
    data: {
      name: 'Thokar Niaz Baig',
      latitude: 31.4697,
      longitude: 74.2728,
      type: 'METRO',
    },
  });

  // Create route
  const route1 = await prisma.route.create({
    data: {
      name: 'Orange Line',
      transportType: 'METRO',
      color: '#FF6B35',
    },
  });

  // Link stops to route
  await prisma.routeStop.create({
    data: {
      routeId: route1.id,
      stopId: stop1.id,
      stopOrder: 0,
    },
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

Run with:
```bash
npx prisma db seed
```

### Option 2: CSV Import

1. Create CSV files:
   - `stops.csv`
   - `routes.csv`
   - `route_stops.csv`

2. Use a script to parse and import:
```typescript
import * as fs from 'fs';
import * as csv from 'csv-parser';
// Parse and import...
```

### Option 3: JSON Import

Create JSON files and import via Prisma:

```typescript
const stops = JSON.parse(fs.readFileSync('stops.json', 'utf-8'));
await prisma.stop.createMany({ data: stops });
```

### Option 4: Direct SQL

If you have SQL dumps or can write SQL directly:

```sql
INSERT INTO stops (name, latitude, longitude, type)
VALUES ('Thokar Niaz Baig', 31.4697, 74.2728, 'METRO');
```

## Data Sources for Lahore

### Orange Line Metro
- 26 stations from Dera Gujran to Ali Town
- Station names and coordinates available from LDA/Punjab Mass Transit Authority

### Metro Bus
- Multiple routes across Lahore
- Stop locations available from transit authority

### Bus Routes
- Major bus routes and stops
- Can be collected from transit agencies or field surveys

### GTFS Data (If Available)
- If Lahore transit agencies provide GTFS feeds, you can convert:
  - `stops.txt` → `stops` table
  - `routes.txt` → `routes` table
  - `stop_times.txt` → `route_stops` table

## Minimum Data for Testing

To test the routing engine, you need at least:

- **5-10 stops** (mix of metro, bus)
- **1-2 routes** (e.g., Orange Line)
- **Route-stop relationships** for those routes

This allows you to test:
- Nearest stop lookup
- Route planning between stops
- Multi-route transfers

## Data Quality Checklist

Before importing, ensure:

- [ ] All coordinates are valid (latitude: -90 to 90, longitude: -180 to 180)
- [ ] Stop names are consistent
- [ ] Route-stop orders are correct (no gaps, starts at 0)
- [ ] No duplicate stops (same name + coordinates)
- [ ] Transport types match (METRO stops for METRO routes)
- [ ] Transfer distances are reasonable (typically < 500m)

## Next Steps After Data Import

1. **Verify Data**: Use Prisma Studio to check imported data
2. **Test Nearest Stop**: Query `/stops/nearest` endpoint
3. **Test Route Planning**: Try planning routes between known stops
4. **Optimize**: Add indexes, optimize queries
5. **Add More Data**: Expand coverage as needed

## Questions?

If you need help with:
- Data format conversion
- Import script creation
- Data validation
- Coordinate system conversion

Please provide your data format and I can help create import scripts.

