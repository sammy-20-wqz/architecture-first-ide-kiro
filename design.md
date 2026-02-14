# Design Document: DevForge - Kiro Architecture Extension

## Overview

DevForge is a Kiro extension that enforces architectural discipline by integrating three layers of intelligence into the IDE:

**Layer 1 (Visual Overlay)**: Side panels showing risk scores, architecture status, and mentor feedback
**Layer 2 (Validation Hooks)**: Passive monitoring of code generation with real-time drift detection and constraint validation
**Layer 3 (Critical Gates)**: Blocking modals for security vulnerabilities, deployment risks, and cost spikes

The extension uses Kiro's existing hook system to monitor code changes, integrates with AWS APIs for cost tracking, and provides real-time architectural feedback without interfering with the core IDE experience.

### Design Philosophy

1. **Non-Invasive Integration**: Augments Kiro without replacing core functionality
2. **Three-Layer Takeover**: Visual overlay → Passive monitoring → Critical gates
3. **Mock-First MVP**: All external APIs (AWS, Claude) are mocked for 2-hour hackathon delivery
4. **Progressive Enhancement**: Core validation works immediately, advanced features added incrementally
5. **Kiro-Native**: Uses Kiro's hooks, panels, and steering files for seamless integration

## High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Kiro IDE (Host)                           │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              DevForge Extension Layers                  │
│  │                                                          │
│  │  ┌──────────────────────────────────────────────────┐  │ │
│  │  │ LAYER 1: Visual Overlay (Always Present)         │  │ │
│  │  │ - Left panel: Risk scores, architecture status   │  │ │
│  │  │ - Right panel: Mentor console feedback           │  │ │
│  │  │ - Status bar: Cost ticker, drift indicators      │  │ │
│  │  └──────────────────────────────────────────────────┘  │ │
│  │                                                          │ │
│  │  ┌──────────────────────────────────────────────────┐  │ │
│  │  │ LAYER 2: Validation Hooks (Passive)              │  │ │
│  │  │ - Monitors postToolUse events                     │  │ │
│  │  │ - Runs drift detection on generated code         │  │ │
│  │  │ - Calculates risk scores in background           │  │ │
│  │  │ - Surfaces warnings in side panels               │  │ │
│  │  └──────────────────────────────────────────────────┘  │ │
│  │                                                          │ │
│  │  ┌──────────────────────────────────────────────────┐  │ │
│  │  │ LAYER 3: Critical Gates (Rare Interruptions)     │  │ │
│  │  │ - Security vulnerability detection               │  │ │
│  │  │ - Deployment risk assessment                     │  │ │
│  │  │ - Cost spike warnings                            │  │ │
│  │  │ - Blocking modal with override option            │  │ │
│  │  └──────────────────────────────────────────────────┘  │ │
│  │                                                          │ │
│  │  ┌──────────────────────────────────────────────────┐  │ │
│  │  │    Client-Side Validation Engine (Mocked)        │  │ │
│  │  │  ┌────────────┐  ┌────────────┐  ┌────────────┐ │  │ │
│  │  │  │ Constraint │  │   Drift    │  │    Risk    │ │  │ │
│  │  │  │ Validator  │  │  Detector  │  │  Scorer    │ │  │ │
│  │  │  └────────────┘  └────────────┘  └────────────┘ │  │ │
│  │  └──────────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Kiro Hooks (postToolUse)
                            │ Kiro Panels (side panels)
                            │ Kiro Steering (config)
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              External Services (Mocked for MVP)              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  AWS APIs (Cost tracking, security scanning)           │ │
│  │  Claude API (Blueprint generation, mentoring)          │ │
│  │  GitHub API (Code analysis, drift detection)           │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Component Breakdown

### Layer 1: Visual Overlay Components

#### 1. Risk Score Panel (Left Sidebar)

**Responsibility**: Displays real-time risk scores across four dimensions.

**Key Functions**:
- `renderRiskScores()`: Renders all four risk dimensions with color coding
- `renderScoreCard(dimension, score)`: Individual score card with gauge visualization
- `updateScores(newScores)`: Updates scores when code changes
- `renderArchitectureStatus()`: Shows current architecture definition status

**State**:
```typescript
interface RiskScorePanelState {
  scalabilityScore: number; // 0-100
  overengineeringScore: number; // 0-100
  securityScore: number; // 0-100
  consistencyScore: number; // 0-100
  lastUpdated: Date;
  architectureApproved: boolean;
}
```

