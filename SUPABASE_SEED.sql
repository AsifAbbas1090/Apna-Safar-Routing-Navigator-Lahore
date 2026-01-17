-- ============================================
-- Apna Safar Database Seed Script for Supabase
-- Run this in Supabase SQL Editor
-- Safe to run multiple times - clears old data first
-- ============================================
-- 
-- This script will:
-- 1. Clear existing route data (route_stops, routes, stops)
-- 2. Insert Metro Bus (27 stations)
-- 3. Insert Orange Line (26 stations)
-- 4. Insert Feeder Bus (2 sample routes)
-- 5. Link all stops to routes
-- ============================================

-- Clear existing data first to avoid duplicates
DELETE FROM route_stops;
DELETE FROM routes;
DELETE FROM stops;

-- Ensure PostGIS extension is enabled (if not already)
CREATE EXTENSION IF NOT EXISTS postgis;

-- Ensure location column exists
ALTER TABLE stops 
ADD COLUMN IF NOT EXISTS location geography(Point, 4326);

-- Create spatial index for efficient geo queries
CREATE INDEX IF NOT EXISTS stops_location_idx ON stops USING GIST (location);

-- Create/update trigger to auto-populate location from lat/lng
CREATE OR REPLACE FUNCTION update_stop_location()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
    NEW.location = ST_SetSRID(
      ST_MakePoint(NEW.longitude, NEW.latitude),
      4326
    )::geography;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_stop_location ON stops;
CREATE TRIGGER trigger_update_stop_location
  BEFORE INSERT OR UPDATE ON stops
  FOR EACH ROW
  EXECUTE FUNCTION update_stop_location();

-- Step 1: Insert Metro Bus Stations (27 stations from Gajjumata to Shahdara)
INSERT INTO stops (id, name, line, latitude, longitude, type, "isStation", "createdAt", "updatedAt")
VALUES 
  (gen_random_uuid(), 'Gajjumata', 'Metro Bus', 31.4697, 74.2728, 'METRO', true, NOW(), NOW()),
  (gen_random_uuid(), 'Dullu Khurd', 'Metro Bus', 31.4720, 74.2750, 'METRO', true, NOW(), NOW()),
  (gen_random_uuid(), 'Youhanabad', 'Metro Bus', 31.4740, 74.2770, 'METRO', true, NOW(), NOW()),
  (gen_random_uuid(), 'Nishtar Colony', 'Metro Bus', 31.4760, 74.2790, 'METRO', true, NOW(), NOW()),
  (gen_random_uuid(), 'Atari Saroba', 'Metro Bus', 31.4780, 74.2810, 'METRO', true, NOW(), NOW()),
  (gen_random_uuid(), 'Kamahan', 'Metro Bus', 31.4800, 74.2830, 'METRO', true, NOW(), NOW()),
  (gen_random_uuid(), 'Chungi Amar Sidhu', 'Metro Bus', 31.4820, 74.2850, 'METRO', true, NOW(), NOW()),
  (gen_random_uuid(), 'Ghazi Chowk', 'Metro Bus', 31.4840, 74.2870, 'METRO', true, NOW(), NOW()),
  (gen_random_uuid(), 'Qainchi', 'Metro Bus', 31.4860, 74.2890, 'METRO', true, NOW(), NOW()),
  (gen_random_uuid(), 'Ittefaq Hospital', 'Metro Bus', 31.4880, 74.2910, 'METRO', true, NOW(), NOW()),
  (gen_random_uuid(), 'Naseerabad', 'Metro Bus', 31.4900, 74.2930, 'METRO', true, NOW(), NOW()),
  (gen_random_uuid(), 'Model Town', 'Metro Bus', 31.4920, 74.2950, 'METRO', true, NOW(), NOW()),
  (gen_random_uuid(), 'Kalma Chowk', 'Metro Bus', 31.4940, 74.2970, 'METRO', true, NOW(), NOW()),
  (gen_random_uuid(), 'Gaddafi Stadium', 'Metro Bus', 31.4960, 74.2990, 'METRO', true, NOW(), NOW()),
  (gen_random_uuid(), 'Canal', 'Metro Bus', 31.4980, 74.3010, 'METRO', true, NOW(), NOW()),
  (gen_random_uuid(), 'Ichhra', 'Metro Bus', 31.5000, 74.3030, 'METRO', true, NOW(), NOW()),
  (gen_random_uuid(), 'Shama', 'Metro Bus', 31.5020, 74.3050, 'METRO', true, NOW(), NOW()),
  (gen_random_uuid(), 'Qartaba Chowk', 'Metro Bus', 31.5040, 74.3070, 'METRO', true, NOW(), NOW()),
  (gen_random_uuid(), 'Janazgah', 'Metro Bus', 31.5060, 74.3090, 'METRO', true, NOW(), NOW()),
  (gen_random_uuid(), 'MAO College', 'Metro Bus', 31.5080, 74.3110, 'METRO', true, NOW(), NOW()),
  (gen_random_uuid(), 'Civil Secretariat', 'Metro Bus', 31.5100, 74.3130, 'METRO', true, NOW(), NOW()),
  (gen_random_uuid(), 'Katchehry', 'Metro Bus', 31.5120, 74.3150, 'METRO', true, NOW(), NOW()),
  (gen_random_uuid(), 'Bhati Chowk', 'Metro Bus', 31.5140, 74.3170, 'METRO', true, NOW(), NOW()),
  (gen_random_uuid(), 'Azadi Chowk', 'Metro Bus', 31.5160, 74.3190, 'METRO', true, NOW(), NOW()),
  (gen_random_uuid(), 'Timber Market', 'Metro Bus', 31.5180, 74.3210, 'METRO', true, NOW(), NOW()),
  (gen_random_uuid(), 'Niazi Chowk', 'Metro Bus', 31.5200, 74.3230, 'METRO', true, NOW(), NOW()),
  (gen_random_uuid(), 'Shahdara', 'Metro Bus', 31.5220, 74.3250, 'METRO', true, NOW(), NOW());

