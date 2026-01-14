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

  // GET /stops?near=lat,lng&radius=500
  @Get()
  async getStops(
    @Query('near') near?: string,
    @Query('radius') radius?: string,
    @Query('limit') limit?: string,
  ) {
    if (near) {
      const [latStr, lngStr] = near.split(',');
      const lat = parseFloat(latStr);
      const lng = parseFloat(lngStr);
      
      if (isNaN(lat) || isNaN(lng)) {
        throw new Error('Invalid coordinates. Use format: near=lat,lng');
      }
      
      const radiusMeters = radius ? parseFloat(radius) : 500;
      const limitNum = limit ? parseInt(limit, 10) : 10;

      return this.stopsService.findNearestStops(lat, lng, radiusMeters, limitNum);
    }

    return this.stopsService.getAllStops();
  }

  @Get(':id')
  async getStopById(@Param('id') id: string): Promise<Stop | null> {
    return this.stopsService.getStopById(id);
  }
}
