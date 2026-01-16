/**
 * Complete Lahore Transit Data Seed Script
 * Includes: Metro Bus, Orange Line Metro, and Sample Feeder Routes
 * 
 * Usage: npx ts-node prisma/seed-complete.ts
 * 
 * Note: This is a comprehensive seed with sample data.
 * Add more feeder routes by extending the feederRoutes array.
 */

import { PrismaClient, StopType, TransportType } from '@prisma/client';

// Prisma will automatically read DATABASE_URL from environment
// Make sure .env file is in the backend/ directory
const prisma = new PrismaClient();

/**
 * Calculate distance between coordinates (Haversine formula)
 */
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000; // Earth radius in meters
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Metro Bus System (MBS) - 27 Stations
 * From Gajjumata (27) to Shahdara (1)
 */
const metroBusStations = [
  { name: 'Gajjumata', lat: 31.4697, lng: 74.2728, order: 27 },
  { name: 'Dullu Khurd', lat: 31.4720, lng: 74.2750, order: 26 },
  { name: 'Youhanabad', lat: 31.4740, lng: 74.2770, order: 25 },
  { name: 'Nishtar Colony', lat: 31.4760, lng: 74.2790, order: 24 },
  { name: 'Atari Saroba', lat: 31.4780, lng: 74.2810, order: 23 },
  { name: 'Kamahan', lat: 31.4800, lng: 74.2830, order: 22 },
  { name: 'Chungi Amar Sidhu', lat: 31.4820, lng: 74.2850, order: 21 },
  { name: 'Ghazi Chowk', lat: 31.4840, lng: 74.2870, order: 20 },
  { name: 'Qainchi', lat: 31.4860, lng: 74.2890, order: 19 },
  { name: 'Ittefaq Hospital', lat: 31.4880, lng: 74.2910, order: 18 },
  { name: 'Naseerabad', lat: 31.4900, lng: 74.2930, order: 17 },
  { name: 'Model Town', lat: 31.4920, lng: 74.2950, order: 16 },
  { name: 'Kalma Chowk', lat: 31.4940, lng: 74.2970, order: 15 },
  { name: 'Gaddafi Stadium', lat: 31.4960, lng: 74.2990, order: 14 },
  { name: 'Canal', lat: 31.4980, lng: 74.3010, order: 13 },
  { name: 'Ichhra', lat: 31.5000, lng: 74.3030, order: 12 },
  { name: 'Shama', lat: 31.5020, lng: 74.3050, order: 11 },
  { name: 'Qartaba Chowk', lat: 31.5040, lng: 74.3070, order: 10 },
  { name: 'Janazgah', lat: 31.5060, lng: 74.3090, order: 9 },
  { name: 'MAO College', lat: 31.5080, lng: 74.3110, order: 8 },
  { name: 'Civil Secretariat', lat: 31.5100, lng: 74.3130, order: 7 },
  { name: 'Katchehry', lat: 31.5120, lng: 74.3150, order: 6 },
  { name: 'Bhati Chowk', lat: 31.5140, lng: 74.3170, order: 5 },
  { name: 'Azadi Chowk', lat: 31.5160, lng: 74.3190, order: 4 },
  { name: 'Timber Market', lat: 31.5180, lng: 74.3210, order: 3 },
  { name: 'Niazi Chowk', lat: 31.5200, lng: 74.3230, order: 2 },
  { name: 'Shahdara', lat: 31.5220, lng: 74.3250, order: 1 },
];

/**
 * Orange Line Metro - 26 Stations
 * From Ali Town (1) to Dera Gujran (26)
 */
const orangeLineStations = [
  { name: 'Ali Town', lat: 31.5400, lng: 74.3800, order: 1 },
  { name: 'Thokar Niaz Baig', lat: 31.5350, lng: 74.3750, order: 2 },
  { name: 'Canal View', lat: 31.5300, lng: 74.3700, order: 3 },
  { name: 'Hanjarwal', lat: 31.5250, lng: 74.3650, order: 4 },
  { name: 'Wahdat Road', lat: 31.5200, lng: 74.3600, order: 5 },
  { name: 'Awan Town', lat: 31.5150, lng: 74.3550, order: 6 },
  { name: 'Sabzazar', lat: 31.5100, lng: 74.3500, order: 7 },
  { name: 'Shahnoor', lat: 31.5050, lng: 74.3450, order: 8 },
  { name: 'Salahudin Road', lat: 31.5000, lng: 74.3400, order: 9 },
  { name: 'Band Road', lat: 31.4950, lng: 74.3350, order: 10 },
  { name: 'Samanabad', lat: 31.4900, lng: 74.3300, order: 11 },
  { name: 'Gulshan-e-Ravi', lat: 31.4850, lng: 74.3250, order: 12 },
  { name: 'Chauburji', lat: 31.4800, lng: 74.3200, order: 13 },
  { name: 'Anarkali', lat: 31.4750, lng: 74.3150, order: 14 },
  { name: 'GPO', lat: 31.4700, lng: 74.3100, order: 15 },
  { name: 'Lakshmi', lat: 31.4650, lng: 74.3050, order: 16 },
  { name: 'Railway Station', lat: 31.4600, lng: 74.3000, order: 17 },
  { name: 'Sultanpura', lat: 31.4550, lng: 74.2950, order: 18 },
  { name: 'UET', lat: 31.4500, lng: 74.2900, order: 19 },
  { name: 'Baghbanpura', lat: 31.4450, lng: 74.2850, order: 20 },
  { name: 'Shalamar Gardens', lat: 31.4400, lng: 74.2800, order: 21 },
  { name: 'Pakistan Mint', lat: 31.4350, lng: 74.2750, order: 22 },
  { name: 'Mahmood Booti', lat: 31.4300, lng: 74.2700, order: 23 },
  { name: 'Salamatpura', lat: 31.4250, lng: 74.2650, order: 24 },
  { name: 'Islam Park', lat: 31.4200, lng: 74.2600, order: 25 },
  { name: 'Dera Gujran', lat: 31.4150, lng: 74.2550, order: 26 },
];

