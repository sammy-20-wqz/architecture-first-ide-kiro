/**
 * Risk Scorer
 * Calculates risk scores across four dimensions
 */

import { RiskScores, Blueprint, ValidationResult, DriftResult } from '../../types';

export class RiskScorer {
  calculateScores(
    code: string,
    blueprint: Blueprint,
    validationResult: ValidationResult,
    driftResult: DriftResult
  ): RiskScores {
    return {
      scalability: this.scoreScalability(code, blueprint),
      overengineering: this.scoreOverengineering(code, blueprint),
      security: this.scoreSecurity(code, blueprint),
      consistency: this.scoreConsistency(validationResult, driftResult)
    };
  }

  private scoreScalability(code: string, blueprint: Blueprint): number {
    let score = 0;
    const expectedScale = blueprint.expectedScale;

    // Check for load balancing
    if (expectedScale > 100000 && !code.includes('loadBalancer') && !code.includes('nginx')) {
      score += 30;
    }

    // Check for caching
    if (expectedScale > 50000 && !code.includes('cache') && !code.includes('redis')) {
      score += 25;
    }

    // Check for async patterns
    if (expectedScale > 10000 && !code.includes('async') && !code.includes('Promise')) {
      score += 20;
    }

    // Check for database optimization
    if (!code.includes('pagination') && !code.includes('limit')) {
      score += 10;
    }

    return Math.min(score, 100);
  }

  private scoreOverengineering(code: string, blueprint: Blueprint): number {
    let score = 0;
    const expectedScale = blueprint.expectedScale;
    const complexity = this.estimateComplexity(code);

    // High complexity for low scale = overengineering
    if (expectedScale < 1000 && complexity > 20) {
      score += 40;
    }

    if (expectedScale < 10000 && complexity > 50) {
      score += 30;
    }

    // Check for unnecessary abstractions
    const abstractionLayers = (code.match(/class|interface|abstract/g) || []).length;
    if (expectedScale < 5000 && abstractionLayers > 10) {
      score += 20;
    }

    return Math.min(score, 100);
  }

  private scoreSecurity(code: string, blueprint: Blueprint): number {
    let score = 0;

    // Check for hardcoded credentials
    if (code.match(/password\s*=|api_key\s*=|secret\s*=/i)) {
      score += 30;
    }

    // Check for unencrypted transmission
    if (code.includes('http://') && !code.includes('https://')) {
      score += 25;
    }

    // Check for exposed endpoints
    const exposedEndpoints = (code.match(/app\.get\(['"]\/[^/]/g) || []).length;
    const authenticatedEndpoints = (code.match(/auth|jwt|passport/g) || []).length;
    if (exposedEndpoints > authenticatedEndpoints) {
      score += 20;
    }

    // Check for SQL injection risks
    if (code.includes('query') && !code.includes('prepared') && !code.includes('parameterized')) {
      score += 15;
    }

    return Math.min(score, 100);
  }

  private scoreConsistency(validationResult: ValidationResult, driftResult: DriftResult): number {
    let score = 0;

    // Count violations
    const criticalViolations = validationResult.violations.filter(v => v.severity === 'critical').length;
    const warningViolations = validationResult.violations.filter(v => v.severity === 'warning').length;

    score += criticalViolations * 10;
    score += warningViolations * 5;

    // Count drifts
    const criticalDrifts = driftResult.drifts.filter(d => d.severity === 'critical').length;
    const warningDrifts = driftResult.drifts.filter(d => d.severity === 'warning').length;

    score += criticalDrifts * 10;
    score += warningDrifts * 5;

    return Math.min(score, 100);
  }

  private estimateComplexity(code: string): number {
    // Simple complexity estimation based on code metrics
    const lines = code.split('\n').length;
    const functions = (code.match(/function|=>|async/g) || []).length;
    const conditionals = (code.match(/if|else|switch|case/g) || []).length;

    return Math.round((lines / 10) + (functions * 2) + (conditionals * 1.5));
  }
}