-- Step 2: Insert Orange Line Metro Stations (26 stations from Ali Town to Dera Gujran)
INSERT INTO stops (id, name, line, latitude, longitude, type, "isStation", "createdAt", "updatedAt")
VALUES 
  (gen_random_uuid(), 'Ali Town', 'Orange Line', 31.5400, 74.3800, 'ORANGE_LINE', true, NOW(), NOW()),
  (gen_random_uuid(), 'Thokar Niaz Baig', 'Orange Line', 31.5350, 74.3750, 'ORANGE_LINE', true, NOW(), NOW()),
  (gen_random_uuid(), 'Canal View', 'Orange Line', 31.5300, 74.3700, 'ORANGE_LINE', true, NOW(), NOW()),
  (gen_random_uuid(), 'Hanjarwal', 'Orange Line', 31.5250, 74.3650, 'ORANGE_LINE', true, NOW(), NOW()),
  (gen_random_uuid(), 'Wahdat Road', 'Orange Line', 31.5200, 74.3600, 'ORANGE_LINE', true, NOW(), NOW()),
  (gen_random_uuid(), 'Awan Town', 'Orange Line', 31.5150, 74.3550, 'ORANGE_LINE', true, NOW(), NOW()),
  (gen_random_uuid(), 'Sabzazar', 'Orange Line', 31.5100, 74.3500, 'ORANGE_LINE', true, NOW(), NOW()),
  (gen_random_uuid(), 'Shahnoor', 'Orange Line', 31.5050, 74.3450, 'ORANGE_LINE', true, NOW(), NOW()),
  (gen_random_uuid(), 'Salahudin Road', 'Orange Line', 31.5000, 74.3400, 'ORANGE_LINE', true, NOW(), NOW()),
  (gen_random_uuid(), 'Band Road', 'Orange Line', 31.4950, 74.3350, 'ORANGE_LINE', true, NOW(), NOW()),
  (gen_random_uuid(), 'Samanabad', 'Orange Line', 31.4900, 74.3300, 'ORANGE_LINE', true, NOW(), NOW()),
  (gen_random_uuid(), 'Gulshan-e-Ravi', 'Orange Line', 31.4850, 74.3250, 'ORANGE_LINE', true, NOW(), NOW()),
  (gen_random_uuid(), 'Chauburji', 'Orange Line', 31.4800, 74.3200, 'ORANGE_LINE', true, NOW(), NOW()),
  (gen_random_uuid(), 'Anarkali', 'Orange Line', 31.4750, 74.3150, 'ORANGE_LINE', true, NOW(), NOW()),
  (gen_random_uuid(), 'GPO', 'Orange Line', 31.4700, 74.3100, 'ORANGE_LINE', true, NOW(), NOW()),
  (gen_random_uuid(), 'Lakshmi', 'Orange Line', 31.4650, 74.3050, 'ORANGE_LINE', true, NOW(), NOW()),
  (gen_random_uuid(), 'Railway Station', 'Orange Line', 31.4600, 74.3000, 'ORANGE_LINE', true, NOW(), NOW()),
  (gen_random_uuid(), 'Sultanpura', 'Orange Line', 31.4550, 74.2950, 'ORANGE_LINE', true, NOW(), NOW()),
  (gen_random_uuid(), 'UET', 'Orange Line', 31.4500, 74.2900, 'ORANGE_LINE', true, NOW(), NOW()),
  (gen_random_uuid(), 'Baghbanpura', 'Orange Line', 31.4450, 74.2850, 'ORANGE_LINE', true, NOW(), NOW()),
  (gen_random_uuid(), 'Shalamar Gardens', 'Orange Line', 31.4400, 74.2800, 'ORANGE_LINE', true, NOW(), NOW()),
  (gen_random_uuid(), 'Pakistan Mint', 'Orange Line', 31.4350, 74.2750, 'ORANGE_LINE', true, NOW(), NOW()),
  (gen_random_uuid(), 'Mahmood Booti', 'Orange Line', 31.4300, 74.2700, 'ORANGE_LINE', true, NOW(), NOW()),
  (gen_random_uuid(), 'Salamatpura', 'Orange Line', 31.4250, 74.2650, 'ORANGE_LINE', true, NOW(), NOW()),
  (gen_random_uuid(), 'Islam Park', 'Orange Line', 31.4200, 74.2600, 'ORANGE_LINE', true, NOW(), NOW()),
  (gen_random_uuid(), 'Dera Gujran', 'Orange Line', 31.4150, 74.2550, 'ORANGE_LINE', true, NOW(), NOW());

