/**
 * Drift Detector
 * Detects when code deviates from approved blueprint
 */

import { DriftResult, Drift, Blueprint } from '../../types';

export class DriftDetector {
  detect(code: string, blueprint: Blueprint): DriftResult {
    const drifts: Drift[] = [];

    // Check for undefined components
    const componentDrifts = this.checkComponentBoundaries(code, blueprint);
    drifts.push(...componentDrifts);

    // Check for protocol violations
    const protocolDrifts = this.checkCommunicationPatterns(code, blueprint);
    drifts.push(...protocolDrifts);

    // Check for layer violations
    const layerDrifts = this.checkLayerBoundaries(code, blueprint);
    drifts.push(...layerDrifts);

    return {
      hasDrift: drifts.length > 0,
      drifts,
      driftScore: Math.min(drifts.length * 10, 100),
      timestamp: new Date()
    };
  }

  private checkComponentBoundaries(code: string, blueprint: Blueprint): Drift[] {
    const drifts: Drift[] = [];
    const definedComponents = new Set(blueprint.components.map(c => c.name));

    // Check for references to undefined components
    const componentPattern = /new\s+(\w+Service)|import.*from.*['"].*(\w+Service)/g;
    let match;

    while ((match = componentPattern.exec(code)) !== null) {
      const componentName = match[1] || match[2];
      if (componentName && !definedComponents.has(componentName)) {
        drifts.push({
          type: 'undefined_component',
          description: `Reference to undefined component: ${componentName}`,
          severity: 'warning'
        });
      }
    }

    return drifts;
  }

  private checkCommunicationPatterns(code: string, blueprint: Blueprint): Drift[] {
    const drifts: Drift[] = [];
    const allowedProtocols = blueprint.communicationPatterns.map(p => p.protocol.toLowerCase());

    // Check for REST usage
    if (code.includes('axios') || code.includes('fetch') || code.includes('http.get')) {
      if (!allowedProtocols.includes('rest')) {
        drifts.push({
          type: 'invalid_communication',
          description: 'Using REST but blueprint specifies different protocol',
          severity: 'critical'
        });
      }
    }

    // Check for gRPC usage
    if (code.includes('grpc') || code.includes('@grpc')) {
      if (!allowedProtocols.includes('grpc')) {
        drifts.push({
          type: 'invalid_communication',
          description: 'Using gRPC but blueprint specifies different protocol',
          severity: 'critical'
        });
      }
    }

    return drifts;
  }

  private checkLayerBoundaries(code: string, blueprint: Blueprint): Drift[] {
    const drifts: Drift[] = [];

    // Check for direct database access in microservices
    if (blueprint.architectureType === 'microservices') {
      if (code.includes('db.query') || code.includes('database.execute')) {
        drifts.push({
          type: 'layer_violation',
          description: 'Direct database access in microservices architecture',
          severity: 'critical'
        });
      }
    }

    return drifts;
  }
}
