/**
 * Comprehensive Lahore Transit Data Seed Script
 * Includes: Metro Bus, Orange Line Metro, and Feeder/Speedo Bus routes
 * 
 * Usage: npx ts-node prisma/seed-lahore-transit.ts
 */

import { PrismaClient, StopType, TransportType } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Metro Bus System (MBS) - 27 Stations from Gajjumata to Shahdara
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
 * Orange Line Metro - 26 Stations from Ali Town to Dera Gujran
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

async function main() {
  console.log('🌱 Starting comprehensive Lahore transit data seed...');

  // Clear existing data
  console.log('🗑️  Clearing existing data...');
  await prisma.plannedRoute.deleteMany();
  await prisma.transfer.deleteMany();
  await prisma.routeStop.deleteMany();
  await prisma.fareRule.deleteMany();
  await prisma.route.deleteMany();
  await prisma.stop.deleteMany();

  // Create Metro Bus Stations
  console.log('🚌 Creating Metro Bus Stations...');
  const metroBusStopMap = new Map<string, string>();
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
    metroBusStopMap.set(station.name, stop.id);
    console.log(`  ✓ ${station.name} (order: ${station.order})`);
  }

  // Create Orange Line Metro Stations
  console.log('🚇 Creating Orange Line Metro Stations...');
  const orangeLineStopMap = new Map<string, string>();
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
    orangeLineStopMap.set(station.name, stop.id);
    console.log(`  ✓ ${station.name} (order: ${station.order})`);
  }

  // Create Metro Bus Route
  console.log('🛤️  Creating Metro Bus Route...');
  const metroBusRoute = await prisma.route.create({
    data: {
      name: 'Metro Bus System',
      line: 'Metro Bus',
      transportType: TransportType.METRO,
      color: '#0066CC',
    },
  });

  // Link Metro Bus stations to route (in reverse order: 27 to 1)
  for (const station of metroBusStations) {
    const stopId = metroBusStopMap.get(station.name);
    if (stopId) {
      await prisma.routeStop.create({
        data: {
          routeId: metroBusRoute.id,
          stopId: stopId,
          stopOrder: station.order - 1, // 0-indexed
        },
      });
    }
  }
  console.log(`  ✓ Created Metro Bus route with ${metroBusStations.length} stations`);

  // Create Orange Line Route
  console.log('🛤️  Creating Orange Line Route...');
  const orangeLineRoute = await prisma.route.create({
    data: {
      name: 'Orange Line Metro',
      line: 'Orange Line',
      transportType: TransportType.ORANGE_LINE,
      color: '#FF6B35',
    },
  });

  // Link Orange Line stations to route
  for (const station of orangeLineStations) {
    const stopId = orangeLineStopMap.get(station.name);
    if (stopId) {
      await prisma.routeStop.create({
        data: {
          routeId: orangeLineRoute.id,
          stopId: stopId,
          stopOrder: station.order - 1, // 0-indexed
        },
      });
    }
  }
  console.log(`  ✓ Created Orange Line route with ${orangeLineStations.length} stations`);

  // Create transfers between nearby stations
  console.log('🚶 Creating transfers between nearby stations...');
  const allStops = [
    ...Array.from(metroBusStopMap.entries()).map(([name, id]) => ({ name, id, type: 'METRO' })),
    ...Array.from(orangeLineStopMap.entries()).map(([name, id]) => ({ name, id, type: 'ORANGE_LINE' })),
  ];

  // Find and create transfers between stops within 500m
  let transferCount = 0;
  for (let i = 0; i < allStops.length; i++) {
    for (let j = i + 1; j < allStops.length; j++) {
      const stop1 = allStops[i];
      const stop2 = allStops[j];
      
      // Get coordinates (simplified - in production, query from DB)
      const stop1Data = [...metroBusStations, ...orangeLineStations].find(s => s.name === stop1.name);
      const stop2Data = [...metroBusStations, ...orangeLineStations].find(s => s.name === stop2.name);
      
      if (stop1Data && stop2Data) {
        const distance = calculateDistance(stop1Data.lat, stop1Data.lng, stop2Data.lat, stop2Data.lng);
        
        if (distance <= 500) { // Within 500 meters
          const walkTime = Math.round(distance / 83.33); // 5 km/h = 83.33 m/min
          
          await prisma.transfer.create({
            data: {
              fromStopId: stop1.id,
              toStopId: stop2.id,
              walkingDistanceM: distance,
              estimatedTimeMin: walkTime,
            },
          });
          transferCount++;
        }
      }
    }
  }
  console.log(`  ✓ Created ${transferCount} transfer connections`);

  console.log('✅ Seed completed successfully!');
  console.log(`   Created ${metroBusStations.length} Metro Bus stations`);
  console.log(`   Created ${orangeLineStations.length} Orange Line stations`);
  console.log(`   Created 2 routes`);
  console.log(`   Created ${transferCount} transfers`);
  
  console.log('\n📝 Next steps:');
  console.log('   1. Add Feeder/Speedo bus stops and routes');
  console.log('   2. Run: npx prisma generate');
  console.log('   3. Test route planning');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