/**
 * Sample Feeder Routes (Add more as needed)
 * Format: { routeCode, routeName, stops: [{ name, lat, lng }] }
 */
const sampleFeederRoutes = [
  {
    routeCode: 'FRT01',
    routeName: 'Railway Station to Bhatti Chowk',
    transportType: TransportType.FEEDER,
    busType: 'Standard Bus',
    stops: [
      { name: 'Railway Station', lat: 31.4600, lng: 74.3000 },
      { name: 'Ek Moriya', lat: 31.4620, lng: 74.3020 },
      { name: 'Nawaz Sharif Hospital', lat: 31.4640, lng: 74.3040 },
      { name: 'Kashmiri Gate', lat: 31.4660, lng: 74.3060 },
      { name: 'Lari Adda', lat: 31.4680, lng: 74.3080 },
      { name: 'Azadi Chowk', lat: 31.4700, lng: 74.3100 },
      { name: 'Texali Chowk', lat: 31.4720, lng: 74.3120 },
      { name: 'Bhatti Chowk', lat: 31.4740, lng: 74.3140 },
    ],
  },
  {
    routeCode: 'FRT10',
    routeName: 'Multan Chungi to Qartaba Chowk',
    transportType: TransportType.FEEDER,
    busType: 'Standard Bus',
    stops: [
      { name: 'Multan Chungi', lat: 31.4800, lng: 74.2800 },
      { name: 'Mustafa Town', lat: 31.4820, lng: 74.2850 },
      { name: 'Karim Block Market', lat: 31.4840, lng: 74.2900 },
      { name: 'PU Examination Center', lat: 31.4860, lng: 74.2950 },
      { name: 'Bhekewal Morr', lat: 31.4880, lng: 74.3000 },
      { name: 'Wahdat Colony', lat: 31.4900, lng: 74.3050 },
      { name: 'Naqsha Stop', lat: 31.4920, lng: 74.3100 },
      { name: 'Canal', lat: 31.4940, lng: 74.3150 },
      { name: 'Ichra', lat: 31.4960, lng: 74.3200 },
      { name: 'Shama', lat: 31.4980, lng: 74.3250 },
      { name: 'Qartaba Chowk', lat: 31.5000, lng: 74.3300 },
    ],
  },
  // Add more feeder routes here following the same format
];

