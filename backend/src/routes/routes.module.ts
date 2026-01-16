import { Module } from '@nestjs/common';
import { RoutesService } from './routes.service';
import { RoutesRepository } from './routes.repository';
import { RoutesController } from './routes.controller';
import { PrismaModule } from '../prisma/prisma.module';

/**
 * Routes Module
 * Handles all route-related operations
 */
@Module({
  imports: [PrismaModule],
  controllers: [RoutesController],
  providers: [RoutesService, RoutesRepository],
  exports: [RoutesService, RoutesRepository],
})
export class RoutesModule {}


