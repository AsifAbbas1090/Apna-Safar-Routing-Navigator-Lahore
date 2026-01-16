import { Injectable } from '@nestjs/common';
import { StopsRepository } from '../stops/stops.repository';
import { RoutesRepository } from '../routes/routes.repository';
import { PrismaService } from '../prisma/prisma.service';
import { GoogleMapsService } from '../google-maps/google-maps.service';
import { Stop, Route } from '@prisma/client';

/**
 * Route Step Types
 */
export type RouteStepType = 'walk' | 'bus' | 'train' | 'metro' | 'orange_line' | 'feeder';

export interface RouteStep {
  type: RouteStepType;
  from: string;
  to: string;
  route?: string;
  time: number; // in minutes
  distance?: number; // in meters
}

export interface PlannedRoute {
  estimatedTime: number; // total time in minutes
  transfers: number;
  steps: RouteStep[];
  walkingDistance?: number; // total walking distance in meters
  routeIds?: string[]; // route IDs used
  startStopId?: string; // start stop ID
  endStopId?: string; // end stop ID
}

export type RoutePreference = 'fastest' | 'least-walking' | 'least-transfers';

interface GraphEdge {
  to: string;
  weight: number; // time in minutes
  walkingDistance?: number; // walking distance in meters
  isTransfer?: boolean; // true if this is a transfer (walking)
  routeId?: string; // route ID if on a route
}

/**
 * Routing Service
 * Core routing engine using graph-based pathfinding
 * Implements Dijkstra's algorithm with preference-based weighting
 */
@Injectable()
export class RoutingService {
  constructor(
    private readonly stopsRepository: StopsRepository,
    private readonly routesRepository: RoutesRepository,
    private readonly prisma: PrismaService,
    private readonly googleMapsService: GoogleMapsService,
  ) {}

  /**
   * Plan a route between two stops by their IDs
   */
  async planBetweenStops(
    startStopId: string,
    endStopId: string,
    preference: RoutePreference = 'fastest',
  ): Promise<PlannedRoute> {
    const start = await this.stopsRepository.findById(startStopId);
    const end = await this.stopsRepository.findById(endStopId);

    if (!start || !end) {
      throw new Error('Start or end stop not found');
    }

    return this.planRoute(
      start.latitude,
      start.longitude,
      end.latitude,
      end.longitude,
      preference,
    );
  }

  /**
   * Plan a route with multiple waypoints
   */
  async planRouteWithWaypoints(
    waypoints: Array<{ lat: number; lng: number }>,
    preference: RoutePreference = 'fastest',
  ): Promise<PlannedRoute> {
    if (waypoints.length < 2) {
      throw new Error('At least 2 waypoints required');
    }

    const allSteps: RouteStep[] = [];
    let totalTime = 0;
    let totalTransfers = 0;
    let totalWalkingDistance = 0;
    const allRouteIds: string[] = [];

    // Plan route between each consecutive waypoint
    for (let i = 0; i < waypoints.length - 1; i++) {
      const segment = await this.planRoute(
        waypoints[i].lat,
        waypoints[i].lng,
        waypoints[i + 1].lat,
        waypoints[i + 1].lng,
        preference,
      );

      allSteps.push(...segment.steps);
      totalTime += segment.estimatedTime;
      totalTransfers += segment.transfers;
      totalWalkingDistance += segment.walkingDistance || 0;
      if (segment.routeIds) {
        allRouteIds.push(...segment.routeIds);
      }
    }

    return {
      estimatedTime: totalTime,
      transfers: totalTransfers,
      steps: allSteps,
      walkingDistance: totalWalkingDistance,
      routeIds: allRouteIds,
    };
  }

