import { Injectable } from '@nestjs/common';
import { PlannedRoute, RouteStep } from '../routing/routing.service';

/**
 * AI Navigation Service
 * Generates human-readable, step-by-step navigation instructions
 */
@Injectable()
export class NavigationService {
  /**
   * Generate AI-powered navigation instructions from a planned route
   */
  generateInstructions(route: PlannedRoute): string[] {
    const instructions: string[] = [];
    
    if (!route.steps || route.steps.length === 0) {
      return ['No route found. Please try different locations.'];
    }

    // Introduction
    instructions.push(`🚀 Your journey will take approximately <strong>${route.estimatedTime} minutes</strong>`);
    if (route.transfers > 0) {
      instructions.push(`🔄 You'll need to make <strong>${route.transfers} transfer${route.transfers > 1 ? 's' : ''}</strong>`);
    }
    if (route.walkingDistance) {
      const walkKm = (route.walkingDistance / 1000).toFixed(1);
      instructions.push(`🚶 Total walking distance: <strong>${walkKm} km</strong>`);
    }
    instructions.push(''); // Empty line

    // Step-by-step instructions
    route.steps.forEach((step, index) => {
      const stepNumber = index + 1;
      const instruction = this.formatStep(step, stepNumber, route.steps[index + 1]);
      instructions.push(instruction);
    });

    // Final instruction
    instructions.push('');
    instructions.push('✅ You have reached your destination!');

    return instructions;
  }

  /**
   * Format a single route step into human-readable instruction
   */
  private formatStep(step: RouteStep, stepNumber: number, nextStep?: RouteStep): string {
    const time = step.time;
    const distance = step.distance ? `${(step.distance / 1000).toFixed(2)} km` : '';

    switch (step.type) {
      case 'walk':
        if (step.from === 'Current Location') {
          // Initial walk to first stop
          return `📍 Step ${stepNumber}: Walk <strong>${time} minute${time > 1 ? 's' : ''}</strong>${distance ? ` (<strong>${distance}</strong>)` : ''} to reach <strong class="text-primary">${step.to}</strong> bus stop/station`;
        } else if (nextStep && nextStep.type !== 'walk') {
          // Transfer walk
          return `🚶 Step ${stepNumber}: Walk <strong>${time} minute${time > 1 ? 's' : ''}</strong>${distance ? ` (<strong>${distance}</strong>)` : ''} from <strong class="text-primary">${step.from}</strong> to <strong class="text-primary">${step.to}</strong> to catch your next ride`;
        } else {
          // Final walk to destination
          return `🚶 Step ${stepNumber}: Walk <strong>${time} minute${time > 1 ? 's' : ''}</strong>${distance ? ` (<strong>${distance}</strong>)` : ''} from <strong class="text-primary">${step.from}</strong> to your destination`;
        }

      case 'bus':
        return `🚌 Step ${stepNumber}: Take <strong class="text-primary">${step.route || 'Bus'}</strong> from <strong class="text-primary">${step.from}</strong> to <strong class="text-primary">${step.to}</strong> (<strong>${time} minutes</strong>)`;

      case 'feeder':
        return `🚌 Step ${stepNumber}: Take <strong class="text-primary">Feeder Bus (${step.route || 'Speedo'})</strong> from <strong class="text-primary">${step.from}</strong> to <strong class="text-primary">${step.to}</strong> (<strong>${time} minutes</strong>)`;

      case 'metro':
        return `🚇 Step ${stepNumber}: Take <strong class="text-primary">Metro Bus</strong> from <strong class="text-primary">${step.from}</strong> station to <strong class="text-primary">${step.to}</strong> station (<strong>${time} minutes</strong>)`;

      case 'orange_line':
        return `🚊 Step ${stepNumber}: Take <strong class="text-primary">Orange Line Metro</strong> from <strong class="text-primary">${step.from}</strong> station to <strong class="text-primary">${step.to}</strong> station (<strong>${time} minutes</strong>)`;

      case 'train':
        return `🚊 Step ${stepNumber}: Take <strong class="text-primary">${step.route || 'Train'}</strong> from <strong class="text-primary">${step.from}</strong> station to <strong class="text-primary">${step.to}</strong> station (<strong>${time} minutes</strong>)`;

      default:
        return `📍 Step ${stepNumber}: ${step.from} → ${step.to} (${time} minutes)`;
    }
  }

  /**
   * Get bus type from route name
   */
  private getBusTypeFromRoute(routeName: string): 'METRO' | 'FEEDER' | 'ORANGE_LINE' | 'UNKNOWN' {
    const upper = routeName.toUpperCase();
    if (upper.includes('FEEDER') || upper.includes('SPEEDO')) {
      return 'FEEDER';
    }
    if (upper.includes('ORANGE LINE') || upper.includes('ORANGE')) {
      return 'ORANGE_LINE';
    }
    if (upper.includes('METRO')) {
      return 'METRO';
    }
    return 'UNKNOWN';
  }

  /**
   * Generate a concise summary instruction
   */
  generateSummary(route: PlannedRoute): string {
    if (!route.steps || route.steps.length === 0) {
      return 'No route available';
    }

    const steps = route.steps;
    const firstStep = steps[0];
    const lastStep = steps[steps.length - 1];

    let summary = `Start from ${firstStep.from === 'Current Location' ? 'your location' : firstStep.from}`;
    
    steps.forEach((step, index) => {
      if (step.type === 'walk' && step.from === 'Current Location') {
        summary += `, walk ${step.time} min to ${step.to}`;
      } else if (step.type !== 'walk') {
        const transport = step.type === 'bus' ? 'bus' : step.type === 'metro' ? 'metro' : 'train';
        summary += `, take ${transport} to ${step.to}`;
      } else if (step.type === 'walk' && index === steps.length - 1) {
        summary += `, walk ${step.time} min to destination`;
      }
    });

    summary += `. Total time: ${route.estimatedTime} minutes.`;
    return summary;
  }
}

