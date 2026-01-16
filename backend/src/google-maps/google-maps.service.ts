import { Injectable, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiUsageService } from '../api-usage/api-usage.service';

/**
 * Google Maps API Service
 * Handles all Google Maps API calls with usage tracking
 */
@Injectable()
export class GoogleMapsService {
  private readonly apiKey: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly apiUsageService: ApiUsageService,
  ) {
    this.apiKey = this.configService.get<string>('GOOGLE_MAPS_API_KEY') || '';
    if (!this.apiKey) {
      console.warn('⚠️ GOOGLE_MAPS_API_KEY not set. Google Maps features will not work.');
    }
  }

  /**
   * Geocode address to coordinates
   */
  async geocode(userId: string, address: string): Promise<{ lat: number; lng: number }> {
    // Skip usage tracking for guest users
    if (userId !== 'guest') {
      // Check usage limit
      const canCall = await this.apiUsageService.canMakeApiCall(userId, 'geocodingCount');
      if (!canCall.allowed) {
        throw new ForbiddenException(canCall.message || 'Geocoding API limit reached');
      }
    }

    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${this.apiKey}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();

      if (data.status !== 'OK' || !data.results || data.results.length === 0) {
        throw new Error(`Geocoding failed: ${data.status}`);
      }

      const location = data.results[0].geometry.location;

      // Track usage (skip for guest users)
      if (userId !== 'guest') {
        await this.apiUsageService.trackApiUsage(userId, 'geocodingCount');
      }

      return {
        lat: location.lat,
        lng: location.lng,
      };
    } catch (error) {
      // Handle network errors specifically
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error: Unable to reach Google Maps API. Please check your internet connection and API key configuration.');
      }
      throw new Error(`Geocoding error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Reverse geocode coordinates to address
   */
  async reverseGeocode(userId: string, lat: number, lng: number): Promise<string> {
    // Skip usage tracking for guest users
    if (userId !== 'guest') {
      // Check usage limit
      const canCall = await this.apiUsageService.canMakeApiCall(userId, 'geocodingCount');
      if (!canCall.allowed) {
        throw new ForbiddenException(canCall.message || 'Geocoding API limit reached');
      }
    }

    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${this.apiKey}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();

      if (data.status !== 'OK' || !data.results || data.results.length === 0) {
        throw new Error(`Reverse geocoding failed: ${data.status}`);
      }

      // Track usage (skip for guest users)
      if (userId !== 'guest') {
        await this.apiUsageService.trackApiUsage(userId, 'geocodingCount');
      }

      return data.results[0].formatted_address;
    } catch (error) {
      // Handle network errors specifically
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error: Unable to reach Google Maps API. Please check your internet connection and API key configuration.');
      }
      throw new Error(`Reverse geocoding error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get place autocomplete suggestions
   */
  async autocomplete(
    userId: string, 
    input: string, 
    sessionToken?: string,
    options?: {
      location?: { lat: number; lng: number };
      radius?: number;
      components?: string;
    }
  ): Promise<any[]> {
    // Skip usage tracking for guest users
    if (userId !== 'guest') {
      // Check usage limit
      const canCall = await this.apiUsageService.canMakeApiCall(userId, 'placesAutocompleteCount');
      if (!canCall.allowed) {
        throw new ForbiddenException(canCall.message || 'Places Autocomplete API limit reached');
      }
    }

    try {
      let url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&key=${this.apiKey}`;
      if (sessionToken) {
        url += `&sessiontoken=${sessionToken}`;
      }
      // Add location bias and component restrictions for Lahore, Pakistan
      if (options?.location) {
        url += `&location=${options.location.lat},${options.location.lng}`;
      }
      if (options?.radius) {
        url += `&radius=${options.radius}`;
      }
      if (options?.components) {
        url += `&components=${encodeURIComponent(options.components)}`;
      }

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();

      if (data.status !== 'OK') {
        // Provide helpful error messages
        let errorMessage = `Autocomplete failed: ${data.status}`;
        if (data.status === 'REQUEST_DENIED') {
          errorMessage = 'Places API is not enabled or API key is invalid. Please check Google Cloud Console settings.';
        } else if (data.status === 'OVER_QUERY_LIMIT') {
          errorMessage = 'Autocomplete API quota exceeded. Please try again later.';
        } else if (data.status === 'ZERO_RESULTS') {
          // This is not an error, just no results
          return [];
        }
        throw new Error(errorMessage);
      }

      // Track usage (skip for guest users)
      if (userId !== 'guest') {
        await this.apiUsageService.trackApiUsage(userId, 'placesAutocompleteCount');
      }

      return data.predictions || [];
    } catch (error) {
      // Handle network errors specifically
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error: Unable to reach Google Maps API. Please check your internet connection and API key configuration.');
      }
      throw new Error(`Autocomplete error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get directions/route
   * @param mode - 'driving' | 'walking' | 'transit' | 'bicycling' (default: 'driving')
   */
  async getDirections(
    userId: string,
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number },
    waypoints?: Array<{ lat: number; lng: number }>,
    mode: 'driving' | 'walking' | 'transit' | 'bicycling' = 'driving',
  ): Promise<any> {
    // Check usage limit
    const canCall = await this.apiUsageService.canMakeApiCall(userId, 'directionsCount');
    if (!canCall.allowed) {
      throw new ForbiddenException(canCall.message || 'Directions API limit reached');
    }

    try {
      let url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}&mode=${mode}&key=${this.apiKey}`;
      
      if (waypoints && waypoints.length > 0) {
        const waypointStr = waypoints.map((wp) => `${wp.lat},${wp.lng}`).join('|');
        url += `&waypoints=${encodeURIComponent(waypointStr)}`;
      }

      // For transit mode, add transit options
      if (mode === 'transit') {
        url += `&transit_mode=bus|subway|train|tram`;
        // Restrict to Lahore, Pakistan
        url += `&region=pk`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.status !== 'OK') {
        throw new Error(`Directions failed: ${data.status}`);
      }

      // Track usage
      await this.apiUsageService.trackApiUsage(userId, 'directionsCount');

      return data;
    } catch (error) {
      throw new Error(`Directions error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get transit directions using Google Maps transit data
   * This uses Google's comprehensive transit database (Metro, Orange Line, Feeder buses, etc.)
   */
  async getTransitDirections(
    userId: string,
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number },
    options?: {
      departureTime?: Date;
      arrivalTime?: Date;
      transitMode?: 'bus' | 'subway' | 'train' | 'tram';
      transitRoutingPreference?: 'less_walking' | 'fewer_transfers';
    },
  ): Promise<any> {
    return this.getDirections(userId, origin, destination, undefined, 'transit');
  }

  /**
   * Track map load (for frontend)
   */
  async trackMapLoad(userId: string): Promise<void> {
    const canCall = await this.apiUsageService.canMakeApiCall(userId, 'dynamicMapsCount');
    if (!canCall.allowed) {
      // Don't throw error for map loads, just track
      // Frontend should handle gracefully
      return;
    }

    await this.apiUsageService.trackApiUsage(userId, 'dynamicMapsCount');
  }
}


