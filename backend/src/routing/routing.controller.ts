import { Controller, Post, Body, Get, Query, UseGuards, Request } from '@nestjs/common';
import { RoutingService, PlannedRoute } from './routing.service';
import type { RoutePreference } from './routing.service';
import { IsNumber, IsEnum, IsOptional, ValidateNested, IsString, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoutesService } from '../routes/routes.service';
import { StopsRepository } from '../stops/stops.repository';
import { NavigationService } from '../navigation/navigation.service';

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
 * DTOs for route planning
 */
class PlanRouteDto {
  @ValidateNested()
  @Type(() => CoordinateDto)
  from: CoordinateDto;

  @ValidateNested()
  @Type(() => CoordinateDto)
  to: CoordinateDto;

  @IsOptional()
  @IsEnum(['fastest', 'least-walking', 'least-transfers'])
  preference?: RoutePreference;
}

/**
 * DTO for /routes?from&to (by stop IDs)
 */
class RouteByStopsDto {
  @IsString()
  from: string;

  @IsString()
  to: string;

  @IsOptional()
  @IsEnum(['fastest', 'least-walking', 'least-transfers'])
  preference?: RoutePreference;
}

/**
 * Waypoints DTO for multi-stop routing
 */
class WaypointDto {
  @IsNumber()
  lat: number;

  @IsNumber()
  lng: number;
}

class PlanRouteWithWaypointsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WaypointDto)
  waypoints: WaypointDto[];

  @IsOptional()
  @IsEnum(['fastest', 'least-walking', 'least-transfers'])
  preference?: RoutePreference;
}

/**
 * Routing Controller
 * REST API endpoints for route planning
 */
@Controller('route')
export class RoutingController {
  constructor(
    private readonly routingService: RoutingService,
    private readonly routesService: RoutesService,
    private readonly stopsRepository: StopsRepository,
    private readonly navigationService: NavigationService,
  ) {}

  // POST /route/plan → coordinates-based planning with AI instructions
  @Post('plan')
  async planRoute(@Body() planRouteDto: PlanRouteDto): Promise<PlannedRoute & { instructions?: string[] }> {
    const route = await this.routingService.planRoute(
      planRouteDto.from.lat,
      planRouteDto.from.lng,
      planRouteDto.to.lat,
      planRouteDto.to.lng,
      planRouteDto.preference || 'fastest',
    );
    
    // Generate AI navigation instructions
    const instructions = this.navigationService.generateInstructions(route);
    
    return {
      ...route,
      instructions,
    };
  }

  // GET /route/routes?from=<stopId>&to=<stopId>
  @Get('routes')
  async getRouteByStops(
    @Query() query: RouteByStopsDto,
  ): Promise<PlannedRoute> {
    try {
      return await this.routingService.planBetweenStops(
        query.from,
        query.to,
        query.preference || 'fastest',
      );
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        throw new Error(`Invalid stop ID: ${error.message}`);
      }
      throw error;
    }
  }

  // POST /route/plan-waypoints (multiple stops)
  @Post('plan-waypoints')
  async planRouteWithWaypoints(
    @Body() waypointsDto: PlanRouteWithWaypointsDto,
  ): Promise<PlannedRoute> {
    return this.routingService.planRouteWithWaypoints(
      waypointsDto.waypoints,
      waypointsDto.preference || 'fastest',
    );
  }

  // POST /route/plan-and-save (plan and save in one call)
  @UseGuards(JwtAuthGuard)
  @Post('plan-and-save')
  async planAndSaveRoute(
    @Request() req,
    @Body() planRouteDto: PlanRouteDto & { savedName?: string },
  ): Promise<{ route: PlannedRoute; savedRoute: any }> {
    const route = await this.routingService.planRoute(
      planRouteDto.from.lat,
      planRouteDto.from.lng,
      planRouteDto.to.lat,
      planRouteDto.to.lng,
      planRouteDto.preference || 'fastest',
    );

    // Find start and end stops
    const startStops = await this.stopsRepository.findNearest(
      planRouteDto.from.lat,
      planRouteDto.from.lng,
      500,
      1,
    );
    const endStops = await this.stopsRepository.findNearest(
      planRouteDto.to.lat,
      planRouteDto.to.lng,
      500,
      1,
    );

    if (startStops.length > 0 && endStops.length > 0) {
      const savedRoute = await this.routesService.saveRoute(req.user.id, {
        startStopId: startStops[0].id,
        endStopId: endStops[0].id,
        routeIds: route.routeIds || [],
        etaMinutes: route.estimatedTime,
        stepsJson: JSON.stringify(route.steps),
        preference: planRouteDto.preference || 'fastest',
        walkingDistanceM: route.walkingDistance,
        transfersCount: route.transfers,
        savedName: planRouteDto.savedName,
      });

      return { route, savedRoute };
    }

    return { route, savedRoute: null };
  }

  @Get('health')
  healthCheck() {
    return { status: 'ok', service: 'routing' };
  }
}

