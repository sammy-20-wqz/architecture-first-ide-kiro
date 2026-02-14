/**
 * Constraint Validator
 * Validates code against user-defined constraints
 */

import { ValidationResult, Violation, ArchitectureDefinition } from '../../types';

export class ConstraintValidator {
  validate(code: string, architecture: ArchitectureDefinition): ValidationResult {
    const violations: Violation[] = [];

    for (const constraint of architecture.constraints) {
      const result = this.checkConstraint(code, constraint);
      if (!result.passed) {
        violations.push({
          constraintId: constraint.id,
          description: result.description,
          severity: constraint.severity
        });
      }
    }

    return {
      passed: violations.length === 0,
      violations,
      timestamp: new Date()
    };
  }

  private checkConstraint(code: string, constraint: any): { passed: boolean; description: string } {
    const text = constraint.text.toLowerCase();

    // Communication constraints
    if (text.includes('grpc')) {
      if (!code.includes('grpc') && !code.includes('@grpc')) {
        return {
          passed: false,
          description: 'gRPC not found in code'
        };
      }
    }

    if (text.includes('rest')) {
      if (!code.includes('axios') && !code.includes('fetch') && !code.includes('http.get')) {
        return {
          passed: false,
          description: 'REST implementation not found'
        };
      }
    }

    // Security constraints
    if (text.includes('authentication') || text.includes('auth')) {
      if (!code.includes('auth') && !code.includes('jwt') && !code.includes('passport')) {
        return {
          passed: false,
          description: 'Authentication not implemented'
        };
      }
    }

    if (text.includes('encryption') || text.includes('https')) {
      if (code.includes('http://') && !code.includes('https://')) {
        return {
          passed: false,
          description: 'Unencrypted transmission detected'
        };
      }
    }

    // Performance constraints
    if (text.includes('latency') || text.includes('response time')) {
      if (!code.includes('cache') && !code.includes('async')) {
        return {
          passed: false,
          description: 'No caching or async patterns found'
        };
      }
    }

    // Layer boundary constraints
    if (text.includes('layer') || text.includes('boundary')) {
      if (code.includes('db.query') && code.includes('app.get')) {
        return {
          passed: false,
          description: 'Direct database access in presentation layer'
        };
      }
    }

    return {
      passed: true,
      description: 'Constraint satisfied'
    };
  }
}
