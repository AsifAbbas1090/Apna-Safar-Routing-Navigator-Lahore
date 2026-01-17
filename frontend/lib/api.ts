/**
 * API Client for Apna Safar Backend
 * Centralized API service with error handling and type safety
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
// #region agent log
fetch('http://127.0.0.1:7242/ingest/e959c8d5-c5d1-4ea5-b92d-9048dc30ea1b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api.ts:6',message:'API_BASE_URL initialized',data:{apiBaseUrl:API_BASE_URL,envVar:process.env.NEXT_PUBLIC_API_URL},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
// #endregion

/**
 * API Response wrapper
 */
interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

/**
 * API Error class
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: any,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Generic API request function with error handling
 */
async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/e959c8d5-c5d1-4ea5-b92d-9048dc30ea1b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api.ts:41',message:'apiRequest fetch starting',data:{url,endpoint,method:options?.method||'GET'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.message || `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        errorData,
      );
    }

    // Handle empty responses
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    
    return {} as T;
  } catch (error) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/e959c8d5-c5d1-4ea5-b92d-9048dc30ea1b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api.ts:68',message:'apiRequest error caught',data:{endpoint,errorMessage:error instanceof Error?error.message:String(error),errorType:error?.constructor?.name,url},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Network or other errors
    throw new ApiError(
      error instanceof Error ? error.message : 'Network error',
      0,
      error,
    );
  }
}

/**
 * Route Planning API
 */
export interface PlanRouteRequest {
  from: { lat: number; lng: number };
  to: { lat: number; lng: number };
  preference?: 'fastest' | 'least-walking' | 'least-transfers';
}

export interface RouteStep {
  type: 'walk' | 'bus' | 'train' | 'metro' | 'orange_line' | 'feeder';
  from: string;
  to: string;
  route?: string;
  time: number;
  distance?: number;
}

export interface PlannedRoute {
  estimatedTime: number;
  transfers: number;
  steps: RouteStep[];
  instructions?: string[]; // AI-generated navigation instructions
  walkingDistance?: number;
  routeIds?: string[];
}

export const routeApi = {
  /**
   * Plan a route from coordinates
   */
  planRoute: async (request: PlanRouteRequest): Promise<PlannedRoute> => {
    return apiRequest<PlannedRoute>('/route/plan', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  /**
   * Get route by stop IDs
   */
  getRouteByStops: async (
    from: string,
    to: string,
    preference?: 'fastest' | 'least-walking' | 'least-transfers',
  ): Promise<PlannedRoute> => {
    const params = new URLSearchParams({
      from,
      to,
      ...(preference && { preference }),
    });
    return apiRequest<PlannedRoute>(`/route/routes?${params}`);
  },
};

/**
 * Stops API
 */
export interface Stop {
  id: string;
  name: string;
  line?: string | null;
  latitude: number;
  longitude: number;
  type: 'BUS' | 'TRAIN' | 'METRO' | 'WALKING';
  isStation: boolean;
  distance_m?: number; // Added by nearest query
}

export const stopsApi = {
  /**
   * Get all stops
   */
  getAll: async (): Promise<Stop[]> => {
    return apiRequest<Stop[]>('/stops');
  },

  /**
   * Get stop by ID
   */
  getById: async (id: string): Promise<Stop | null> => {
    return apiRequest<Stop | null>(`/stops/${id}`);
  },

  /**
   * Find nearest stops
   */
  findNearest: async (
    lat: number,
    lng: number,
    radius: number = 500,
    limit: number = 10,
  ): Promise<Stop[]> => {
    const params = new URLSearchParams({
      near: `${lat},${lng}`,
      radius: radius.toString(),
      limit: limit.toString(),
    });
    return apiRequest<Stop[]>(`/stops?${params}`);
  },
};

/**
 * Routes API
 */
export interface Route {
  id: string;
  name: string;
  line?: string | null;
  transportType: 'BUS' | 'TRAIN' | 'METRO';
  color?: string | null;
}

export const routesApi = {
  /**
   * Get all routes
   */
  getAll: async (): Promise<Route[]> => {
    return apiRequest<Route[]>('/routes');
  },

  /**
   * Get route by ID with stops
   */
  getById: async (id: string): Promise<Route & { routeStops: any[] }> => {
    return apiRequest<Route & { routeStops: any[] }>(`/routes/${id}`);
  },
};

/**
 * Health check
 */
export const healthApi = {
  check: async (): Promise<{ status: string; timestamp: string; service: string }> => {
    return apiRequest('/health');
  },
};

/**
 * Get auth token from localStorage
 */
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  // Check both possible keys for backward compatibility
  // Also check zustand persisted state
  const token = localStorage.getItem('accessToken') || localStorage.getItem('auth_token');
  if (token) return token;
  
  // Try to get from zustand persisted state
  try {
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      const parsed = JSON.parse(authStorage);
      if (parsed?.state?.token) {
        return parsed.state.token;
      }
    }
  } catch (e) {
    // Ignore parse errors
  }
  
  return null;
}