  /**
   * Plan a route from origin to destination
   * First tries Google Maps transit (uses Google's comprehensive transit database)
   * Falls back to our database if Google Maps fails
   */
  async planRoute(
    fromLat: number,
    fromLng: number,
    toLat: number,
    toLng: number,
    preference: RoutePreference = 'fastest',
  ): Promise<PlannedRoute> {
    // Try Google Maps transit first (uses Google's comprehensive transit data)
    // This includes Metro, Orange Line, Feeder buses (FRT11, MTRT1, FRT15, etc.)
    try {
      const googleRoute = await this.planRouteWithGoogleTransit(
        fromLat,
        fromLng,
        toLat,
        toLng,
        preference,
      );
      if (googleRoute && googleRoute.steps.length > 0) {
        console.log('✅ Using Google Maps transit directions');
        return googleRoute;
      }
    } catch (error) {
      console.warn('⚠️ Google Maps transit failed, falling back to database:', error);
    }

    // Fallback: Use our database
    // Step 1: Find nearest stops to origin and destination
    // Increased radius to 2000m (2km) to find more stops
    const originStops = await this.stopsRepository.findNearest(fromLat, fromLng, 2000, 10);
    const destinationStops = await this.stopsRepository.findNearest(toLat, toLng, 2000, 10);

    if (originStops.length === 0 || destinationStops.length === 0) {
      // Fallback: Direct walking route if no stops found
      return this.createWalkingRoute(fromLat, fromLng, toLat, toLng);
    }

    // Step 2: Build graph of stops and routes with preference-based weights
    const graph = await this.buildRouteGraph(preference);

    // Step 3: Find best path using Dijkstra's algorithm
    // Try multiple origin/destination stop combinations
    let bestRoute: PlannedRoute | null = null;
    let bestScore = Infinity;

    for (const originStop of originStops.slice(0, 3)) {
      for (const destStop of destinationStops.slice(0, 3)) {
        const path = this.findShortestPath(
          originStop.id,
          destStop.id,
          graph,
          preference,
        );

        if (path.length > 0) {
          const route = await this.convertPathToRoute(
            path,
            fromLat,
            fromLng,
            toLat,
            toLng,
            originStop.id,
            destStop.id,
            preference,
          );

          // Score based on preference
          const score = this.scoreRoute(route, preference);
          if (score < bestScore) {
            bestScore = score;
            bestRoute = route;
          }
        }
      }
    }

    if (bestRoute) {
      return bestRoute;
    }

    // Fallback: Direct walking route
    return this.createWalkingRoute(fromLat, fromLng, toLat, toLng);
  }

  /**
   * Build a graph representation of the transit network
   * Nodes: Stops
   * Edges: Route segments and transfers with preference-based weights
   */
  private async buildRouteGraph(
    preference: RoutePreference,
  ): Promise<Map<string, GraphEdge[]>> {
    const graph = new Map<string, GraphEdge[]>();

    // Get all routes with their stops
    const routes = await this.routesRepository.findAll();

    for (const route of routes) {
      const routeStops = await this.routesRepository.getRouteStops(route.id);

      // Add edges between consecutive stops in a route
      for (let i = 0; i < routeStops.length - 1; i++) {
        const fromStop = routeStops[i].stop;
        const toStop = routeStops[i + 1].stop;

        // Calculate time and distance
        const time = this.calculateTravelTime(fromStop, toStop, route.transportType);
        const distance = this.calculateDistance(
          fromStop.latitude,
          fromStop.longitude,
          toStop.latitude,
          toStop.longitude,
        );

        // Weight based on preference
        let weight = time;
        if (preference === 'least-walking') {
          // Penalize routes that might require more walking
          weight = time * 1.1; // Slight penalty
        } else if (preference === 'least-transfers') {
          // Prefer longer routes on same line (no transfer)
          weight = time * 0.9; // Slight bonus for staying on route
        }

        if (!graph.has(fromStop.id)) {
          graph.set(fromStop.id, []);
        }
        graph.get(fromStop.id)!.push({
          to: toStop.id,
          weight,
          routeId: route.id,
          isTransfer: false,
        });
      }
    }

    // Add transfer edges (walking connections)
    const allStops = await this.stopsRepository.findAll();
    const transfers = await this.getTransfers();

    for (const transfer of transfers) {
      const fromStop = allStops.find((s) => s.id === transfer.fromStopId);
      const toStop = allStops.find((s) => s.id === transfer.toStopId);

      if (fromStop && toStop) {
        const walkTime = transfer.estimatedTimeMin;
        const walkDistance = transfer.walkingDistanceM;

        // Weight based on preference
        let weight = walkTime;
        if (preference === 'least-walking') {
          // Heavy penalty for walking
          weight = walkTime * 3.0; // 3x penalty
        } else if (preference === 'least-transfers') {
          // Penalty for transfers (walking between stops)
          weight = walkTime * 2.0; // 2x penalty
        } else if (preference === 'fastest') {
          // Walking is slower, but sometimes necessary
          weight = walkTime * 1.2; // 1.2x penalty
        }

        if (!graph.has(fromStop.id)) {
          graph.set(fromStop.id, []);
        }
        graph.get(fromStop.id)!.push({
          to: toStop.id,
          weight,
          walkingDistance: walkDistance,
          isTransfer: true,
        });
      }
    }

    return graph;
  }

