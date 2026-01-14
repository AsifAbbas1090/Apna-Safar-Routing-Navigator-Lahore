import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { StopsModule } from './stops/stops.module';
import { RoutesModule } from './routes/routes.module';
import { RoutingModule } from './routing/routing.module';

/**
 * Root Application Module
 * Imports all feature modules and configuration
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    StopsModule,
    RoutesModule,
    RoutingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