-- Step 3: Insert Feeder Bus Stops (Sample Routes)
-- Feeder Route 1: Railway Station to Bhati Chowk
-- Note: Railway Station, Azadi Chowk, and Bhati Chowk already exist from Metro/Orange Line
INSERT INTO stops (id, name, line, latitude, longitude, type, "isStation", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'Ek Moriya', 'FRT01', 31.4620, 74.3020, 'FEEDER', false, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM stops WHERE name = 'Ek Moriya' AND type = 'FEEDER');

INSERT INTO stops (id, name, line, latitude, longitude, type, "isStation", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'Nawaz Sharif Hospital', 'FRT01', 31.4640, 74.3040, 'FEEDER', false, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM stops WHERE name = 'Nawaz Sharif Hospital' AND type = 'FEEDER');

INSERT INTO stops (id, name, line, latitude, longitude, type, "isStation", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'Kashmiri Gate', 'FRT01', 31.4660, 74.3060, 'FEEDER', false, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM stops WHERE name = 'Kashmiri Gate' AND type = 'FEEDER');

INSERT INTO stops (id, name, line, latitude, longitude, type, "isStation", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'Lari Adda', 'FRT01', 31.4680, 74.3080, 'FEEDER', false, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM stops WHERE name = 'Lari Adda' AND type = 'FEEDER');

