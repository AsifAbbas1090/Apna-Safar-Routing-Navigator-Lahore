import { Controller, Get, Param } from '@nestjs/common';
import { RoutesService } from './routes.service';
import { Route } from '@prisma/client';

/**
 * Routes Controller
 * REST API endpoints for routes
 */
@Controller('routes')
export class RoutesController {
  constructor(private readonly routesService: RoutesService) {}

  @Get()
  async getAllRoutes(): Promise<Route[]> {
    return this.routesService.getAllRoutes();
  }

  @Get(':id')
  async getRouteById(@Param('id') id: string) {
    return this.routesService.getRouteById(id);
  }
}