**Visual Design**:
- Green (0-30): Healthy
- Yellow (31-70): Warning
- Red (71-100): Critical
- Animated gauge transitions on score changes

#### 2. Mentor Console Panel (Right Sidebar)

**Responsibility**: Displays structured feedback and recommendations.

**Key Functions**:
- `renderFeedbackList()`: Organized list of feedback items by severity
- `addFeedback(item)`: Adds new feedback item with animation
- `removeFeedback(id)`: Removes resolved feedback
- `renderRecommendation(text)`: Renders actionable recommendation

**State**:
```typescript
interface MentorConsolePanelState {
  feedbackItems: FeedbackItem[];
  severityFilter: 'all' | 'critical' | 'warning' | 'info';
  expandedItems: Set<string>;
}

interface FeedbackItem {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  recommendation: string;
  timestamp: Date;
}
```

#### 3. Status Bar Cost Ticker

**Responsibility**: Shows estimated monthly AWS cost with trend indicators.

**Key Functions**:
- `renderCostTicker()`: Fixed bottom bar showing current cost
- `updateCost(newCost)`: Updates cost with animated delta
- `expandCostBreakdown()`: Shows service-by-service breakdown
- `renderOptimizationSuggestion()`: Shows cost-saving recommendations

**State**:
```typescript
interface CostTickerState {
  estimatedMonthlyCost: number;
  costTrend: 'up' | 'down' | 'stable';
  costDelta: number;
  breakdown: Map<string, number>; // service -> cost
}
```

### Layer 2: Validation Hooks

#### 1. Drift Detection Hook

**Responsibility**: Monitors code changes and detects architectural drift.

**Integration**: Kiro `postToolUse` hook on write operations

**Core Algorithm**:
```typescript
class DriftDetector {
  detectDrift(code: string, blueprint: Blueprint): DriftResult {
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
}
```

**Drift Types**:
- Undefined component references
- Protocol mismatches (REST vs gRPC)
- Layer boundary violations
- Unexpected service dependencies

#### 2. Constraint Validator Hook

**Responsibility**: Validates code against user-defined constraints.

**Integration**: Kiro `postToolUse` hook on write operations

**Core Algorithm**:
```typescript
class ConstraintValidator {
  validate(code: string, constraints: SystemConstraint[]): ValidationResult {
    const violations: Violation[] = [];
    
    for (const constraint of constraints) {
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
}
```

**Constraint Types**:
- Protocol constraints (must use gRPC)
- Performance constraints (latency limits)
- Layer boundary constraints
- Security constraints (auth requirements)

#### 3. Risk Scorer Hook

**Responsibility**: Calculates risk scores based on code analysis.

**Integration**: Runs after drift detection and constraint validation

**Core Algorithm**:
```typescript
class RiskScorer {
  calculateRiskScores(
    code: string,
    blueprint: Blueprint,
    violations: Violation[],
    drifts: Drift[]
  ): RiskScores {
    return {
      scalability: this.scoreScalability(code, blueprint),
      overengineering: this.scoreOverengineering(code, blueprint),
      security: this.scoreSecurity(code, blueprint),
      consistency: this.scoreConsistency(violations, drifts)
    };
  }
  
  private scoreScalability(code: string, blueprint: Blueprint): number {
    let score = 0;
    const expectedScale = blueprint.expectedScale;
    
    // Check for load balancing patterns
    if (expectedScale > 100000 && !code.includes('loadBalancer')) score += 30;
    
    // Check for caching patterns
    if (expectedScale > 50000 && !code.includes('cache')) score += 25;
    
    // Check for async patterns
    if (expectedScale > 10000 && !code.includes('async')) score += 20;
    
    return Math.min(score, 100);
  }
  
  private scoreOverengineering(code: string, blueprint: Blueprint): number {
    let score = 0;
    const expectedScale = blueprint.expectedScale;
    const complexity = this.estimateComplexity(code);
    
    // High complexity for low scale = overengineering
    if (expectedScale < 1000 && complexity > 20) score += 40;
    if (expectedScale < 10000 && complexity > 50) score += 30;
    
    return Math.min(score, 100);
  }
  
  private scoreSecurity(code: string, blueprint: Blueprint): number {
    let score = 0;
    
    // Check for hardcoded credentials
    if (code.match(/password|api_key|secret/i)) score += 30;
    
    // Check for unencrypted transmission
    if (code.includes('http://') && !code.includes('https://')) score += 25;
    
    // Check for exposed endpoints
    if (code.match(/app\.get\(['"]\/[^/]/)) score += 20;
    
    return Math.min(score, 100);
  }
  
  private scoreConsistency(violations: Violation[], drifts: Drift[]): number {
    let score = 0;
    
    const criticalViolations = violations.filter(v => v.severity === 'critical').length;
    const warningViolations = violations.filter(v => v.severity === 'warning').length;
    const criticalDrifts = drifts.filter(d => d.severity === 'critical').length;
    
    score += criticalViolations * 10;
    score += warningViolations * 5;
    score += criticalDrifts * 10;
    
    return Math.min(score, 100);
  }
}
```

