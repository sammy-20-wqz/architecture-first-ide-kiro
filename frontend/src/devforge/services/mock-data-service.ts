/**
 * Mock Data Service
 * Provides realistic mock data for all external APIs
 */

import {
  ArchitectureDefinition,
  Blueprint,
  RiskScores,
  DriftResult,
  ValidationResult,
  GateResult
} from '../types';

export class MockDataService {
  /**
   * Generate mock blueprint from architecture definition
   */
  async generateBlueprint(arch: ArchitectureDefinition | null): Promise<Blueprint> {
    if (!arch) {
      throw new Error('Architecture definition required');
    }

    return {
      id: 'bp-' + Date.now(),
      architectureType: arch.architectureType,
      expectedScale: arch.expectedScale,
      components: [
        {
          name: 'API_Gateway',
          type: 'gateway',
          responsibilities: ['Route requests', 'Authentication', 'Rate limiting']
        },
        {
          name: 'User_Service',
          type: 'service',
          responsibilities: ['User management', 'Authentication']
        },
        {
          name: 'Product_Service',
          type: 'service',
          responsibilities: ['Product catalog', 'Inventory']
        },
        {
          name: 'Order_Service',
          type: 'service',
          responsibilities: ['Order processing', 'Payment']
        },
        {
          name: 'Cache_Layer',
          type: 'cache',
          responsibilities: ['Cache frequently accessed data']
        },
        {
          name: 'Database',
          type: 'database',
          responsibilities: ['Data persistence']
        }
      ],
      communicationPatterns: [
        {
          protocol: 'gRPC',
          description: 'Inter-service communication'
        },
        {
          protocol: 'REST',
          description: 'Client-to-API communication'
        }
      ],
      constraints: arch.constraints,
      estimatedMonthlyCost: this.estimateCost(arch.expectedScale),
      createdAt: new Date()
    };
  }

  /**
   * Estimate monthly AWS cost based on scale
   */
  private estimateCost(scale: number): number {
    // Mock cost calculation
    if (scale < 1000) return 100;
    if (scale < 10000) return 500;
    if (scale < 100000) return 1500;
    return 3000;
  }

  /**
   * Generate mock risk scores
   */
  generateRiskScores(code: string, blueprint: Blueprint | null): RiskScores {
    // Mock scoring based on code patterns
    let scalability = 0;
    let overengineering = 0;
    let security = 0;
    let consistency = 0;

    // Scalability: check for load balancing, caching, async
    if (!code.includes('loadBalancer')) scalability += 30;
    if (!code.includes('cache')) scalability += 25;
    if (!code.includes('async')) scalability += 20;

    // Overengineering: check complexity vs scale
    const complexity = code.split('\n').length;
    if (blueprint && blueprint.expectedScale < 1000 && complexity > 100) {
      overengineering += 40;
    }

    // Security: check for hardcoded credentials, exposed endpoints
    if (code.match(/password|api_key|secret/i)) security += 30;
    if (code.includes('http://')) security += 25;

    // Consistency: mock based on violations
    consistency = Math.random() * 30;

    return {
      scalability: Math.min(scalability, 100),
      overengineering: Math.min(overengineering, 100),
      security: Math.min(security, 100),
      consistency: Math.min(consistency, 100)
    };
  }

  /**
   * Generate mock drift detection result
   */
  generateDriftResult(code: string, blueprint: Blueprint | null): DriftResult {
    const drifts = [];

    // Mock drift detection
    if (code.includes('REST') && blueprint?.communicationPatterns.some(p => p.protocol === 'gRPC')) {
      drifts.push({
        type: 'invalid_communication' as const,
        description: 'Using REST but blueprint specifies gRPC',
        severity: 'critical' as const
      });
    }

    if (code.includes('directDB') && blueprint?.architectureType === 'microservices') {
      drifts.push({
        type: 'layer_violation' as const,
        description: 'Direct database access in microservices architecture',
        severity: 'critical' as const
      });
    }

    return {
      hasDrift: drifts.length > 0,
      drifts,
      driftScore: Math.min(drifts.length * 10, 100),
      timestamp: new Date()
    };
  }

  /**
   * Generate mock validation result
   */
  generateValidationResult(code: string, architecture: ArchitectureDefinition | null): ValidationResult {
    const violations = [];

    if (!architecture) {
      return {
        passed: true,
        violations: [],
        timestamp: new Date()
      };
    }

    // Mock constraint validation
    for (const constraint of architecture.constraints) {
      if (constraint.category === 'security' && !code.includes('auth')) {
        violations.push({
          constraintId: constraint.id,
          description: 'Missing authentication implementation',
          severity: 'critical'
        });
      }

      if (constraint.category === 'communication' && code.includes('REST') && constraint.text.includes('gRPC')) {
        violations.push({
          constraintId: constraint.id,
          description: 'Using REST instead of gRPC',
          severity: 'critical'
        });
      }
    }

    return {
      passed: violations.length === 0,
      violations,
      timestamp: new Date()
    };
  }

  /**
   * Generate mock security gate result
   */
  generateSecurityGateResult(code: string): GateResult {
    const issues = [];

    if (code.match(/password\s*=|api_key\s*=|secret\s*=/i)) {
      issues.push('Hardcoded credentials detected');
    }

    if (code.includes('http://') && !code.includes('https://')) {
      issues.push('Unencrypted transmission detected');
    }

    if (code.match(/app\.get\(['"]\/[^/]/)) {
      issues.push('Exposed endpoint without authentication');
    }

    return {
      triggered: issues.length > 0,
      type: 'security',
      message: issues.join('; '),
      suggestion: 'Move credentials to environment variables and use HTTPS',
      canOverride: true
    };
  }

  /**
   * Generate mock cost gate result
   */
  generateCostGateResult(currentCost: number, previousCost: number): GateResult {
    const costIncrease = ((currentCost - previousCost) / previousCost) * 100;

    return {
      triggered: costIncrease > 50 || currentCost > 1000,
      type: 'cost',
      message: `Cost spike: ${costIncrease.toFixed(1)}% increase (${currentCost} vs ${previousCost})`,
      suggestion: 'Consider switching to Fargate or reducing instance sizes',
      canOverride: true
    };
  }

  /**
   * Generate mock deployment risk gate result
   */
  generateDeploymentRiskGateResult(scores: RiskScores): GateResult {
    const criticalScores = Object.values(scores).filter(s => s > 80);

    return {
      triggered: criticalScores.length > 0,
      type: 'deployment_risk',
      message: `${criticalScores.length} critical risk scores detected`,
      suggestion: 'Address high-risk areas before deployment',
      canOverride: true
    };
  }
}