async function main() {
  console.log('🌱 Starting comprehensive Lahore transit data seed...');
  console.log('   This will create Metro Bus, Orange Line, and sample Feeder routes\n');

  // Clear existing data
  console.log('🗑️  Clearing existing data...');
  await prisma.plannedRoute.deleteMany();
  await prisma.transfer.deleteMany();
  await prisma.routeStop.deleteMany();
  await prisma.fareRule.deleteMany();
  await prisma.route.deleteMany();
  await prisma.stop.deleteMany();

  const allStopMap = new Map<string, { id: string; lat: number; lng: number }>();

  // 1. Create Metro Bus Stations
  console.log('🚌 Creating Metro Bus Stations (27 stations)...');
  for (const station of metroBusStations) {
    const stop = await prisma.stop.create({
      data: {
        name: station.name,
        line: 'Metro Bus',
        latitude: station.lat,
        longitude: station.lng,
        type: StopType.METRO,
        isStation: true,
      },
    });
    allStopMap.set(station.name, { id: stop.id, lat: station.lat, lng: station.lng });
  }
  console.log(`   ✓ Created ${metroBusStations.length} Metro Bus stations\n`);

  // 2. Create Orange Line Stations
  console.log('🚇 Creating Orange Line Metro Stations (26 stations)...');
  for (const station of orangeLineStations) {
    const stop = await prisma.stop.create({
      data: {
        name: station.name,
        line: 'Orange Line',
        latitude: station.lat,
        longitude: station.lng,
        type: StopType.ORANGE_LINE,
        isStation: true,
      },
    });
    allStopMap.set(station.name, { id: stop.id, lat: station.lat, lng: station.lng });
  }
  console.log(`   ✓ Created ${orangeLineStations.length} Orange Line stations\n`);

  // 3. Create Feeder Routes and Stops
  console.log(`🚌 Creating Feeder Routes (${sampleFeederRoutes.length} sample routes)...`);
  let totalFeederStops = 0;
  const createdFeederRoutes: any[] = [];

  for (const routeData of sampleFeederRoutes) {
    // Create route
    const route = await prisma.route.create({
      data: {
        name: routeData.routeName,
        line: routeData.routeCode,
        transportType: routeData.transportType,
        color: '#6B8E23', // Olive green for feeder
      },
    });
    createdFeederRoutes.push(route as any);

    // Create stops for this route
    const routeStopIds: string[] = [];
    for (let i = 0; i < routeData.stops.length; i++) {
      const stopData = routeData.stops[i];
      let stopId = allStopMap.get(stopData.name)?.id;

      // Create stop if it doesn't exist
      if (!stopId) {
        const stop = await prisma.stop.create({
          data: {
            name: stopData.name,
            line: routeData.routeCode,
            latitude: stopData.lat,
            longitude: stopData.lng,
            type: StopType.FEEDER,
            isStation: false,
          },
        });
        stopId = stop.id;
        allStopMap.set(stopData.name, { id: stop.id, lat: stopData.lat, lng: stopData.lng });
        totalFeederStops++;
      }

      routeStopIds.push(stopId);

      // Link stop to route
      await prisma.routeStop.create({
        data: {
          routeId: route.id,
          stopId: stopId,
          stopOrder: i,
        },
      });
    }

    console.log(`   ✓ Created route: ${routeData.routeName} (${routeData.stops.length} stops)`);
  }
  console.log(`   ✓ Created ${totalFeederStops} new Feeder stops\n`);

  // 4. Create Metro Bus Route
  console.log('🛤️  Creating Metro Bus Route...');
  const metroBusRoute = await prisma.route.create({
    data: {
      name: 'Metro Bus System',
      line: 'Metro Bus',
      transportType: TransportType.METRO,
      color: '#0066CC',
    },
  });

  for (const station of metroBusStations) {
    const stopId = allStopMap.get(station.name)?.id;
    if (stopId) {
      await prisma.routeStop.create({
        data: {
          routeId: metroBusRoute.id,
          stopId: stopId,
          stopOrder: station.order - 1,
        },
      });
    }
  }
  console.log(`   ✓ Created Metro Bus route with ${metroBusStations.length} stations\n`);

  // 5. Create Orange Line Route
  console.log('🛤️  Creating Orange Line Route...');
  const orangeLineRoute = await prisma.route.create({
    data: {
      name: 'Orange Line Metro',
      line: 'Orange Line',
      transportType: TransportType.ORANGE_LINE,
      color: '#FF6B35',
    },
  });

  for (const station of orangeLineStations) {
    const stopId = allStopMap.get(station.name)?.id;
    if (stopId) {
      await prisma.routeStop.create({
        data: {
          routeId: orangeLineRoute.id,
          stopId: stopId,
          stopOrder: station.order - 1,
        },
      });
    }
  }
  console.log(`   ✓ Created Orange Line route with ${orangeLineStations.length} stations\n`);

  // 6. Create transfers between nearby stops (within 500m)
  console.log('🚶 Creating transfer connections...');
  const allStops = Array.from(allStopMap.entries());
  let transferCount = 0;

  for (let i = 0; i < allStops.length; i++) {
    for (let j = i + 1; j < allStops.length; j++) {
      const [name1, data1] = allStops[i];
      const [name2, data2] = allStops[j];

      const distance = calculateDistance(data1.lat, data1.lng, data2.lat, data2.lng);

      if (distance <= 500) {
        // Check if transfer already exists
        const existing = await prisma.transfer.findFirst({
          where: {
            OR: [
              { fromStopId: data1.id, toStopId: data2.id },
              { fromStopId: data2.id, toStopId: data1.id },
            ],
          },
        });

        if (!existing) {
          const walkTime = Math.round(distance / 83.33); // 5 km/h = 83.33 m/min
          await prisma.transfer.create({
            data: {
              fromStopId: data1.id,
              toStopId: data2.id,
              walkingDistanceM: distance,
              estimatedTimeMin: walkTime,
            },
          });
          transferCount++;
        }
      }
    }
  }
  console.log(`   ✓ Created ${transferCount} transfer connections\n`);

  // Summary
  console.log('✅ Seed completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   • Metro Bus: ${metroBusStations.length} stations`);
  console.log(`   • Orange Line: ${orangeLineStations.length} stations`);
  console.log(`   • Feeder Routes: ${sampleFeederRoutes.length} routes`);
  console.log(`   • Feeder Stops: ${totalFeederStops} new stops`);
  console.log(`   • Total Routes: ${2 + sampleFeederRoutes.length}`);
  console.log(`   • Total Transfers: ${transferCount}`);
  console.log('\n📝 Next Steps:');
  console.log('   1. Add more feeder routes to sampleFeederRoutes array');
  console.log('   2. Run: npx prisma generate');
  console.log('   3. Test route planning with real locations');
  console.log('   4. Verify AI navigation instructions work correctly');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