**Risk Dimensions**:
1. **Scalability Risk**: Expected scale vs implementation patterns
2. **Overengineering Risk**: Complexity vs actual needs
3. **Security Risk**: Exposed endpoints, hardcoded credentials, unencrypted data
4. **Consistency Risk**: Violations and drifts from approved blueprint

### Layer 3: Critical Gates

#### 1. Security Gate

**Responsibility**: Blocks deployment if critical security issues detected.

**Trigger Conditions**:
- Hardcoded credentials detected
- Exposed endpoints without authentication
- Unencrypted data transmission
- Public S3 buckets

**Modal UI**:
```
┌─────────────────────────────────────┐
│ 🔒 SECURITY GATE TRIGGERED          │
├─────────────────────────────────────┤
│ Issue: Hardcoded API key detected   │
│ Location: src/config.ts:42          │
│ Risk: Credential exposure           │
│                                     │
│ Recommendation:                     │
│ Move to environment variables       │
│                                     │
│ [Fix] [Override with reason] [Cancel]
└─────────────────────────────────────┘
```

#### 2. Cost Gate

**Responsibility**: Warns if estimated cost exceeds threshold.

**Trigger Conditions**:
- Monthly cost > $1000
- Cost spike > 50% from previous estimate
- Unused resources detected

**Modal UI**:
```
┌─────────────────────────────────────┐
│ 💰 COST SPIKE WARNING               │
├─────────────────────────────────────┤
│ Estimated monthly cost: $1,250      │
│ Previous estimate: $800             │
│ Increase: +56%                      │
│                                     │
│ Recommendation:                     │
│ Switch EC2 to Fargate: Save $40/mo  │
│                                     │
│ [Optimize] [Override] [Cancel]      │
└─────────────────────────────────────┘
```

#### 3. Deployment Risk Gate

**Responsibility**: Blocks deployment if risk scores too high.

**Trigger Conditions**:
- Any risk score > 80
- Multiple critical violations
- Unresolved architectural drift

**Modal UI**:
```
┌─────────────────────────────────────┐
│ ⚠️  DEPLOYMENT RISK GATE             │
├─────────────────────────────────────┤
│ Scalability Risk: 85 (CRITICAL)     │
│ Issue: No load balancing for 100K   │
│ users                               │
│                                     │
│ [Fix Issues] [Override] [Cancel]    │
└─────────────────────────────────────┘
```

## Data Models

### Core Data Structures

```typescript
// Architecture Definition
interface ArchitectureDefinition {
  id: string;
  name: string;
  expectedScale: number;
  architectureType: 'monolith' | 'microservices';
  constraints: SystemConstraint[];
  approved: boolean;
  createdAt: Date;
}

interface SystemConstraint {
  id: string;
  text: string;
  severity: 'critical' | 'warning' | 'info';
  category: 'communication' | 'performance' | 'layer_boundary' | 'security';
}

// Architecture Blueprint (Generated)
interface Blueprint {
  id: string;
  architectureType: 'monolith' | 'microservices';
  expectedScale: number;
  components: Component[];
  communicationPatterns: CommunicationPattern[];
  constraints: SystemConstraint[];
  estimatedMonthlyCost: number;
  createdAt: Date;
}

interface Component {
  name: string;
  type: 'service' | 'layer' | 'gateway' | 'cache' | 'database';
  responsibilities: string[];
}

interface CommunicationPattern {
  protocol: 'REST' | 'gRPC' | 'Function_Call' | 'Message_Queue';
  description: string;
}

// Validation Results
interface ValidationResult {
  passed: boolean;
  violations: Violation[];
  timestamp: Date;
}

interface Violation {
  constraintId: string;
  description: string;
  severity: 'critical' | 'warning' | 'info';
}

// Drift Detection
interface DriftResult {
  hasDrift: boolean;
  drifts: Drift[];
  driftScore: number; // 0-100
  timestamp: Date;
}

interface Drift {
  type: 'undefined_component' | 'invalid_communication' | 'layer_violation';
  description: string;
  severity: 'critical' | 'warning';
}

// Risk Scores
interface RiskScores {
  scalability: number; // 0-100
  overengineering: number; // 0-100
  security: number; // 0-100
  consistency: number; // 0-100
}

// Feedback Item
interface FeedbackItem {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  recommendation: string;
  timestamp: Date;
}
```