INSERT INTO stops (id, name, line, latitude, longitude, type, "isStation", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'Texali Chowk', 'FRT01', 31.4720, 74.3120, 'FEEDER', false, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM stops WHERE name = 'Texali Chowk' AND type = 'FEEDER');

-- Feeder Route 10: Multan Chungi to Qartaba Chowk
-- Note: Canal, Ichhra, Shama, Qartaba Chowk already exist from Metro Bus
INSERT INTO stops (id, name, line, latitude, longitude, type, "isStation", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'Multan Chungi', 'FRT10', 31.4800, 74.2800, 'FEEDER', false, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM stops WHERE name = 'Multan Chungi' AND type = 'FEEDER');

INSERT INTO stops (id, name, line, latitude, longitude, type, "isStation", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'Mustafa Town', 'FRT10', 31.4820, 74.2850, 'FEEDER', false, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM stops WHERE name = 'Mustafa Town' AND type = 'FEEDER');

INSERT INTO stops (id, name, line, latitude, longitude, type, "isStation", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'Karim Block Market', 'FRT10', 31.4840, 74.2900, 'FEEDER', false, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM stops WHERE name = 'Karim Block Market' AND type = 'FEEDER');

INSERT INTO stops (id, name, line, latitude, longitude, type, "isStation", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'PU Examination Center', 'FRT10', 31.4860, 74.2950, 'FEEDER', false, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM stops WHERE name = 'PU Examination Center' AND type = 'FEEDER');

INSERT INTO stops (id, name, line, latitude, longitude, type, "isStation", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'Bhekewal Morr', 'FRT10', 31.4880, 74.3000, 'FEEDER', false, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM stops WHERE name = 'Bhekewal Morr' AND type = 'FEEDER');

INSERT INTO stops (id, name, line, latitude, longitude, type, "isStation", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'Wahdat Colony', 'FRT10', 31.4900, 74.3050, 'FEEDER', false, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM stops WHERE name = 'Wahdat Colony' AND type = 'FEEDER');

INSERT INTO stops (id, name, line, latitude, longitude, type, "isStation", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'Naqsha Stop', 'FRT10', 31.4920, 74.3100, 'FEEDER', false, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM stops WHERE name = 'Naqsha Stop' AND type = 'FEEDER');

-- Step 4: Create Routes
INSERT INTO routes (id, name, line, "transportType", color, "createdAt", "updatedAt")
VALUES 
  (gen_random_uuid(), 'Metro Bus System', 'Metro Bus', 'METRO', '#0066CC', NOW(), NOW()),
  (gen_random_uuid(), 'Orange Line Metro', 'Orange Line', 'ORANGE_LINE', '#FF6B35', NOW(), NOW()),
  (gen_random_uuid(), 'Railway Station to Bhati Chowk', 'FRT01', 'FEEDER', '#6B8E23', NOW(), NOW()),
  (gen_random_uuid(), 'Multan Chungi to Qartaba Chowk', 'FRT10', 'FEEDER', '#6B8E23', NOW(), NOW());