/**
 * Authenticated API request
 */
async function authenticatedRequest<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const token = getAuthToken();
  
  if (!token) {
    throw new ApiError('Authentication required', 401);
  }
  
  return apiRequest<T>(endpoint, {
    ...options,
    headers: {
      ...options?.headers,
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * Dashboard API
 */
export interface DashboardStats {
  totalRoutes: number;
  totalRoutesChange: number;
  avgCommuteTime: number;
  avgCommuteTimeChange: number;
  favoriteTransport: string;
  favoriteTransportCount: number;
  timeSavedHours: string;
  recentRoutes: Array<{
    id: string;
    from: string;
    to: string;
    date: string;
    duration: string;
  }>;
}

export const dashboardApi = {
  /**
   * Get user dashboard statistics
   */
  getStats: async (): Promise<DashboardStats> => {
    return authenticatedRequest<DashboardStats>('/dashboard/stats');
  },
};

/**
 * Saved Routes API
 */
export interface SavedRoute {
  id: string;
  startStopId: string;
  endStopId: string;
  routeIds: string[];
  etaMinutes: number;
  stepsJson: string;
  preference?: string;
  walkingDistanceM?: number;
  transfersCount?: number;
  savedName?: string;
  startStop: { name: string };
  endStop: { name: string };
  createdAt: string;
}

export const savedRoutesApi = {
  /**
   * Get user's saved routes
   */
  getAll: async (): Promise<SavedRoute[]> => {
    return authenticatedRequest<SavedRoute[]>('/routes/saved/all');
  },

  /**
   * Save a route
   */
  save: async (routeData: {
    startStopId: string;
    endStopId: string;
    routeIds: string[];
    etaMinutes: number;
    stepsJson: string;
    preference?: string;
    walkingDistanceM?: number;
    transfersCount?: number;
    savedName?: string;
  }): Promise<SavedRoute> => {
    return authenticatedRequest<SavedRoute>('/routes/save', {
      method: 'POST',
      body: JSON.stringify(routeData),
    });
  },

  /**
   * Delete a saved route
   */
  delete: async (routeId: string): Promise<void> => {
    return authenticatedRequest<void>(`/routes/saved/${routeId}`, {
      method: 'DELETE',
    });
  },

  /**
   * Mark route as completed
   */
  complete: async (routeId: string, actualDurationMin: number): Promise<void> => {
    return authenticatedRequest<void>('/routes/complete', {
      method: 'POST',
      body: JSON.stringify({ routeId, actualDurationMin }),
    });
  },
};

/**
 * Optional authenticated request - works with or without auth token
 * Used for endpoints that support optional authentication
 */
async function optionalAuthenticatedRequest<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/e959c8d5-c5d1-4ea5-b92d-9048dc30ea1b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api.ts:346',message:'optionalAuthenticatedRequest called',data:{endpoint,fullUrl:url,method:options?.method||'GET'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  const token = getAuthToken();
  return apiRequest<T>(endpoint, {
    ...options,
    headers: {
      ...options?.headers,
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
}

/**
 * Google Maps API
 * Note: geocode and autocomplete support optional authentication (work for guest users)
 */
export const googleMapsApi = {
  /**
   * Geocode address to coordinates
   * Works with or without authentication
   */
  geocode: async (
    address: string,
    geocodeOptions?: { 
      componentRestrictions?: { country: string }; 
      locationBias?: { circle: { center: { lat: number; lng: number }; radius: number } } 
    }
  ): Promise<{ lat: number; lng: number }> => {
    // Convert to backend format
    const backendOptions: any = { address };
    if (geocodeOptions?.locationBias?.circle) {
      backendOptions.location = {
        lat: geocodeOptions.locationBias.circle.center.lat,
        lng: geocodeOptions.locationBias.circle.center.lng,
      };
      backendOptions.radius = geocodeOptions.locationBias.circle.radius;
    }
    if (geocodeOptions?.componentRestrictions?.country) {
      backendOptions.components = `country:${geocodeOptions.componentRestrictions.country}`;
    }
    
    return optionalAuthenticatedRequest<{ lat: number; lng: number }>('/google-maps/geocode', {
      method: 'POST',
      body: JSON.stringify(backendOptions),
    });
  },

  /**
   * Reverse geocode coordinates to address
   * Works with or without authentication
   */
  reverseGeocode: async (lat: number, lng: number): Promise<string> => {
    const result = await optionalAuthenticatedRequest<{ address: string }>('/google-maps/reverse-geocode', {
      method: 'POST',
      body: JSON.stringify({ lat, lng }),
    });
    return (result as any).address || '';
  },

  /**
   * Get place autocomplete suggestions
   * Works with or without authentication
   */
  autocomplete: async (
    input: string, 
    sessionToken?: string,
    options?: {
      componentRestrictions?: { country: string };
      locationBias?: { circle: { center: { lat: number; lng: number }; radius: number } };
    }
  ): Promise<any[]> => {
    // Convert to backend format
    const backendOptions: any = {};
    if (options?.locationBias?.circle) {
      backendOptions.location = {
        lat: options.locationBias.circle.center.lat,
        lng: options.locationBias.circle.center.lng,
      };
      backendOptions.radius = options.locationBias.circle.radius;
    }
    if (options?.componentRestrictions?.country) {
      backendOptions.components = `country:${options.componentRestrictions.country}`;
    }
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/e959c8d5-c5d1-4ea5-b92d-9048dc30ea1b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api.ts:416',message:'autocomplete API call initiated',data:{input,hasSessionToken:!!sessionToken,backendOptions},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    // #endregion
    return optionalAuthenticatedRequest<any[]>('/google-maps/autocomplete', {
      method: 'POST',
      body: JSON.stringify({ input, sessionToken, ...backendOptions }),
    });
  },

  /**
   * Get directions/route
   * Requires authentication
   */
  getDirections: async (
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number },
    waypoints?: Array<{ lat: number; lng: number }>,
  ): Promise<any> => {
    return authenticatedRequest<any>('/google-maps/directions', {
      method: 'POST',
      body: JSON.stringify({ origin, destination, waypoints }),
    });
  },
};

/**
 * API Usage API
 */
export interface ApiUsageStats {
  isPremium: boolean;
  usage: {
    dynamicMaps: { current: number; limit: number; percentage: number };
    placesAutocomplete: { current: number; limit: number; percentage: number };
    directions: { current: number; limit: number; percentage: number };
    geocoding: { current: number; limit: number; percentage: number };
    staticMaps: { current: number; limit: number; percentage: number };
    lastResetAt: string;
  } | null;
}

export const apiUsageApi = {
  /**
   * Get user's API usage statistics
   */
  getUsage: async (): Promise<ApiUsageStats> => {
    return authenticatedRequest<ApiUsageStats>('/api-usage');
  },
};

