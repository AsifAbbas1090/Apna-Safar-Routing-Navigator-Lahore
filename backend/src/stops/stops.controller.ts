import { Controller, Get, Query, Param } from '@nestjs/common';
import { StopsService } from './stops.service';
import { Stop } from '@prisma/client';

/**
 * Stops Controller
 * REST API endpoints for stops
 */
@Controller('stops')
export class StopsController {
  constructor(private readonly stopsService: StopsService) {}

  @Get()
  async getAllStops(): Promise<Stop[]> {
    return this.stopsService.getAllStops();
  }

  @Get('nearest')
  async findNearest(
    @Query('lat') lat: string,
    @Query('lng') lng: string,
    @Query('radius') radius?: string,
    @Query('limit') limit?: string,
  ): Promise<Stop[]> {
    return this.stopsService.findNearestStops(
      parseFloat(lat),
      parseFloat(lng),
      radius ? parseFloat(radius) : 1000,
      limit ? parseInt(limit, 10) : 10,
    );
  }

  @Get(':id')
  async getStopById(@Param('id') id: string): Promise<Stop | null> {
    return this.stopsService.getStopById(id);
  }
}