  /**
   * Get all transfers from database
   */
  private async getTransfers() {
    // This would ideally use a transfers repository
    // For now, we'll query directly
    const prisma = (this.stopsRepository as any).prisma;
    return prisma.transfer.findMany();
  }

  /**
   * Find shortest path using Dijkstra's algorithm with preference-based weights
   */
  private findShortestPath(
    startId: string,
    endId: string,
    graph: Map<string, GraphEdge[]>,
    preference: RoutePreference,
  ): string[] {
    const distances = new Map<string, number>();
    const previous = new Map<string, string>();
    const unvisited = new Set<string>();

    distances.set(startId, 0);
    unvisited.add(startId);

    // Initialize distances
    for (const node of graph.keys()) {
      if (node !== startId) {
        distances.set(node, Infinity);
      }
      unvisited.add(node);
    }

    while (unvisited.size > 0) {
      // Find unvisited node with smallest distance
      let current: string | null = null;
      let minDistance = Infinity;

      for (const node of unvisited) {
        const dist = distances.get(node) ?? Infinity;
        if (dist < minDistance) {
          minDistance = dist;
          current = node;
        }
      }

      if (!current || current === endId) break;

      unvisited.delete(current);

      const edges = graph.get(current);
      if (!edges) continue;

      for (const edge of edges) {
        if (!unvisited.has(edge.to)) continue;

        const alt = (distances.get(current) ?? Infinity) + edge.weight;
        if (alt < (distances.get(edge.to) ?? Infinity)) {
          distances.set(edge.to, alt);
          previous.set(edge.to, current);
        }
      }
    }

    // Reconstruct path
    const path: string[] = [];
    let current: string | null = endId;

    while (current) {
      path.unshift(current);
      current = previous.get(current) ?? null;
    }

    return path.length > 1 ? path : [];
  }

  /**
   * Score a route based on preference
   */
  private scoreRoute(route: PlannedRoute, preference: RoutePreference): number {
    switch (preference) {
      case 'fastest':
        return route.estimatedTime;
      case 'least-walking':
        return (route.walkingDistance || 0) / 1000; // Convert to km
      case 'least-transfers':
        return route.transfers * 1000 + route.estimatedTime; // Heavily penalize transfers
      default:
        return route.estimatedTime;
    }
  }

