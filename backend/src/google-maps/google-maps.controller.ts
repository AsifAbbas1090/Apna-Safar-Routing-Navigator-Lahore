import { Controller, Post, Body, Get, UseGuards, Request, Query, Req } from '@nestjs/common';
import { GoogleMapsService } from './google-maps.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { IsString, IsNumber, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ExecutionContext } from '@nestjs/common';

/**
 * Coordinate DTO
 */
class CoordinateDto {
  @IsNumber()
  lat: number;

  @IsNumber()
  lng: number;
}

/**
 * Location DTO for autocomplete bias
 * Must be defined before GeocodeDto which uses it
 */
class LocationDto {
  @IsNumber()
  lat: number;

  @IsNumber()
  lng: number;
}

/**
 * Geocode DTO
 */
class GeocodeDto {
  @IsString()
  address: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => LocationDto)
  location?: LocationDto;

  @IsOptional()
  @IsNumber()
  radius?: number;

  @IsOptional()
  @IsString()
  components?: string;
}

/**
 * Reverse Geocode DTO
 */
class ReverseGeocodeDto {
  @IsNumber()
  lat: number;

  @IsNumber()
  lng: number;
}

/**
 * Autocomplete DTO
 */
class AutocompleteDto {
  @IsString()
  input: string;

  @IsOptional()
  @IsString()
  sessionToken?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => LocationDto)
  location?: LocationDto;

  @IsOptional()
  @IsNumber()
  radius?: number;

  @IsOptional()
  @IsString()
  components?: string;
}

/**
 * Directions DTO
 */
class DirectionsDto {
  @ValidateNested()
  @Type(() => CoordinateDto)
  origin: CoordinateDto;

  @ValidateNested()
  @Type(() => CoordinateDto)
  destination: CoordinateDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CoordinateDto)
  waypoints?: CoordinateDto[];

  @IsOptional()
  @IsString()
  mode?: 'driving' | 'walking' | 'transit' | 'bicycling';
}

/**
 * Google Maps Controller
 * REST API endpoints for Google Maps services
 */
@Controller('google-maps')
export class GoogleMapsController {
  constructor(private readonly googleMapsService: GoogleMapsService) {}

  /**
   * Geocode address to coordinates
   * POST /google-maps/geocode
   * Optional authentication - works without login
   */
  @UseGuards(OptionalJwtAuthGuard)
  @Post('geocode')
  async geocode(@Request() req, @Body() geocodeDto: GeocodeDto) {
    const userId = req.user?.id || 'guest';
    return this.googleMapsService.geocode(
      userId,
      geocodeDto.address,
      {
        location: geocodeDto.location,
        radius: geocodeDto.radius,
        components: geocodeDto.components,
      }
    );
  }

  /**
   * Reverse geocode coordinates to address
   * POST /google-maps/reverse-geocode
   * Optional authentication - works without login
   */
  @UseGuards(OptionalJwtAuthGuard)
  @Post('reverse-geocode')
  async reverseGeocode(@Request() req, @Body() reverseGeocodeDto: ReverseGeocodeDto) {
    const userId = req.user?.id || 'guest';
    return this.googleMapsService.reverseGeocode(
      userId,
      reverseGeocodeDto.lat,
      reverseGeocodeDto.lng,
    );
  }

  /**
   * Get place autocomplete suggestions
   * POST /google-maps/autocomplete
   * Optional authentication - works without login
   */
  @UseGuards(OptionalJwtAuthGuard)
  @Post('autocomplete')
  async autocomplete(@Request() req, @Body() autocompleteDto: AutocompleteDto) {
    // #region agent log
    const fs5 = require('fs'); const logPath5 = 'e:\\Asif\\Apna Safar\\.cursor\\debug.log'; try { fs5.appendFileSync(logPath5, JSON.stringify({location:'google-maps.controller.ts:141',message:'autocomplete endpoint called',data:{input:autocompleteDto.input,hasLocation:!!autocompleteDto.location},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})+'\n'); } catch(e) {}
    // #endregion
    const userId = req.user?.id || 'guest';
    return this.googleMapsService.autocomplete(
      userId,
      autocompleteDto.input,
      autocompleteDto.sessionToken,
      {
        location: autocompleteDto.location,
        radius: autocompleteDto.radius,
        components: autocompleteDto.components,
      },
    );
  }

  /**
   * Get directions/route
   * POST /google-maps/directions
   * Works with or without authentication (optional auth)
   */
  @UseGuards(OptionalJwtAuthGuard)
  @Post('directions')
  async getDirections(@Request() req, @Body() directionsDto: DirectionsDto) {
    const userId = req.user?.id || 'guest';
    return this.googleMapsService.getDirections(
      userId,
      directionsDto.origin,
      directionsDto.destination,
      directionsDto.waypoints,
      directionsDto.mode || 'driving',
    );
  }

  /**
   * Get transit directions using Google Maps transit data
   * POST /google-maps/transit-directions
   * Uses Google's comprehensive transit database (Metro, Orange Line, Feeder buses, etc.)
   */
  @UseGuards(OptionalJwtAuthGuard)
  @Post('transit-directions')
  async getTransitDirections(@Request() req, @Body() directionsDto: DirectionsDto) {
    const userId = req.user?.id || 'guest';
    return this.googleMapsService.getTransitDirections(
      userId,
      directionsDto.origin,
      directionsDto.destination,
    );
  }

  /**
   * Track map load (called by frontend when map loads)
   * POST /google-maps/track-map-load
   * Protected route - requires authentication
   */
  @UseGuards(JwtAuthGuard)
  @Post('track-map-load')
  async trackMapLoad(@Request() req) {
    await this.googleMapsService.trackMapLoad(req.user.id);
    return { success: true };
  }
}


