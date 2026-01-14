/**
 * Prisma Seed Script
 * Imports transit data for Lahore (stops, routes, route_stops)
 * 
 * Usage:
 *   npx prisma db seed
 * 
 * Or run directly:
 *   npx ts-node prisma/seed.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Sample Lahore transit data
 * Replace with actual data from transit authorities
 */
const sampleStops = [
  // Orange Line Metro Stations
  { name: 'Dera Gujran', latitude: 31.4697, longitude: 74.2728, type: 'METRO', line: 'Orange Line', isStation: true },
  { name: 'Thokar Niaz Baig', latitude: 31.4750, longitude: 74.2800, type: 'METRO', line: 'Orange Line', isStation: true },
  { name: 'Canal', latitude: 31.4800, longitude: 74.2900, type: 'METRO', line: 'Orange Line', isStation: true },
  { name: 'GPO', latitude: 31.5204, longitude: 74.3587, type: 'METRO', line: 'Orange Line', isStation: true },
  { name: 'Lakshmi Chowk', latitude: 31.5300, longitude: 74.3700, type: 'METRO', line: 'Orange Line', isStation: true },
  { name: 'Ali Town', latitude: 31.5400, longitude: 74.3800, type: 'METRO', line: 'Orange Line', isStation: true },
  
  // Metro Bus Stops
  { name: 'Kalma Chowk', latitude: 31.4900, longitude: 74.3000, type: 'BUS', line: 'Metro Bus', isStation: false },
  { name: 'Johar Town', latitude: 31.5000, longitude: 74.3200, type: 'BUS', line: 'Metro Bus', isStation: false },
  { name: 'PUCIT', latitude: 31.5100, longitude: 74.3400, type: 'BUS', line: 'Metro Bus', isStation: false },
  
  // Bus Stops
  { name: 'Thokar Bus Stop', latitude: 31.4760, longitude: 74.2810, type: 'BUS', line: null, isStation: false },
  { name: 'GPO Bus Stop', latitude: 31.5210, longitude: 74.3590, type: 'BUS', line: null, isStation: false },
];

const sampleRoutes = [
  { name: 'Orange Line', line: 'Orange Line', transportType: 'METRO', color: '#FF6B35' },
  { name: 'Metro Bus Route 1', line: 'Metro Bus', transportType: 'BUS', color: '#0066CC' },
  { name: 'Local Bus Route 1', line: null, transportType: 'BUS', color: '#6B8E23' },
];

async function main() {
  console.log('🌱 Starting seed...');

  // Clear existing data (optional - comment out if you want to keep existing data)
  console.log('🗑️  Clearing existing data...');
  await prisma.plannedRoute.deleteMany();
  await prisma.transfer.deleteMany();
  await prisma.routeStop.deleteMany();
  await prisma.fareRule.deleteMany();
  await prisma.route.deleteMany();
  await prisma.stop.deleteMany();

  // Create stops
  console.log('📍 Creating stops...');
  const createdStops: Array<{ id: string; name: string; line: string | null; [key: string]: any }> = [];
  for (const stopData of sampleStops) {
    const stop = await prisma.stop.create({
      data: {
        name: stopData.name,
        line: stopData.line,
        latitude: stopData.latitude,
        longitude: stopData.longitude,
        type: stopData.type as any,
        isStation: stopData.isStation,
        // Location will be auto-populated by trigger if PostGIS is enabled
      },
    });
    createdStops.push(stop);
    console.log(`  ✓ Created stop: ${stop.name}`);
  }

  // Create routes
  console.log('🛤️  Creating routes...');
  const createdRoutes: Array<{ id: string; name: string; line: string | null; [key: string]: any }> = [];
  for (const routeData of sampleRoutes) {
    const route = await prisma.route.create({
      data: {
        name: routeData.name,
        line: routeData.line,
        transportType: routeData.transportType as any,
        color: routeData.color,
      },
    });
    createdRoutes.push(route);
    console.log(`  ✓ Created route: ${route.name}`);
  }

  // Create route stops (Orange Line example)
  console.log('🔗 Linking stops to routes...');
  const orangeLine = createdRoutes.find(r => r.name === 'Orange Line');
  const orangeLineStops = createdStops.filter(s => s.line === 'Orange Line');
  
  if (orangeLine && orangeLineStops.length > 0) {
    for (let i = 0; i < orangeLineStops.length; i++) {
      await prisma.routeStop.create({
        data: {
          routeId: orangeLine.id,
          stopId: orangeLineStops[i].id,
          stopOrder: i,
        },
      });
      console.log(`  ✓ Linked ${orangeLineStops[i].name} to Orange Line (order: ${i})`);
    }
  }

  // Create transfers (walking connections between nearby stops)
  console.log('🚶 Creating transfers...');
  // Example: Transfer from Thokar Metro to Thokar Bus Stop
  const thokarMetro = createdStops.find(s => s.name === 'Thokar Niaz Baig');
  const thokarBus = createdStops.find(s => s.name === 'Thokar Bus Stop');
  
  if (thokarMetro && thokarBus) {
    // Calculate distance (simplified - in production use PostGIS)
    const distance = calculateDistance(
      thokarMetro.latitude,
      thokarMetro.longitude,
      thokarBus.latitude,
      thokarBus.longitude,
    );
    const walkTime = Math.round(distance / 83.33); // 5 km/h = 83.33 m/min

    await prisma.transfer.create({
      data: {
        fromStopId: thokarMetro.id,
        toStopId: thokarBus.id,
        walkingDistanceM: distance,
        estimatedTimeMin: walkTime,
      },
    });
    console.log(`  ✓ Created transfer: ${thokarMetro.name} → ${thokarBus.name} (${Math.round(distance)}m, ${walkTime}min)`);
  }

  console.log('✅ Seed completed successfully!');
  console.log(`   Created ${createdStops.length} stops`);
  console.log(`   Created ${createdRoutes.length} routes`);
}

/**
 * Calculate distance between two coordinates (Haversine formula)
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

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

