import { Controller, Post, Body, Get } from '@nestjs/common';
import { RoutingService, PlannedRoute } from './routing.service';
import type { RoutePreference } from './routing.service';
import { IsNumber, IsEnum, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

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
 * Routing Controller
 * REST API endpoints for route planning
 */
@Controller('route')
export class RoutingController {
  constructor(private readonly routingService: RoutingService) {}

  @Post('plan')
  async planRoute(@Body() planRouteDto: PlanRouteDto): Promise<PlannedRoute> {
    return this.routingService.planRoute(
      planRouteDto.from.lat,
      planRouteDto.from.lng,
      planRouteDto.to.lat,
      planRouteDto.to.lng,
      planRouteDto.preference || 'fastest',
    );
  }

  @Get('health')
  healthCheck() {
    return { status: 'ok', service: 'routing' };
  }
}

