import { Controller, Get, Param, Post, Body, Delete, UseGuards, Request } from '@nestjs/common';
import { RoutesService } from './routes.service';
import { Route } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { IsString, IsOptional, IsNumber, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Save Route DTO
 */
class SaveRouteDto {
  @IsString()
  startStopId: string;

  @IsString()
  endStopId: string;

  @IsArray()
  @IsString({ each: true })
  routeIds: string[];

  @IsNumber()
  etaMinutes: number;

  @IsString()
  stepsJson: string;

  @IsOptional()
  @IsString()
  preference?: string;

  @IsOptional()
  @IsNumber()
  walkingDistanceM?: number;

  @IsOptional()
  @IsNumber()
  transfersCount?: number;

  @IsOptional()
  @IsString()
  savedName?: string;
}

/**
 * Complete Route DTO
 */
class CompleteRouteDto {
  @IsString()
  routeId: string;

  @IsNumber()
  actualDurationMin: number;
}

/**
 * Routes Controller
 * REST API endpoints for routes
 */
@Controller('routes')
export class RoutesController {
  constructor(private readonly routesService: RoutesService) {}

  /**
   * Get all routes
   * GET /routes
   */
  @Get()
  async getAllRoutes(): Promise<Route[]> {
    return this.routesService.getAllRoutes();
  }

  /**
   * Get route by ID with stops
   * GET /routes/:id
   */
  @Get(':id')
  async getRouteById(@Param('id') id: string): Promise<Route & { routeStops: any[] }> {
    return this.routesService.getRouteById(id);
  }

  /**
   * Save a planned route
   * POST /routes/save
   * Protected route - requires authentication
   */
  @UseGuards(JwtAuthGuard)
  @Post('save')
  async saveRoute(@Request() req, @Body() saveRouteDto: SaveRouteDto) {
    return this.routesService.saveRoute(req.user.id, saveRouteDto);
  }

  /**
   * Get user's saved routes
   * GET /routes/saved
   * Protected route - requires authentication
   */
  @UseGuards(JwtAuthGuard)
  @Get('saved/all')
  async getSavedRoutes(@Request() req) {
    return this.routesService.getSavedRoutes(req.user.id);
  }

  /**
   * Delete a saved route
   * DELETE /routes/saved/:id
   * Protected route - requires authentication
   */
  @UseGuards(JwtAuthGuard)
  @Delete('saved/:id')
  async deleteSavedRoute(@Request() req, @Param('id') id: string) {
    return this.routesService.deleteSavedRoute(req.user.id, id);
  }

  /**
   * Mark route as completed
   * POST /routes/complete
   * Protected route - requires authentication
   */
  @UseGuards(JwtAuthGuard)
  @Post('complete')
  async completeRoute(@Request() req, @Body() completeRouteDto: CompleteRouteDto) {
    return this.routesService.completeRoute(
      req.user.id,
      completeRouteDto.routeId,
      completeRouteDto.actualDurationMin,
    );
  }

  /**
   * Get user's route history
   * GET /routes/history
   * Protected route - requires authentication
   */
  @UseGuards(JwtAuthGuard)
  @Get('history/all')
  async getRouteHistory(@Request() req) {
    return this.routesService.getRouteHistory(req.user.id);
  }
}