-- Step 5: Link Metro Bus Stations to Route (order 27 to 1, i.e., 26 to 0)
INSERT INTO route_stops (id, "routeId", "stopId", "stopOrder", "createdAt", "updatedAt")
SELECT 
  gen_random_uuid(),
  (SELECT id FROM routes WHERE name = 'Metro Bus System' LIMIT 1),
  s.id,
  CASE s.name
    WHEN 'Gajjumata' THEN 26
    WHEN 'Dullu Khurd' THEN 25
    WHEN 'Youhanabad' THEN 24
    WHEN 'Nishtar Colony' THEN 23
    WHEN 'Atari Saroba' THEN 22
    WHEN 'Kamahan' THEN 21
    WHEN 'Chungi Amar Sidhu' THEN 20
    WHEN 'Ghazi Chowk' THEN 19
    WHEN 'Qainchi' THEN 18
    WHEN 'Ittefaq Hospital' THEN 17
    WHEN 'Naseerabad' THEN 16
    WHEN 'Model Town' THEN 15
    WHEN 'Kalma Chowk' THEN 14
    WHEN 'Gaddafi Stadium' THEN 13
    WHEN 'Canal' THEN 12
    WHEN 'Ichhra' THEN 11
    WHEN 'Shama' THEN 10
    WHEN 'Qartaba Chowk' THEN 9
    WHEN 'Janazgah' THEN 8
    WHEN 'MAO College' THEN 7
    WHEN 'Civil Secretariat' THEN 6
    WHEN 'Katchehry' THEN 5
    WHEN 'Bhati Chowk' THEN 4
    WHEN 'Azadi Chowk' THEN 3
    WHEN 'Timber Market' THEN 2
    WHEN 'Niazi Chowk' THEN 1
    WHEN 'Shahdara' THEN 0
  END,
  NOW(),
  NOW()
FROM stops s
WHERE s.line = 'Metro Bus' AND s.type = 'METRO';

-- Step 6: Link Orange Line Stations to Route (order 1 to 26, i.e., 0 to 25)
INSERT INTO route_stops (id, "routeId", "stopId", "stopOrder", "createdAt", "updatedAt")
SELECT 
  gen_random_uuid(),
  (SELECT id FROM routes WHERE name = 'Orange Line Metro' LIMIT 1),
  s.id,
  CASE s.name
    WHEN 'Ali Town' THEN 0
    WHEN 'Thokar Niaz Baig' THEN 1
    WHEN 'Canal View' THEN 2
    WHEN 'Hanjarwal' THEN 3
    WHEN 'Wahdat Road' THEN 4
    WHEN 'Awan Town' THEN 5
    WHEN 'Sabzazar' THEN 6
    WHEN 'Shahnoor' THEN 7
    WHEN 'Salahudin Road' THEN 8
    WHEN 'Band Road' THEN 9
    WHEN 'Samanabad' THEN 10
    WHEN 'Gulshan-e-Ravi' THEN 11
    WHEN 'Chauburji' THEN 12
    WHEN 'Anarkali' THEN 13
    WHEN 'GPO' THEN 14
    WHEN 'Lakshmi' THEN 15
    WHEN 'Railway Station' THEN 16
    WHEN 'Sultanpura' THEN 17
    WHEN 'UET' THEN 18
    WHEN 'Baghbanpura' THEN 19
    WHEN 'Shalamar Gardens' THEN 20
    WHEN 'Pakistan Mint' THEN 21
    WHEN 'Mahmood Booti' THEN 22
    WHEN 'Salamatpura' THEN 23
    WHEN 'Islam Park' THEN 24
    WHEN 'Dera Gujran' THEN 25
  END,
  NOW(),
  NOW()
FROM stops s
WHERE s.line = 'Orange Line' AND s.type = 'ORANGE_LINE';

-- Step 7: Link Feeder Route 1 Stops (Railway Station to Bhati Chowk)
-- Reuse existing stops where they exist (Railway Station, Azadi Chowk, Bhati Chowk from Metro/Orange Line)
INSERT INTO route_stops (id, "routeId", "stopId", "stopOrder", "createdAt", "updatedAt")
SELECT 
  gen_random_uuid(),
  (SELECT id FROM routes WHERE line = 'FRT01' LIMIT 1),
  s.id,
  CASE s.name
    WHEN 'Railway Station' THEN 0
    WHEN 'Ek Moriya' THEN 1
    WHEN 'Nawaz Sharif Hospital' THEN 2
    WHEN 'Kashmiri Gate' THEN 3
    WHEN 'Lari Adda' THEN 4
    WHEN 'Azadi Chowk' THEN 5
    WHEN 'Texali Chowk' THEN 6
    WHEN 'Bhati Chowk' THEN 7
  END,
  NOW(),
  NOW()