  /**
   * Convert path to route steps
   */
  private async convertPathToRoute(
    path: string[],
    fromLat: number,
    fromLng: number,
    toLat: number,
    toLng: number,
    startStopId: string,
    endStopId: string,
    preference: RoutePreference,
  ): Promise<PlannedRoute> {
    if (path.length === 0) {
      return this.createWalkingRoute(fromLat, fromLng, toLat, toLng);
    }

    const steps: RouteStep[] = [];
    let totalTime = 0;
    let transfers = 0;
    let totalWalkingDistance = 0;
    const routeIds: string[] = [];
    let currentRouteId: string | null = null;

    // Add initial walking step to first stop
    const firstStop = await this.stopsRepository.findById(path[0]);
    if (firstStop) {
      const walkTime = this.calculateWalkingTime(
        fromLat,
        fromLng,
        firstStop.latitude,
        firstStop.longitude,
      );
      const walkDistance = this.calculateDistance(
        fromLat,
        fromLng,
        firstStop.latitude,
        firstStop.longitude,
      );
      totalWalkingDistance += walkDistance;
      steps.push({
        type: 'walk',
        from: 'Current Location',
        to: firstStop.name,
        time: walkTime,
        distance: walkDistance,
      });
      totalTime += walkTime;
    }

    // Process path segments
    const graph = await this.buildRouteGraph(preference);

    for (let i = 0; i < path.length - 1; i++) {
      const fromStopId = path[i];
      const toStopId = path[i + 1];

      const fromStop = await this.stopsRepository.findById(fromStopId);
      const toStop = await this.stopsRepository.findById(toStopId);

      if (!fromStop || !toStop) continue;

      const edges = graph.get(fromStopId) || [];
      const edge = edges.find((e) => e.to === toStopId);

      if (edge) {
        if (edge.isTransfer) {
          // Walking transfer
          transfers++;
          totalWalkingDistance += edge.walkingDistance || 0;
          steps.push({
            type: 'walk',
            from: fromStop.name,
            to: toStop.name,
            time: Math.round(edge.weight),
            distance: edge.walkingDistance,
          });
          totalTime += Math.round(edge.weight);
          currentRouteId = null;
        } else if (edge.routeId) {
          // On a route
          if (currentRouteId !== edge.routeId) {
            // New route segment
            if (currentRouteId) {
              transfers++; // Transfer between routes
            }
            currentRouteId = edge.routeId;
            routeIds.push(edge.routeId);

            const route = await this.routesRepository.findByIdWithStops(edge.routeId);
            const routeName = route?.name || 'Unknown Route';
            const transportType = route?.transportType;
            
            // Map transport type to step type
            let stepType: RouteStepType = 'bus';
            if (transportType === 'METRO') {
              stepType = 'metro';
            } else if (transportType === 'ORANGE_LINE') {
              stepType = 'orange_line';
            } else if (transportType === 'FEEDER') {
              stepType = 'feeder';
            } else if (transportType === 'TRAIN') {
              stepType = 'train';
            }

            steps.push({
              type: stepType,
              from: fromStop.name,
              to: toStop.name,
              route: routeName,
              time: Math.round(edge.weight),
            });
            totalTime += Math.round(edge.weight);
          } else {
            // Continue on same route - update last step
            const lastStep = steps[steps.length - 1];
            if (lastStep) {
              lastStep.to = toStop.name;
              lastStep.time += Math.round(edge.weight);
            }
            totalTime += Math.round(edge.weight);
          }
        }
      }
    }

    // Add final walking step to destination
    const lastStop = await this.stopsRepository.findById(path[path.length - 1]);
    if (lastStop) {
      const walkTime = this.calculateWalkingTime(
        lastStop.latitude,
        lastStop.longitude,
        toLat,
        toLng,
      );
      const walkDistance = this.calculateDistance(
        lastStop.latitude,
        lastStop.longitude,
        toLat,
        toLng,
      );
      totalWalkingDistance += walkDistance;
      steps.push({
        type: 'walk',
        from: lastStop.name,
        to: 'Destination',
        time: walkTime,
        distance: walkDistance,
      });
      totalTime += walkTime;
    }

    return {
      estimatedTime: totalTime,
      transfers,
      steps,
      walkingDistance: totalWalkingDistance,
      routeIds: [...new Set(routeIds)], // Remove duplicates
      startStopId,
      endStopId,
    };
  }

  /**
   * Create a direct walking route
   */
  private createWalkingRoute(
    fromLat: number,
    fromLng: number,
    toLat: number,
    toLng: number,
  ): PlannedRoute {
    const distance = this.calculateDistance(fromLat, fromLng, toLat, toLng);
    const time = this.calculateWalkingTime(fromLat, fromLng, toLat, toLng);

    return {
      estimatedTime: time,
      transfers: 0,
      steps: [
        {
          type: 'walk',
          from: 'Current Location',
          to: 'Destination',
          time,
          distance,
        },
      ],
      walkingDistance: distance,
    };
  }

  /**
   * Calculate travel time between stops based on transport type
   */
  private calculateTravelTime(
    from: Stop,
    to: Stop,
    transportType: string,
  ): number {
    const distance = this.calculateDistance(from.latitude, from.longitude, to.latitude, to.longitude);

    // Average speeds (km/h converted to m/min)
    const speeds: Record<string, number> = {
      METRO: 30 * 1000 / 60, // 30 km/h = 500 m/min
      TRAIN: 40 * 1000 / 60, // 40 km/h = 667 m/min
      BUS: 20 * 1000 / 60,   // 20 km/h = 333 m/min
    };

    const speed = speeds[transportType] || 333; // Default to bus speed
    return Math.max(1, Math.round(distance / speed)); // At least 1 minute
  }

