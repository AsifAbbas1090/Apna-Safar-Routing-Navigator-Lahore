import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * Prisma Service
 * Handles database connection lifecycle
 * Singleton service for database access
 * 
 * Note: DATABASE_URL is read from environment variables
 * (configured in prisma.config.ts for Prisma v7+)
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      // Prisma v7+ reads DATABASE_URL from environment automatically
      // No need to pass it explicitly here
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}