## Data Flow

### 1. Architecture Definition Flow

```
User defines constraints in Kiro steering file
                ↓
DevForge reads .kiro/steering/devforge-config.md
                ↓
Parse architecture definition
                ↓
Store in workspace state
                ↓
Generate blueprint (mocked)
                ↓
Display in Layer 1 panels
```

### 2. Real-Time Validation Flow

```
Kiro postToolUse hook triggered (code written)
                ↓
Layer 2: Drift Detector runs
                ↓
Layer 2: Constraint Validator runs
                ↓
Layer 2: Risk Scorer runs
                ↓
Update Layer 1 panels with results
                ↓
Check Layer 3 gate conditions
                ↓
If critical: Show blocking modal
If warning: Show in mentor console
```

### 3. Cost Tracking Flow

```
User modifies architecture
                ↓
Mock AWS API returns cost estimate
                ↓
Update cost ticker in status bar
                ↓
Check if cost spike > 50%
                ↓
If yes: Trigger cost gate modal
If no: Update ticker silently
```

## MVP Feature Mapping

### Must Have (Hackathon Delivery)

1. **Architecture Constraint Definition** (Feature 1)
   - Steering file format for defining constraints
   - UI panel to view/edit constraints

2. **Blueprint Generator** (Feature 2)
   - Mock blueprint generation from constraints
   - Display component diagram and cost estimate

3. **Architecture Drift Detector** (Feature 3)
   - Real-time drift detection on code changes
   - Drift score calculation

4. **Risk Score Dashboard** (Feature 9)
   - Four-dimension risk scoring
   - Live updates in Layer 1 panel

5. **Scale Collapse Predictor** (Feature 10)
   - Predict breaking point at different scales
   - Show specific failure points

6. **Chaos Monkey Agent** (Feature 16)
   - Security vulnerability scanning (mocked)
   - Auto-generate fix suggestions

7. **Cost Whisperer** (Feature 21)
   - Live cost estimation (mocked AWS API)
   - Cost ticker in status bar

8. **Kiro Comprehension Validator** (Feature 27)
   - Optional quiz after code generation
   - Track understanding score

9. **LeetCode Pattern Mapper** (Feature 29)
   - Detect algorithmic patterns in code
   - Generate practice problems

### Should Have (Post-Hackathon)

10. **Failure Prediction Timeline** (Feature 11)
11. **Argue With Me Mode** (Feature 23)
12. **Anti-Vibe Critic** (Feature 24)
13. **Smart Contract Vulnerability Scanner** (Feature 38)
14. **On-Chain vs Off-Chain Optimizer** (Feature 39)
15. **ML Pipeline Validator** (Feature 41)

## Implementation Approach

### Phase 1: Layer 1 (Visual Overlay) - 30 minutes
- Create React components for risk panel, mentor console, cost ticker
- Mock data for initial display
- Integrate with Kiro side panels

### Phase 2: Layer 2 (Validation Hooks) - 60 minutes
- Implement drift detector (pattern matching)
- Implement constraint validator (regex-based)
- Implement risk scorer (heuristic-based)
- Create Kiro hook for postToolUse events
- Wire up to Layer 1 panels

### Phase 3: Layer 3 (Critical Gates) - 30 minutes
- Implement security gate modal
- Implement cost gate modal
- Implement deployment risk gate modal
- Add override mechanism with justification

### Mocking Strategy

All external APIs mocked with realistic data:
- AWS Cost API → Returns $500-$2000 estimates
- Claude API → Returns pre-generated blueprints
- GitHub API → Returns mock drift detection results
- Security scanner → Returns mock vulnerability list

Real integrations added post-hackathon.
