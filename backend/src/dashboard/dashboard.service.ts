import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Dashboard Service
 * Calculates user statistics from database
 */
@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get user dashboard statistics
   */
  async getUserStats(userId: string) {
    // Get all completed routes for user
    const completedRoutes = await this.prisma.plannedRoute.findMany({
      where: {
        userId,
        completedAt: { not: null },
      },
    });

    // Get all routes (completed + saved) for this month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const routesThisMonth = await this.prisma.plannedRoute.findMany({
      where: {
        userId,
        createdAt: { gte: startOfMonth },
      },
    });

    // Calculate total routes
    const totalRoutes = routesThisMonth.length;
    const totalCompleted = completedRoutes.length;

    // Calculate average commute time
    const routesWithDuration = completedRoutes.filter(
      (r) => r.actualDurationMin || r.etaMinutes,
    );
    const avgCommuteTime =
      routesWithDuration.length > 0
        ? Math.round(
            routesWithDuration.reduce(
              (sum, r) => sum + (r.actualDurationMin || r.etaMinutes || 0),
              0,
            ) / routesWithDuration.length,
          )
        : 0;

    // Calculate favorite transport
    const transportCounts = new Map<string, number>();
    for (const route of completedRoutes) {
      if (route.routeIds && route.routeIds.length > 0) {
        // Get route details to determine transport type
        const routes = await this.prisma.route.findMany({
          where: { id: { in: route.routeIds } },
        });
        routes.forEach((r) => {
          const count = transportCounts.get(r.transportType) || 0;
          transportCounts.set(r.transportType, count + 1);
        });
      }
    }

    let favoriteTransport = 'None';
    let favoriteTransportCount = 0;
    for (const [transport, count] of transportCounts.entries()) {
      if (count > favoriteTransportCount) {
        favoriteTransportCount = count;
        favoriteTransport = this.formatTransportType(transport);
      }
    }

    // Calculate time saved (compare actual vs walking time)
    // Walking speed: ~5 km/h = 83.33 m/min
    let totalTimeSaved = 0;
    for (const route of completedRoutes) {
      if (route.actualDurationMin && route.walkingDistanceM) {
        const walkingTime = Math.round(route.walkingDistanceM / 83.33);
        const timeSaved = walkingTime - route.actualDurationMin;
        if (timeSaved > 0) {
          totalTimeSaved += timeSaved;
        }
      }
    }
    const timeSavedHours = (totalTimeSaved / 60).toFixed(1);

    // Get recent routes
    const recentRoutes = await this.prisma.plannedRoute.findMany({
      where: {
        userId,
        completedAt: { not: null },
      },
      include: {
        startStop: true,
        endStop: true,
      },
      orderBy: {
        completedAt: 'desc',
      },
      take: 10,
    });

    // Calculate change from last month
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    const routesLastMonth = await this.prisma.plannedRoute.count({
      where: {
        userId,
        createdAt: {
          gte: lastMonth,
          lte: lastMonthEnd,
        },
      },
    });

    const routesChange =
      routesLastMonth > 0
        ? Math.round(((totalRoutes - routesLastMonth) / routesLastMonth) * 100)
        : totalRoutes > 0
          ? 100
          : 0;

    // Calculate average time change
    const lastMonthRoutes = await this.prisma.plannedRoute.findMany({
      where: {
        userId,
        createdAt: {
          gte: lastMonth,
          lte: lastMonthEnd,
        },
        completedAt: { not: null },
      },
    });

    const lastMonthAvg =
      lastMonthRoutes.length > 0
        ? Math.round(
            lastMonthRoutes.reduce(
              (sum, r) => sum + (r.actualDurationMin || r.etaMinutes || 0),
              0,
            ) / lastMonthRoutes.length,
          )
        : 0;

    const avgTimeChange = lastMonthAvg > 0 ? avgCommuteTime - lastMonthAvg : 0;

    return {
      totalRoutes,
      totalRoutesChange: routesChange,
      avgCommuteTime,
      avgCommuteTimeChange: avgTimeChange,
      favoriteTransport,
      favoriteTransportCount,
      timeSavedHours,
      recentRoutes: recentRoutes.map((r) => ({
        id: r.id,
        from: r.startStop.name,
        to: r.endStop.name,
        date: this.formatDate(r.completedAt || r.createdAt),
        duration: `${r.actualDurationMin || r.etaMinutes} mins`,
      })),
    };
  }

  private formatTransportType(type: string): string {
    const map: Record<string, string> = {
      BUS: 'Bus',
      METRO: 'Metro',
      TRAIN: 'Train',
    };
    return map[type] || type;
  }

  private formatDate(date: Date | null): string {
    if (!date) return 'Unknown';
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  }
}