  /**
   * Calculate walking time between coordinates
   */
  private calculateWalkingTime(
    fromLat: number,
    fromLng: number,
    toLat: number,
    toLng: number,
  ): number {
    const distance = this.calculateDistance(fromLat, fromLng, toLat, toLng);
    const walkingSpeed = 83.33; // 5 km/h = 83.33 m/min
    return Math.max(1, Math.round(distance / walkingSpeed));
  }

  /**
   * Calculate distance between two coordinates (Haversine formula)
   */
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371000; // Earth radius in meters
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Plan route using Google Maps transit directions
   * Uses Google's comprehensive transit database (Metro, Orange Line, Feeder buses, etc.)
   */
  private async planRouteWithGoogleTransit(
    fromLat: number,
    fromLng: number,
    toLat: number,
    toLng: number,
    preference: RoutePreference,
  ): Promise<PlannedRoute | null> {
    try {
      const userId = 'guest'; // Use guest for transit queries
      const directions = await this.googleMapsService.getTransitDirections(
        userId,
        { lat: fromLat, lng: fromLng },
        { lat: toLat, lng: toLng },
      );

      if (!directions || !directions.routes || directions.routes.length === 0) {
        return null;
      }

      // Use the first route (Google provides multiple options)
      const route = directions.routes[0];
      const steps: RouteStep[] = [];
      let totalTime = 0;
      let transfers = 0;
      let totalWalkingDistance = 0;

      // Process each leg of the route
      for (const leg of route.legs) {
        for (const step of leg.steps) {
          if (step.travel_mode === 'WALKING') {
            const distance = step.distance?.value || 0; // in meters
            const duration = Math.round((step.duration?.value || 0) / 60); // convert to minutes
            totalWalkingDistance += distance;
            totalTime += duration;

            steps.push({
              type: 'walk',
              from: step.start_location ? 'Previous Location' : 'Current Location',
              to: step.end_location ? 'Next Location' : 'Destination',
              time: duration,
              distance: distance,
            });
          } else if (step.travel_mode === 'TRANSIT' && step.transit_details) {
            const transit = step.transit_details;
            const duration = Math.round((step.duration?.value || 0) / 60); // convert to minutes
            totalTime += duration;

            // Determine transit type from line
            const lineName = transit.line?.name || '';
            const lineShortName = transit.line?.short_name || '';
            let transitType: RouteStepType = 'bus';
            
            if (lineName.toUpperCase().includes('METRO') || lineName.toUpperCase().includes('MTR')) {
              transitType = 'metro';
            } else if (lineName.toUpperCase().includes('ORANGE') || lineName.toUpperCase().includes('ORANGE LINE')) {
              transitType = 'orange_line';
            } else if (lineName.toUpperCase().includes('FEEDER') || lineName.toUpperCase().includes('FRT') || lineName.toUpperCase().includes('SPEEDO')) {
              transitType = 'feeder';
            } else if (lineName.toUpperCase().includes('TRAIN')) {
              transitType = 'train';
            }

            // Count transfers
            if (steps.length > 0 && steps[steps.length - 1].type !== 'walk') {
              transfers++;
            }

            steps.push({
              type: transitType,
              from: transit.departure_stop?.name || 'Station',
              to: transit.arrival_stop?.name || 'Station',
              route: lineShortName || lineName,
              time: duration,
            });
          }
        }
      }

      // Update step "from" fields for better readability
      for (let i = 0; i < steps.length; i++) {
        if (i === 0 && steps[i].type === 'walk') {
          steps[i].from = 'Current Location';
        }
        if (i > 0 && steps[i].type === 'walk' && steps[i - 1].type !== 'walk') {
          steps[i].from = steps[i - 1].to;
        }
        if (i === steps.length - 1 && steps[i].type === 'walk') {
          steps[i].to = 'Destination';
        }
      }

      return {
        estimatedTime: totalTime,
        transfers,
        steps,
        walkingDistance: totalWalkingDistance,
      };
    } catch (error) {
      console.error('Error planning route with Google Maps transit:', error);
      return null;
    }
  }
}