FROM stops s
WHERE s.name IN ('Railway Station', 'Ek Moriya', 'Nawaz Sharif Hospital', 'Kashmiri Gate', 'Lari Adda', 'Azadi Chowk', 'Texali Chowk', 'Bhati Chowk')
  AND (
    (s.type = 'FEEDER' AND s.line = 'FRT01') OR
    (s.name = 'Railway Station' AND (s.type = 'ORANGE_LINE' OR s.type = 'METRO')) OR
    (s.name = 'Azadi Chowk' AND s.type = 'METRO') OR
    (s.name = 'Bhati Chowk' AND s.type = 'METRO')
  );

-- Step 8: Link Feeder Route 10 Stops (Multan Chungi to Qartaba Chowk)
-- Reuse existing stops where they exist (Canal, Ichhra, Shama, Qartaba Chowk from Metro Bus)
INSERT INTO route_stops (id, "routeId", "stopId", "stopOrder", "createdAt", "updatedAt")
SELECT 
  gen_random_uuid(),
  (SELECT id FROM routes WHERE line = 'FRT10' LIMIT 1),
  s.id,
  CASE s.name
    WHEN 'Multan Chungi' THEN 0
    WHEN 'Mustafa Town' THEN 1
    WHEN 'Karim Block Market' THEN 2
    WHEN 'PU Examination Center' THEN 3
    WHEN 'Bhekewal Morr' THEN 4
    WHEN 'Wahdat Colony' THEN 5
    WHEN 'Naqsha Stop' THEN 6
    WHEN 'Canal' THEN 7
    WHEN 'Ichhra' THEN 8
    WHEN 'Shama' THEN 9
    WHEN 'Qartaba Chowk' THEN 10
  END,
  NOW(),
  NOW()
FROM stops s
WHERE s.name IN ('Multan Chungi', 'Mustafa Town', 'Karim Block Market', 'PU Examination Center', 'Bhekewal Morr', 'Wahdat Colony', 'Naqsha Stop', 'Canal', 'Ichhra', 'Shama', 'Qartaba Chowk')
  AND (
    (s.type = 'FEEDER' AND s.line = 'FRT10') OR
    (s.name = 'Canal' AND s.type = 'METRO') OR
    (s.name = 'Ichhra' AND s.type = 'METRO') OR
    (s.name = 'Shama' AND s.type = 'METRO') OR
    (s.name = 'Qartaba Chowk' AND s.type = 'METRO')
  );

-- Step 9: Populate PostGIS location field for all stops
-- This ensures the location field is set for geospatial queries
UPDATE stops
SET location = ST_SetSRID(
  ST_MakePoint(longitude, latitude),
  4326
)::geography
WHERE location IS NULL 
  AND latitude IS NOT NULL 
  AND longitude IS NOT NULL;

-- Step 10: Verify Data
SELECT 
  'Stops' as table_name, COUNT(*) as count FROM stops
UNION ALL
SELECT 
  'Routes' as table_name, COUNT(*) as count FROM routes
UNION ALL
SELECT 
  'Route Stops' as table_name, COUNT(*) as count FROM route_stops
UNION ALL
SELECT 
  'Stops with Location' as table_name, COUNT(*) as count FROM stops WHERE location IS NOT NULL;

-- Expected results:
-- Stops: ~65+ (27 Metro + 26 Orange Line + ~12 Feeder stops)
-- Routes: 4 (2 Metro/Orange Line + 2 Feeder)
-- Route Stops: ~75+ (53 Metro/Orange Line + ~19 Feeder)
-- Stops with Location: Should match total stops count (if PostGIS is working)
