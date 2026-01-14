import { Injectable } from '@nestjs/common';
import { StopsRepository } from '../stops/stops.repository';
import { RoutesRepository } from '../routes/routes.repository';
import { Stop, Route } from '@prisma/client';

/**
 * Route Step Types
 */
export type RouteStepType = 'walk' | 'bus' | 'train' | 'metro';

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
}

export type RoutePreference = 'fastest' | 'least-walking' | 'least-transfers';

/**
 * Routing Service
 * Core routing engine using graph-based pathfinding
 * Implements Dijkstra's algorithm for route planning
 */
@Injectable()
export class RoutingService {
  constructor(
    private readonly stopsRepository: StopsRepository,
    private readonly routesRepository: RoutesRepository,
  ) {}

  /**
   * Plan a route from origin to destination
   * @param fromLat - Origin latitude
   * @param fromLng - Origin longitude
   * @param toLat - Destination latitude
   * @param toLng - Destination longitude
   * @param preference - Route preference (fastest, least-walking, least-transfers)
   */
  async planRoute(
    fromLat: number,
    fromLng: number,
    toLat: number,
    toLng: number,
    preference: RoutePreference = 'fastest',
  ): Promise<PlannedRoute> {
    // Step 1: Find nearest stops to origin and destination
    const originStops = await this.stopsRepository.findNearest(fromLat, fromLng, 500, 5);
    const destinationStops = await this.stopsRepository.findNearest(toLat, toLng, 500, 5);

    if (originStops.length === 0 || destinationStops.length === 0) {
      // Fallback: Direct walking route if no stops found
      return this.createWalkingRoute(fromLat, fromLng, toLat, toLng);
    }

    // Step 2: Build graph of stops and routes
    const graph = await this.buildRouteGraph();

    // Step 3: Find shortest path using Dijkstra's algorithm
    const bestRoute = this.findShortestPath(
      originStops[0].id,
      destinationStops[0].id,
      graph,
      preference,
    );

    // Step 4: Convert path to route steps
    return this.convertPathToRoute(bestRoute, fromLat, fromLng, toLat, toLng);
  }

  /**
   * Build a graph representation of the transit network
   * Nodes: Stops
   * Edges: Route segments and transfers
   */
  private async buildRouteGraph(): Promise<Map<string, Map<string, number>>> {
    const graph = new Map<string, Map<string, number>>();

    // Get all routes with their stops
    const routes = await this.routesRepository.findAll();

    for (const route of routes) {
      const routeStops = await this.routesRepository.getRouteStops(route.id);

      // Add edges between consecutive stops in a route
      for (let i = 0; i < routeStops.length - 1; i++) {
        const fromStop = routeStops[i].stop;
        const toStop = routeStops[i + 1].stop;

        // Calculate time based on distance (simplified - in production use actual schedule)
        const time = this.calculateTravelTime(fromStop, toStop, route.transportType);

        if (!graph.has(fromStop.id)) {
          graph.set(fromStop.id, new Map());
        }
        graph.get(fromStop.id)!.set(toStop.id, time);
      }
    }

    return graph;
  }

