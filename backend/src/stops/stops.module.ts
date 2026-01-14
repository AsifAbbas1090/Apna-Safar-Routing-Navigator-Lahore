import { Module } from '@nestjs/common';
import { StopsService } from './stops.service';
import { StopsRepository } from './stops.repository';
import { StopsController } from './stops.controller';
import { PrismaModule } from '../prisma/prisma.module';

/**
 * Stops Module
 * Handles all stop-related operations
 */
@Module({
  imports: [PrismaModule],
  controllers: [StopsController],
  providers: [StopsService, StopsRepository],
  exports: [StopsService, StopsRepository, StopsController],
})
export class StopsModule {}

