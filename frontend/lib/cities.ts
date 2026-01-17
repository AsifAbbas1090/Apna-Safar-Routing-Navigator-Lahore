/**
 * Supported Cities with Mass Transit Systems
 * Only cities with government mass transit systems available in Google Maps
 */

export interface City {
  id: string;
  name: string;
  center: [number, number]; // [lng, lat]
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  country: string;
  hasTransit: boolean;
}

export const SUPPORTED_CITIES: City[] = [
  {
    id: 'lahore',
    name: 'Lahore',
    center: [74.3587, 31.5204],
    bounds: {
      north: 31.65,
      south: 31.35,
      east: 74.50,
      west: 74.20,
    },
    country: 'Pakistan',
    hasTransit: true,
  },
  {
    id: 'karachi',
    name: 'Karachi',
    center: [67.0011, 24.8607],
    bounds: {
      north: 25.10,
      south: 24.60,
      east: 67.40,
      west: 66.60,
    },
    country: 'Pakistan',
    hasTransit: true,
  },
  {
    id: 'islamabad',
    name: 'Islamabad',
    center: [73.0479, 33.6844],
    bounds: {
      north: 33.90,
      south: 33.45,
      east: 73.30,
      west: 72.80,
    },
    country: 'Pakistan',
    hasTransit: true,
  },
  {
    id: 'rawalpindi',
    name: 'Rawalpindi',
    center: [73.0479, 33.5651],
    bounds: {
      north: 33.70,
      south: 33.40,
      east: 73.20,
      west: 72.90,
    },
    country: 'Pakistan',
    hasTransit: true,
  },
  {
    id: 'multan',
    name: 'Multan',
    center: [71.4753, 30.1575],
    bounds: {
      north: 30.30,
      south: 30.00,
      east: 71.60,
      west: 71.30,
    },
    country: 'Pakistan',
    hasTransit: true,
  },
  {
    id: 'peshawar',
    name: 'Peshawar',
    center: [71.5249, 34.0151],
    bounds: {
      north: 34.20,
      south: 33.80,
      east: 71.70,
      west: 71.30,
    },
    country: 'Pakistan',
    hasTransit: true,
  },
  {
    id: 'quetta',
    name: 'Quetta',
    center: [66.9750, 30.1798],
    bounds: {
      north: 30.30,
      south: 30.05,
      east: 67.10,
      west: 66.80,
    },
    country: 'Pakistan',
    hasTransit: true,
  },
  // Hyderabad, Pakistan removed - People's Bus Service (PBS) exists but is not integrated with Google Maps transit data
];

/**
 * Get city by ID
 */
export function getCityById(id: string): City | undefined {
  return SUPPORTED_CITIES.find(city => city.id === id);
}

/**
 * Get city by name (case-insensitive)
 */
export function getCityByName(name: string): City | undefined {
  return SUPPORTED_CITIES.find(
    city => city.name.toLowerCase() === name.toLowerCase()
  );
}

/**
 * Get default city (Lahore)
 */
export function getDefaultCity(): City {
  return SUPPORTED_CITIES[0]; // Lahore
}

/**
 * Get city names for autocomplete
 */
export function getCityNames(): string[] {
  return SUPPORTED_CITIES.map(city => city.name);
}