  /**
   * Find shortest path using Dijkstra's algorithm
   */
  private findShortestPath(
    startId: string,
    endId: string,
    graph: Map<string, Map<string, number>>,
    preference: RoutePreference,
  ): string[] {
    // Simplified Dijkstra implementation
    // In production, use a proper graph library or optimize this
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

      const neighbors = graph.get(current);
      if (!neighbors) continue;

      for (const [neighbor, weight] of neighbors.entries()) {
        if (!unvisited.has(neighbor)) continue;

        const alt = (distances.get(current) ?? Infinity) + weight;
        if (alt < (distances.get(neighbor) ?? Infinity)) {
          distances.set(neighbor, alt);
          previous.set(neighbor, current);
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
   * Convert path to route steps
   */
  private async convertPathToRoute(
    path: string[],
    fromLat: number,
    fromLng: number,
    toLat: number,
    toLng: number,
  ): Promise<PlannedRoute> {
    if (path.length === 0) {
      return this.createWalkingRoute(fromLat, fromLng, toLat, toLng);
    }

    const steps: RouteStep[] = [];
    let totalTime = 0;
    let transfers = 0;

    // Add initial walking step to first stop
    const firstStop = await this.stopsRepository.findById(path[0]);
    if (firstStop) {
      const walkTime = this.calculateWalkingTime(fromLat, fromLng, firstStop.latitude, firstStop.longitude);
      steps.push({
        type: 'walk',
        from: 'Current Location',
        to: firstStop.name,
        time: walkTime,
      });
      totalTime += walkTime;
    }

    // Add transit steps
    for (let i = 0; i < path.length - 1; i++) {
      const fromStop = await this.stopsRepository.findById(path[i]);
      const toStop = await this.stopsRepository.findById(path[i + 1]);

      if (!fromStop || !toStop) continue;

      // Find route connecting these stops
      const route = await this.findRouteBetweenStops(path[i], path[i + 1]);

      if (route) {
        steps.push({
          type: this.mapTransportType(route.transportType),
          from: fromStop.name,
          to: toStop.name,
          route: route.name,
          time: this.calculateTravelTime(fromStop, toStop, route.transportType),
        });
        totalTime += this.calculateTravelTime(fromStop, toStop, route.transportType);
        transfers++;
      } else {
        // Walking transfer
        const walkTime = this.calculateWalkingTime(
          fromStop.latitude,
          fromStop.longitude,
          toStop.latitude,
          toStop.longitude,
        );
        steps.push({
          type: 'walk',
          from: fromStop.name,
          to: toStop.name,
          time: walkTime,
        });
        totalTime += walkTime;
      }
    }

    // Add final walking step to destination
    const lastStop = await this.stopsRepository.findById(path[path.length - 1]);
    if (lastStop) {
      const walkTime = this.calculateWalkingTime(lastStop.latitude, lastStop.longitude, toLat, toLng);
      steps.push({
        type: 'walk',
        from: lastStop.name,
        to: 'Destination',
        time: walkTime,
      });
      totalTime += walkTime;
    }

    return {
      estimatedTime: Math.round(totalTime),
      transfers: Math.max(0, transfers - 1), // Subtract 1 as first route isn't a transfer
      steps,
    };
  }

  /**
   * Find route connecting two stops
   */
  private async findRouteBetweenStops(fromStopId: string, toStopId: string): Promise<Route | null> {
    const fromRoutes = await this.routesRepository.findRoutesByStop(fromStopId);
    const toRoutes = await this.routesRepository.findRoutesByStop(toStopId);

    // Find common route
    for (const route of fromRoutes) {
      if (toRoutes.some((r) => r.id === route.id)) {
        return route;
      }
    }

    return null;
  }

  /**
   * Calculate travel time between stops
   */
  private calculateTravelTime(from: Stop, to: Stop, transportType: string): number {
    const distance = this.calculateDistance(from.latitude, from.longitude, to.latitude, to.longitude);

    // Average speeds (km/h converted to m/min)
    const speeds: Record<string, number> = {
      BUS: 30 * 1000 / 60, // 30 km/h
      TRAIN: 50 * 1000 / 60, // 50 km/h
      METRO: 60 * 1000 / 60, // 60 km/h
    };

    const speed = speeds[transportType] || 30 * 1000 / 60;
    return Math.round(distance / speed);
  }

  /**
   * Calculate walking time between coordinates
   */
  private calculateWalkingTime(fromLat: number, fromLng: number, toLat: number, toLng: number): number {
    const distance = this.calculateDistance(fromLat, fromLng, toLat, toLng);
    const walkingSpeed = 5 * 1000 / 60; // 5 km/h in m/min
    return Math.round(distance / walkingSpeed);
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
   * Map transport type to route step type
   */
  private mapTransportType(transportType: string): RouteStepType {
    switch (transportType) {
      case 'BUS':
        return 'bus';
      case 'TRAIN':
        return 'train';
      case 'METRO':
        return 'metro';
      default:
        return 'walk';
    }
  }

  /**
   * Create a simple walking route
   */
  private createWalkingRoute(fromLat: number, fromLng: number, toLat: number, toLng: number): PlannedRoute {
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
        },
      ],
    };
  }
}

