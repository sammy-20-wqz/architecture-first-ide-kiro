# Design Document: Architecture-First IDE

## Overview

The Architecture-First IDE is a web-based development environment designed as a hackathon prototype that enforces architectural discipline through real-time validation and feedback. The system uses a React frontend for the IDE interface and a lightweight Node.js backend for architecture processing, constraint validation, and risk scoring.

The design prioritizes simplicity and modularity suitable for rapid prototyping while maintaining clear separation of concerns. The architecture avoids unnecessary complexity (no Kubernetes, no distributed systems, no microservices) and focuses on delivering core functionality through a clean, testable codebase.

### Design Philosophy

1. **Modular Prototype Architecture**: Components are loosely coupled and independently testable
2. **Client-Heavy Processing**: Most validation and analysis happens in the browser to minimize backend complexity
3. **Simple Deployment**: Single-server deployment with minimal infrastructure requirements
4. **Progressive Enhancement**: Core features work immediately, advanced features can be added incrementally

## High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Browser (Client)                         │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              React Frontend Application                 │ │
│  │                                                          │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │ │
│  │  │ Architecture │  │    Code      │  │   Mentor     │ │ │
│  │  │   Builder    │  │   Editor     │  │   Console    │ │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘ │ │
│  │                                                          │ │
│  │  ┌──────────────────────────────────────────────────┐  │ │
│  │  │         Client-Side Validation Engine            │  │ │
│  │  │  ┌────────────┐  ┌────────────┐  ┌────────────┐ │  │ │
│  │  │  │ Constraint │  │   Drift    │  │    Risk    │ │  │ │
│  │  │  │ Validator  │  │  Detector  │  │  Scorer    │ │  │ │
│  │  │  └────────────┘  └────────────┘  └────────────┘ │  │ │
│  │  └──────────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ REST API (JSON)
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  Node.js Backend Server                      │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                    Express API                          │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │ │
│  │  │  Blueprint   │  │   Project    │  │    User      │ │ │
│  │  │  Generator   │  │   Manager    │  │   Manager    │ │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘ │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              File-Based Data Storage                    │ │
│  │         (JSON files for prototype simplicity)           │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Architecture Rationale

**Client-Heavy Design**: Most processing happens in the browser because:
- Real-time validation requires sub-second response times
- Network latency would violate 2-second performance requirements
- Reduces backend complexity and scaling concerns for prototype
- Enables offline-capable development in future iterations

**Lightweight Backend**: The Node.js backend handles:
- Blueprint generation (one-time operation, can tolerate higher latency)
- Project persistence and retrieval
- User session management
- Data that must be shared across sessions or devices


## Component Breakdown

### Frontend Components

#### 1. Architecture Builder Component

**Responsibility**: Provides UI for defining architecture parameters and constraints.

**Key Functions**:
- `renderScaleInput()`: Renders numeric input for expected user count
- `renderArchitectureTypeSelector()`: Renders dropdown for monolith/microservices selection
- `renderConstraintEditor()`: Renders text area for constraint definition
- `validateConstraintSyntax(constraint: string): ValidationResult`: Client-side constraint syntax validation
- `saveArchitectureDefinition(definition: ArchitectureDefinition): Promise<void>`: Persists definition to backend
- `requestBlueprintGeneration(): Promise<Blueprint>`: Triggers blueprint generation

**State Management**:
```typescript
interface ArchitectureBuilderState {
  expectedScale: number | null;
  architectureType: 'monolith' | 'microservices' | null;
  constraints: SystemConstraint[];
  validationErrors: Map<string, string>;
  blueprintApproved: boolean;
}
```

#### 2. Code Editor Component

**Responsibility**: Provides code editing interface with real-time validation feedback.

**Key Functions**:
- `renderEditor()`: Renders Monaco Editor instance
- `onCodeChange(newCode: string): void`: Handles code modifications
- `highlightViolations(violations: Violation[]): void`: Applies visual indicators to violating code
- `getCodeContent(): string`: Returns current code content
- `setCodeContent(code: string): void`: Sets editor content

**Integration Points**:
- Triggers validation engine on code changes (debounced to 500ms)
- Receives violation highlights from drift detector and constraint validator
- Sends code content to validation engine

#### 3. Mentor Console Component

**Responsibility**: Displays structured feedback and guidance.

**Key Functions**:
- `renderFeedbackList()`: Renders organized list of feedback items
- `addFeedback(feedback: FeedbackItem): void`: Adds new feedback item
- `removeFeedback(feedbackId: string): void`: Removes resolved feedback
- `organizeBySeverity(items: FeedbackItem[]): GroupedFeedback`: Groups feedback by severity
- `renderRecommendation(recommendation: string): JSX.Element`: Renders actionable recommendation

**State Management**:
```typescript
interface MentorConsoleState {
  feedbackItems: FeedbackItem[];
  severityFilter: 'all' | 'critical' | 'warning' | 'informational';
  expandedItems: Set<string>;
}

interface FeedbackItem {
  id: string;
  severity: 'critical' | 'warning' | 'informational';
  title: string;
  description: string;
  recommendation: string;
  location?: CodeLocation;
  timestamp: Date;
}
```

#### 4. Risk Dashboard Component

**Responsibility**: Displays calculated risk scores with visual indicators.

**Key Functions**:
- `renderRiskScores()`: Renders all four risk dimensions
- `renderScoreCard(score: RiskScore): JSX.Element`: Renders individual score with color coding
- `renderScoreTrend(history: number[]): JSX.Element`: Renders score trend over time
- `highlightWarningScores(scores: RiskScores): RiskScores`: Identifies scores >= 70

**State Management**:
```typescript
interface RiskDashboardState {
  scalabilityScore: number;
  overengineeringScore: number;
  securityScore: number;
  consistencyScore: number;
  scoreHistory: Map<string, number[]>;
  lastUpdated: Date;
}
```

### Client-Side Validation Engine

#### 1. Constraint Validator

**Responsibility**: Validates code against user-defined system constraints.

**Core Algorithm**:
```typescript
class ConstraintValidator {
  private constraints: ParsedConstraint[];
  
  validate(code: string, constraints: SystemConstraint[]): ValidationResult {
    const ast = parseCodeToAST(code);
    const violations: Violation[] = [];
    
    for (const constraint of constraints) {
      const parsedConstraint = this.parseConstraint(constraint);
      const result = this.checkConstraint(ast, parsedConstraint);
      
      if (!result.passed) {
        violations.push({
          constraintId: constraint.id,
          location: result.location,
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
  
  private parseConstraint(constraint: SystemConstraint): ParsedConstraint {
    // Parse natural language constraint into structured rule
    const scope = this.extractScope(constraint.text);
    const ruleType = this.identifyRuleType(constraint.text);
    const criteria = this.extractCriteria(constraint.text);
    
    return { scope, ruleType, criteria };
  }
  
  private checkConstraint(ast: AST, constraint: ParsedConstraint): CheckResult {
    switch (constraint.ruleType) {
      case 'protocol':
        return this.checkProtocolConstraint(ast, constraint);
      case 'performance':
        return this.checkPerformanceConstraint(ast, constraint);
      case 'layer_boundary':
        return this.checkLayerBoundaryConstraint(ast, constraint);
      case 'security':
        return this.checkSecurityConstraint(ast, constraint);
      default:
        return { passed: true };
    }
  }
}
```

**Constraint Parsing Logic**:
- Extract scope using keyword matching ("all services", "database access", "API endpoints")
- Identify rule type from action verbs ("must use", "must not exceed", "must go through")
- Extract criteria from constraint text (protocol names, numeric limits, layer names)

**Validation Techniques**:

1. **Protocol Validation**:
   - Search AST for import statements
   - Identify communication library usage (axios, grpc, fetch)
   - Match detected protocol against required protocol

2. **Performance Validation**:
   - Detect nested loops (O(n²) or worse complexity)
   - Identify synchronous I/O operations
   - Flag database queries without pagination

3. **Layer Boundary Validation**:
   - Build import dependency graph
   - Check for cross-layer imports
   - Detect direct database access from presentation layer

4. **Security Validation**:
   - Detect endpoints without authentication decorators
   - Identify hardcoded credentials (regex patterns)
   - Flag unencrypted data transmission

#### 2. Drift Detector

**Responsibility**: Detects when code deviates from approved architecture blueprint.

**Core Algorithm**:
```typescript
class DriftDetector {
  private blueprint: Blueprint;
  
  detectDrift(code: string, blueprint: Blueprint): DriftResult {
    const ast = parseCodeToAST(code);
    const drifts: Drift[] = [];
    
    // Check component boundaries
    const componentDrifts = this.checkComponentBoundaries(ast, blueprint);
    drifts.push(...componentDrifts);
    
    // Check communication patterns
    const communicationDrifts = this.checkCommunicationPatterns(ast, blueprint);
    drifts.push(...communicationDrifts);
    
    // Check layer violations (for monolith)
    if (blueprint.architectureType === 'monolith') {
      const layerDrifts = this.checkLayerViolations(ast, blueprint);
      drifts.push(...layerDrifts);
    }
    
    // Check service boundaries (for microservices)
    if (blueprint.architectureType === 'microservices') {
      const serviceDrifts = this.checkServiceBoundaries(ast, blueprint);
      drifts.push(...serviceDrifts);
    }
    
    return {
      hasDrift: drifts.length > 0,
      drifts,
      timestamp: new Date()
    };
  }
  
  private checkComponentBoundaries(ast: AST, blueprint: Blueprint): Drift[] {
    const drifts: Drift[] = [];
    const definedComponents = new Set(blueprint.components.map(c => c.name));
    
    // Extract component references from code
    const referencedComponents = this.extractComponentReferences(ast);
    
    // Find references to undefined components
    for (const ref of referencedComponents) {
      if (!definedComponents.has(ref.name)) {
        drifts.push({
          type: 'undefined_component',
          location: ref.location,
          description: `Reference to undefined component: ${ref.name}`,
          severity: 'warning'
        });
      }
    }
    
    return drifts;
  }
  
  private checkCommunicationPatterns(ast: AST, blueprint: Blueprint): Drift[] {
    const drifts: Drift[] = [];
    const allowedPatterns = new Set(blueprint.communicationPatterns.map(p => p.protocol));
    
    // Extract communication calls from code
    const communicationCalls = this.extractCommunicationCalls(ast);
    
    // Check if protocols match allowed patterns
    for (const call of communicationCalls) {
      if (!allowedPatterns.has(call.protocol)) {
        drifts.push({
          type: 'invalid_communication',
          location: call.location,
          description: `Using ${call.protocol} but blueprint specifies ${Array.from(allowedPatterns).join(', ')}`,
          severity: 'critical'
        });
      }
    }
    
    return drifts;
  }
}
```

**Drift Detection Strategies**:
- Component boundary violations: References to components not in blueprint
- Communication pattern violations: Using protocols not specified in blueprint
- Layer violations: Imports crossing defined layer boundaries
- Service boundary violations: Cross-service database access

#### 3. Risk Scorer

**Responsibility**: Calculates risk scores across four dimensions.

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
      scalability: this.calculateScalabilityRisk(code, blueprint),
      overengineering: this.calculateOverengineeringRisk(code, blueprint),
      security: this.calculateSecurityRisk(code, blueprint),
      consistency: this.calculateConsistencyRisk(violations, drifts)
    };
  }
  
  private calculateScalabilityRisk(code: string, blueprint: Blueprint): number {
    const ast = parseCodeToAST(code);
    let riskScore = 0;
    
    // Factor 1: Expected scale vs implementation patterns
    const expectedScale = blueprint.expectedScale;
    const hasLoadBalancing = this.detectLoadBalancing(ast);
    const hasCaching = this.detectCaching(ast);
    const hasAsyncProcessing = this.detectAsyncProcessing(ast);
    
    if (expectedScale > 100000 && !hasLoadBalancing) riskScore += 30;
    if (expectedScale > 50000 && !hasCaching) riskScore += 25;
    if (expectedScale > 10000 && !hasAsyncProcessing) riskScore += 20;
    
    // Factor 2: Database query patterns
    const hasNPlusOneQueries = this.detectNPlusOneQueries(ast);
    const hasFullTableScans = this.detectFullTableScans(ast);
    
    if (hasNPlusOneQueries) riskScore += 15;
    if (hasFullTableScans) riskScore += 10;
    
    return Math.min(riskScore, 100);
  }
  
  private calculateOverengineeringRisk(code: string, blueprint: Blueprint): number {
    const ast = parseCodeToAST(code);
    let riskScore = 0;
    
    // Factor 1: Complexity vs scale
    const cyclomaticComplexity = this.calculateCyclomaticComplexity(ast);
    const expectedScale = blueprint.expectedScale;
    
    // High complexity for low scale = overengineering
    if (expectedScale < 1000 && cyclomaticComplexity > 20) riskScore += 40;
    if (expectedScale < 10000 && cyclomaticComplexity > 50) riskScore += 30;
    
    // Factor 2: Unnecessary abstractions
    const abstractionLayers = this.countAbstractionLayers(ast);
    if (expectedScale < 5000 && abstractionLayers > 5) riskScore += 30;
    
    return Math.min(riskScore, 100);
  }
  
  private calculateSecurityRisk(code: string, blueprint: Blueprint): number {
    const ast = parseCodeToAST(code);
    let riskScore = 0;
    
    // Factor 1: Exposed endpoints without authentication
    const exposedEndpoints = this.detectExposedEndpoints(ast);
    const authenticatedEndpoints = this.detectAuthenticatedEndpoints(ast);
    const exposureRatio = (exposedEndpoints - authenticatedEndpoints) / Math.max(exposedEndpoints, 1);
    
    riskScore += exposureRatio * 40;
    
    // Factor 2: Hardcoded credentials
    const hasHardcodedCredentials = this.detectHardcodedCredentials(ast);
    if (hasHardcodedCredentials) riskScore += 30;
    
    // Factor 3: Unencrypted data transmission
    const hasUnencryptedTransmission = this.detectUnencryptedTransmission(ast);
    if (hasUnencryptedTransmission) riskScore += 30;
    
    return Math.min(riskScore, 100);
  }
  
  private calculateConsistencyRisk(violations: Violation[], drifts: Drift[]): number {
    let riskScore = 0;
    
    // Factor 1: Number of violations
    const criticalViolations = violations.filter(v => v.severity === 'critical').length;
    const warningViolations = violations.filter(v => v.severity === 'warning').length;
    
    riskScore += criticalViolations * 10;
    riskScore += warningViolations * 5;
    
    // Factor 2: Number of drifts
    const criticalDrifts = drifts.filter(d => d.severity === 'critical').length;
    const warningDrifts = drifts.filter(d => d.severity === 'warning').length;
    
    riskScore += criticalDrifts * 10;
    riskScore += warningDrifts * 5;
    
    return Math.min(riskScore, 100);
  }
}
```

**Risk Scoring Factors**:

1. **Scalability Risk**:
   - Expected scale vs implementation patterns (load balancing, caching, async)
   - Database query patterns (N+1 queries, full table scans)
   - Synchronous vs asynchronous processing

2. **Overengineering Risk**:
   - Cyclomatic complexity vs expected scale
   - Number of abstraction layers vs expected scale
   - Premature optimization indicators

3. **Security Risk**:
   - Ratio of exposed to authenticated endpoints
   - Presence of hardcoded credentials
   - Unencrypted data transmission

4. **Consistency Risk**:
   - Number and severity of constraint violations
   - Number and severity of architectural drifts

### Backend Components

#### 1. Blueprint Generator

**Responsibility**: Generates structured architecture blueprints from definitions.

**Core Algorithm**:
```typescript
class BlueprintGenerator {
  generate(definition: ArchitectureDefinition): Blueprint {
    const components = this.generateComponents(definition);
    const communicationPatterns = this.generateCommunicationPatterns(definition);
    const layers = this.generateLayers(definition);
    
    return {
      id: generateUUID(),
      architectureType: definition.architectureType,
      expectedScale: definition.expectedScale,
      components,
      communicationPatterns,
      layers,
      constraints: definition.constraints,
      createdAt: new Date()
    };
  }
  
  private generateComponents(definition: ArchitectureDefinition): Component[] {
    if (definition.architectureType === 'microservices') {
      return this.generateMicroservicesComponents(definition);
    } else {
      return this.generateMonolithComponents(definition);
    }
  }
  
  private generateMicroservicesComponents(definition: ArchitectureDefinition): Component[] {
    // Generate standard microservices components based on scale
    const components: Component[] = [];
    
    // Always include API Gateway
    components.push({
      name: 'API_Gateway',
      type: 'gateway',
      responsibilities: ['Route requests', 'Authentication', 'Rate limiting']
    });
    
    // Add core services based on scale
    if (definition.expectedScale > 10000) {
      components.push({
        name: 'User_Service',
        type: 'service',
        responsibilities: ['User management', 'Authentication']
      });
      
      components.push({
        name: 'Data_Service',
        type: 'service',
        responsibilities: ['Data persistence', 'Data retrieval']
      });
    }
    
    // Add caching layer for high scale
    if (definition.expectedScale > 50000) {
      components.push({
        name: 'Cache_Layer',
        type: 'cache',
        responsibilities: ['Cache frequently accessed data']
      });
    }
    
    return components;
  }
  
  private generateMonolithComponents(definition: ArchitectureDefinition): Component[] {
    // Generate standard monolith layers
    return [
      {
        name: 'Presentation_Layer',
        type: 'layer',
        responsibilities: ['Handle HTTP requests', 'Render responses']
      },
      {
        name: 'Business_Logic_Layer',
        type: 'layer',
        responsibilities: ['Implement business rules', 'Process data']
      },
      {
        name: 'Data_Access_Layer',
        type: 'layer',
        responsibilities: ['Database operations', 'Data persistence']
      }
    ];
  }
  
  private generateCommunicationPatterns(definition: ArchitectureDefinition): CommunicationPattern[] {
    const patterns: CommunicationPattern[] = [];
    
    // Extract protocol requirements from constraints
    const protocolConstraints = definition.constraints.filter(c => 
      c.text.toLowerCase().includes('grpc') || 
      c.text.toLowerCase().includes('rest') ||
      c.text.toLowerCase().includes('http')
    );
    
    if (protocolConstraints.length > 0) {
      // Use constraint-specified protocols
      for (const constraint of protocolConstraints) {
        if (constraint.text.toLowerCase().includes('grpc')) {
          patterns.push({
            protocol: 'gRPC',
            description: 'Use gRPC for inter-service communication'
          });
        }
      }
    } else {
      // Default patterns based on architecture type
      if (definition.architectureType === 'microservices') {
        patterns.push({
          protocol: 'REST',
          description: 'Use REST APIs for inter-service communication'
        });
      } else {
        patterns.push({
          protocol: 'Function_Call',
          description: 'Use direct function calls within monolith'
        });
      }
    }
    
    return patterns;
  }
}
```

**Blueprint Generation Logic**:
- Analyze expected scale to determine component needs
- Generate appropriate components for architecture type
- Extract protocol requirements from constraints
- Create communication patterns based on constraints and architecture type
- Define layer boundaries for monoliths or service boundaries for microservices

#### 2. Project Manager

**Responsibility**: Manages project data persistence and retrieval.

**Key Functions**:
```typescript
class ProjectManager {
  private projectsDir: string = './data/projects';
  
  async saveProject(project: Project): Promise<void> {
    const projectPath = path.join(this.projectsDir, `${project.id}.json`);
    await fs.writeFile(projectPath, JSON.stringify(project, null, 2));
  }
  
  async loadProject(projectId: string): Promise<Project> {
    const projectPath = path.join(this.projectsDir, `${projectId}.json`);
    const data = await fs.readFile(projectPath, 'utf-8');
    return JSON.parse(data);
  }
  
  async listProjects(userId: string): Promise<ProjectSummary[]> {
    const files = await fs.readdir(this.projectsDir);
    const projects: ProjectSummary[] = [];
    
    for (const file of files) {
      const data = await fs.readFile(path.join(this.projectsDir, file), 'utf-8');
      const project = JSON.parse(data);
      
      if (project.userId === userId) {
        projects.push({
          id: project.id,
          name: project.name,
          lastModified: project.lastModified
        });
      }
    }
    
    return projects;
  }
  
  async saveArchitectureVersion(projectId: string, blueprint: Blueprint): Promise<void> {
    const project = await this.loadProject(projectId);
    
    if (!project.architectureHistory) {
      project.architectureHistory = [];
    }
    
    project.architectureHistory.push({
      version: project.architectureHistory.length + 1,
      blueprint,
      timestamp: new Date()
    });
    
    project.currentBlueprint = blueprint;
    await this.saveProject(project);
  }
}
```

**Data Storage Structure**:
```
data/
  projects/
    {projectId}.json
      - id
      - userId
      - name
      - currentBlueprint
      - architectureHistory[]
      - code
      - lastModified
```

#### 3. User Manager

**Responsibility**: Manages user sessions and authentication.

**Key Functions**:
```typescript
class UserManager {
  private sessions: Map<string, Session> = new Map();
  
  createSession(userId: string): Session {
    const sessionId = generateUUID();
    const session: Session = {
      id: sessionId,
      userId,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000) // 8 hours
    };
    
    this.sessions.set(sessionId, session);
    return session;
  }
  
  validateSession(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    
    if (!session) return false;
    if (session.expiresAt < new Date()) {
      this.sessions.delete(sessionId);
      return false;
    }
    
    return true;
  }
  
  getUserId(sessionId: string): string | null {
    const session = this.sessions.get(sessionId);
    return session ? session.userId : null;
  }
}
```


## Data Models

### Core Data Structures

```typescript
// Architecture Definition (User Input)
interface ArchitectureDefinition {
  expectedScale: number;
  architectureType: 'monolith' | 'microservices';
  constraints: SystemConstraint[];
}

interface SystemConstraint {
  id: string;
  text: string;
  severity: 'critical' | 'warning' | 'informational';
  category: 'communication' | 'performance' | 'layer_boundary' | 'security' | 'dependency' | 'data_flow';
}

// Architecture Blueprint (Generated)
interface Blueprint {
  id: string;
  architectureType: 'monolith' | 'microservices';
  expectedScale: number;
  components: Component[];
  communicationPatterns: CommunicationPattern[];
  layers?: Layer[]; // For monolith
  constraints: SystemConstraint[];
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

interface Layer {
  name: string;
  allowedDependencies: string[]; // Names of layers this layer can depend on
}

// Validation Results
interface ValidationResult {
  passed: boolean;
  violations: Violation[];
  timestamp: Date;
}

interface Violation {
  constraintId: string;
  location: CodeLocation;
  description: string;
  severity: 'critical' | 'warning' | 'informational';
}

interface CodeLocation {
  startLine: number;
  endLine: number;
  startColumn: number;
  endColumn: number;
}

// Drift Detection
interface DriftResult {
  hasDrift: boolean;
  drifts: Drift[];
  timestamp: Date;
}

interface Drift {
  type: 'undefined_component' | 'invalid_communication' | 'layer_violation' | 'service_boundary_violation';
  location: CodeLocation;
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

// Project Data
interface Project {
  id: string;
  userId: string;
  name: string;
  currentBlueprint: Blueprint | null;
  architectureHistory: ArchitectureVersion[];
  code: string;
  approvalStatus: boolean;
  lastModified: Date;
}

interface ArchitectureVersion {
  version: number;
  blueprint: Blueprint;
  timestamp: Date;
}

// Session Management
interface Session {
  id: string;
  userId: string;
  createdAt: Date;
  expiresAt: Date;
}
```

## Data Flow

### 1. Architecture Definition Flow

```
User Input → Architecture Builder Component
                ↓
          Validate Constraint Syntax (Client)
                ↓
          Save to State (Client)
                ↓
          POST /api/architecture/save
                ↓
          Project Manager (Server)
                ↓
          File System Storage
```

### 2. Blueprint Generation Flow

```
User Clicks "Generate Blueprint"
                ↓
          POST /api/blueprint/generate
                ↓
          Blueprint Generator (Server)
                ↓
          Analyze Scale & Constraints
                ↓
          Generate Components
                ↓
          Generate Communication Patterns
                ↓
          Return Blueprint (JSON)
                ↓
          Display in UI (Client)
```

### 3. Real-Time Validation Flow

```
User Types Code → Code Editor Component
                ↓
          Debounce 500ms
                ↓
          Constraint Validator (Client)
                ↓
          Parse Code to AST
                ↓
          Check Each Constraint
                ↓
          Generate Violations
                ↓
          Drift Detector (Client)
                ↓
          Check Blueprint Compliance
                ↓
          Generate Drifts
                ↓
          Risk Scorer (Client)
                ↓
          Calculate Risk Scores
                ↓
          Update UI (Highlights + Mentor Console + Risk Dashboard)
```

### 4. Project Persistence Flow

```
Auto-save Timer (30s) → Collect Current State
                ↓
          POST /api/project/save
                ↓
          Project Manager (Server)
                ↓
          Serialize to JSON
                ↓
          Write to File System
```

### 5. Project Loading Flow

```
User Selects Project → GET /api/project/{id}
                ↓
          Project Manager (Server)
                ↓
          Read from File System
                ↓
          Parse JSON
                ↓
          Return Project Data
                ↓
          Hydrate Client State
                ↓
          Trigger Initial Validation
```

## Technology Stack

### Frontend

**React 18.x**
- Justification: Component-based architecture, excellent ecosystem, fast development
- Use Cases: All UI components, state management

**TypeScript 5.x**
- Justification: Type safety, better IDE support, catches errors at compile time
- Use Cases: All frontend code

**Monaco Editor**
- Justification: VS Code's editor, excellent code editing experience, syntax highlighting
- Use Cases: Code editor component

**@babel/parser**
- Justification: Robust JavaScript/TypeScript AST parser, widely used
- Use Cases: Client-side code analysis for validation

**Zustand**
- Justification: Lightweight state management, simpler than Redux, sufficient for prototype
- Use Cases: Global state (current project, blueprint, validation results)

**Tailwind CSS**
- Justification: Rapid UI development, consistent styling, small bundle size
- Use Cases: All component styling

**Vite**
- Justification: Fast development server, optimized builds, excellent DX
- Use Cases: Build tool and dev server

### Backend

**Node.js 18.x**
- Justification: JavaScript everywhere, large ecosystem, fast for I/O operations
- Use Cases: Backend server runtime

**Express 4.x**
- Justification: Minimal, flexible, well-documented, perfect for prototype APIs
- Use Cases: REST API endpoints

**TypeScript 5.x**
- Justification: Shared types with frontend, type safety
- Use Cases: All backend code

**File System (fs/promises)**
- Justification: Simple, no database setup needed, sufficient for prototype
- Use Cases: Project and blueprint persistence

### Development Tools

**ESLint + Prettier**
- Justification: Code quality and consistency
- Use Cases: Linting and formatting

**Jest + React Testing Library**
- Justification: Standard testing tools, good React integration
- Use Cases: Unit and integration tests

**fast-check**
- Justification: Property-based testing library for JavaScript/TypeScript
- Use Cases: Property-based tests for validation logic

### Deployment

**Single Server Deployment**
- Frontend: Static files served by Express
- Backend: Express server on port 3000
- Storage: Local file system

**Docker (Optional)**
- Simple Dockerfile for containerization
- Not required for prototype but enables easy deployment

### Technology Stack Rationale

**Why React over Vue/Angular**:
- Larger ecosystem and community
- Better suited for complex interactive UIs
- Team familiarity (common in hackathons)

**Why Node.js Backend**:
- Shared language with frontend (TypeScript)
- Fast development velocity
- Sufficient performance for prototype scale

**Why File System over Database**:
- Zero setup time
- Sufficient for prototype (< 100 projects)
- Easy to migrate to database later
- Simplifies deployment

**Why Client-Heavy Architecture**:
- Meets 2-second performance requirements
- Reduces backend complexity
- Better user experience (no network latency)
- Easier to debug and develop


## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Property 1: Constraint Syntax Validation

*For any* constraint string input, the constraint validator should either successfully parse it into a structured rule or return a specific error message indicating what is invalid.

**Validates: Requirements FR-1.4**

### Property 2: Architecture Definition Persistence Round-Trip

*For any* valid architecture definition (scale, type, constraints), saving then loading the definition should produce an equivalent definition with all data preserved.

**Validates: Requirements FR-1.5, FR-9.1**

### Property 3: Blueprint Generation Completeness

*For any* valid architecture definition, the generated blueprint should include component definitions, communication patterns, and all user-defined constraints.

**Validates: Requirements FR-2.2, FR-2.3, FR-2.4**

### Property 4: Blueprint Format Validity

*For any* generated blueprint, it should be valid JSON or YAML that can be parsed without errors.

**Validates: Requirements FR-2.7**

### Property 5: Architecture Modification Triggers Regeneration

*For any* architecture definition that is modified after blueprint generation, a new blueprint should be generated reflecting the changes.

**Validates: Requirements FR-3.4**

### Property 6: Approval Status Persistence

*For any* project, setting approval status then querying it should return the same status value.

**Validates: Requirements FR-3.5**

### Property 7: Drift Detection Completeness

*For any* code that violates the architecture blueprint, the drift detector should identify the violation and provide location information (line numbers) and a description.

**Validates: Requirements FR-4.2, FR-4.4, FR-4.5**

### Property 8: Constraint Validation Execution

*For any* code input and any set of system constraints, the constraint validator should execute validation and return a result indicating pass/fail status.

**Validates: Requirements FR-5.1**

### Property 9: Constraint Violation Reporting

*For any* code that violates a system constraint, the validator should report the violation with the specific constraint ID and location information.

**Validates: Requirements FR-5.2, FR-5.3**

### Property 10: Protocol Constraint Validation

*For any* code using communication protocols and any protocol constraint, the validator should detect protocol usage and verify compliance with the constraint.

**Validates: Requirements FR-5.4**

### Property 11: Performance Constraint Validation

*For any* code with performance constraints, the validator should analyze the code for potential latency violations (nested loops, synchronous I/O, blocking calls).

**Validates: Requirements FR-5.5**

### Property 12: Layer Boundary Constraint Validation

*For any* code with layer boundary constraints, the validator should detect unauthorized cross-layer imports or access.

**Validates: Requirements FR-5.6**

### Property 13: Risk Score Calculation

*For any* architecture definition and code, the risk scorer should calculate all four risk dimensions (scalability, overengineering, security, consistency) as numeric values between 0 and 100.

**Validates: Requirements FR-6.1, FR-6.2, FR-6.3, FR-6.4, FR-6.6**

### Property 14: Risk Score Recalculation on Change

*For any* code modification, the risk scorer should recalculate affected risk scores and return updated values.

**Validates: Requirements FR-6.5**

### Property 15: Risk Score Warning Highlighting

*For any* risk score that equals or exceeds 70, the system should mark it for prominent highlighting in the UI.

**Validates: Requirements FR-6.7**

### Property 16: Feedback Display for Issues

*For any* detected architectural drift or constraint violation, the mentor console should display structured feedback including the issue description and remediation guidance.

**Validates: Requirements FR-7.2, FR-7.3**

### Property 17: Feedback Severity Organization

*For any* set of feedback items, the mentor console should organize them by severity level (critical, warning, informational) with critical items appearing first.

**Validates: Requirements FR-7.5**

### Property 18: Feedback Includes Recommendations

*For any* feedback item displayed in the mentor console, it should include an actionable recommendation string with minimum 20 characters.

**Validates: Requirements FR-7.6**

### Property 19: Feedback Removal on Resolution

*For any* issue that is resolved (code fixed to eliminate violation/drift), the corresponding feedback item should be removed from the mentor console.

**Validates: Requirements FR-7.7**

### Property 20: Generated Code Compliance

*For any* code generation request with an approved architecture, the generated code should pass all constraint validations and blueprint compliance checks.

**Validates: Requirements FR-8.3, FR-8.4**

### Property 21: Generation Refusal for Violations

*For any* code generation request that would produce code violating constraints, the system should refuse generation and provide an explanation including the specific constraint that would be violated.

**Validates: Requirements FR-8.5**

### Property 22: Blueprint Persistence Round-Trip

*For any* architecture blueprint, saving it to a project then loading the project should return an equivalent blueprint with all components, patterns, and constraints preserved.

**Validates: Requirements FR-9.2**

### Property 23: Constraint Persistence Round-Trip

*For any* set of system constraints, saving them to a project then loading the project should return an equivalent set of constraints with all properties preserved.

**Validates: Requirements FR-9.3**

### Property 24: Architecture Version History

*For any* architecture definition modification, the system should create a new version entry in the history with an incremented version number and timestamp.

**Validates: Requirements FR-9.4, FR-9.5**

### Property 25: Project Switching Data Isolation

*For any* two different projects, switching from project A to project B then back to project A should load project A's original blueprint, constraints, and risk scores without contamination from project B's data.

**Validates: Requirements FR-10.2, FR-10.3, FR-10.4, FR-10.5**

### Property 26: Drift Detection Performance

*For any* code file up to 5,000 lines, drift detection should complete within 2 seconds measured from analysis start to result availability.

**Validates: Requirements FR-4.3**

### Property 27: Constraint Validation Performance

*For any* code file with up to 100 constraints, constraint validation should complete within 2 seconds measured from analysis start to result availability.

**Validates: Requirements FR-5.7**

### Property 28: Risk Score Calculation Performance

*For any* project with up to 50 components, risk score calculation should complete within 5 seconds measured from calculation start to all four scores being available.

**Validates: Requirements FR-6.8**


## Error Handling

### Client-Side Error Handling

#### 1. Validation Errors

**Constraint Syntax Errors**:
```typescript
try {
  const parsedConstraint = constraintValidator.parseConstraint(constraint);
} catch (error) {
  return {
    valid: false,
    error: `Invalid constraint syntax: ${error.message}`,
    suggestion: "Constraints should follow the pattern: [scope] [rule] [criteria]"
  };
}
```

**Code Parsing Errors**:
```typescript
try {
  const ast = parseCodeToAST(code);
} catch (error) {
  // Don't block editing, just skip validation
  console.warn('Code parsing failed, skipping validation:', error);
  return {
    passed: true,
    violations: [],
    warning: 'Code contains syntax errors, validation skipped'
  };
}
```

#### 2. Network Errors

**API Request Failures**:
```typescript
async function saveBlueprintWithRetry(blueprint: Blueprint): Promise<void> {
  const maxRetries = 3;
  let attempt = 0;
  
  while (attempt < maxRetries) {
    try {
      await api.post('/api/blueprint/save', blueprint);
      return;
    } catch (error) {
      attempt++;
      
      if (attempt >= maxRetries) {
        // Store in local storage as fallback
        localStorage.setItem('unsaved_blueprint', JSON.stringify(blueprint));
        
        showNotification({
          type: 'error',
          message: 'Failed to save blueprint. Data stored locally.',
          action: 'Retry',
          onAction: () => saveBlueprintWithRetry(blueprint)
        });
        
        throw error;
      }
      
      // Exponential backoff
      await sleep(Math.pow(2, attempt) * 1000);
    }
  }
}
```

#### 3. State Errors

**Invalid State Transitions**:
```typescript
function approveArchitecture(state: AppState): AppState {
  if (!state.currentBlueprint) {
    showNotification({
      type: 'error',
      message: 'Cannot approve architecture: No blueprint generated'
    });
    return state;
  }
  
  return {
    ...state,
    approvalStatus: true
  };
}
```

### Server-Side Error Handling

#### 1. Request Validation Errors

**Invalid Input**:
```typescript
app.post('/api/blueprint/generate', async (req, res) => {
  try {
    const definition = req.body;
    
    // Validate required fields
    if (!definition.expectedScale || !definition.architectureType) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['expectedScale', 'architectureType']
      });
    }
    
    // Validate scale range
    if (definition.expectedScale < 1 || definition.expectedScale > 1000000000) {
      return res.status(400).json({
        error: 'Expected scale out of range',
        range: '1 to 1,000,000,000'
      });
    }
    
    const blueprint = blueprintGenerator.generate(definition);
    res.json(blueprint);
    
  } catch (error) {
    console.error('Blueprint generation failed:', error);
    res.status(500).json({
      error: 'Blueprint generation failed',
      message: error.message
    });
  }
});
```

#### 2. File System Errors

**Project Not Found**:
```typescript
async loadProject(projectId: string): Promise<Project> {
  try {
    const projectPath = path.join(this.projectsDir, `${projectId}.json`);
    const data = await fs.readFile(projectPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new ProjectNotFoundError(`Project ${projectId} not found`);
    }
    throw new ProjectLoadError(`Failed to load project: ${error.message}`);
  }
}
```

**Disk Space Errors**:
```typescript
async saveProject(project: Project): Promise<void> {
  try {
    const projectPath = path.join(this.projectsDir, `${project.id}.json`);
    await fs.writeFile(projectPath, JSON.stringify(project, null, 2));
  } catch (error) {
    if (error.code === 'ENOSPC') {
      throw new DiskSpaceError('Insufficient disk space to save project');
    }
    throw new ProjectSaveError(`Failed to save project: ${error.message}`);
  }
}
```

#### 3. Session Errors

**Invalid Session**:
```typescript
function requireAuth(req: Request, res: Response, next: NextFunction) {
  const sessionId = req.headers['x-session-id'];
  
  if (!sessionId || !userManager.validateSession(sessionId)) {
    return res.status(401).json({
      error: 'Invalid or expired session',
      action: 'Please log in again'
    });
  }
  
  req.userId = userManager.getUserId(sessionId);
  next();
}
```

### Error Recovery Strategies

#### 1. Auto-Save Recovery

```typescript
// On application load, check for unsaved data
function recoverUnsavedData(): void {
  const unsavedBlueprint = localStorage.getItem('unsaved_blueprint');
  
  if (unsavedBlueprint) {
    showNotification({
      type: 'info',
      message: 'Found unsaved blueprint from previous session',
      action: 'Recover',
      onAction: () => {
        const blueprint = JSON.parse(unsavedBlueprint);
        loadBlueprint(blueprint);
        localStorage.removeItem('unsaved_blueprint');
      }
    });
  }
}
```

#### 2. Graceful Degradation

```typescript
// If validation engine fails, allow editing but show warning
function handleValidationEngineFailure(): void {
  showNotification({
    type: 'warning',
    message: 'Validation engine unavailable. Code editing enabled but validation disabled.',
    persistent: true
  });
  
  // Disable validation UI elements
  disableValidationIndicators();
  
  // Allow code editing to continue
  enableCodeEditor();
}
```

#### 3. Retry Mechanisms

```typescript
// Retry failed operations with exponential backoff
async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxRetries - 1) throw error;
      await sleep(Math.pow(2, attempt) * 1000);
    }
  }
  throw new Error('Max retries exceeded');
}
```

## Testing Strategy

### Dual Testing Approach

The system requires both unit tests and property-based tests to ensure comprehensive coverage:

- **Unit tests**: Verify specific examples, edge cases, and error conditions
- **Property tests**: Verify universal properties across all inputs

Together, these approaches provide comprehensive coverage where unit tests catch concrete bugs and property tests verify general correctness.

### Property-Based Testing

**Library**: fast-check (JavaScript/TypeScript property-based testing library)

**Configuration**: Each property test runs minimum 100 iterations to ensure thorough input coverage.

**Tagging Convention**: Each property test includes a comment tag referencing the design document property:
```typescript
// Feature: architecture-first-ide, Property 1: Constraint Syntax Validation
```

### Unit Testing Strategy

#### Frontend Component Tests

**Architecture Builder Component**:
```typescript
describe('ArchitectureBuilder', () => {
  it('should render scale input field', () => {
    // Validates: FR-1.1
    const { getByLabelText } = render(<ArchitectureBuilder />);
    expect(getByLabelText('Expected Scale')).toBeInTheDocument();
  });
  
  it('should render architecture type dropdown with monolith and microservices options', () => {
    // Validates: FR-1.2
    const { getByRole } = render(<ArchitectureBuilder />);
    const dropdown = getByRole('combobox');
    expect(dropdown).toHaveTextContent('Monolith');
    expect(dropdown).toHaveTextContent('Microservices');
  });
  
  it('should render constraint editor text area', () => {
    // Validates: FR-1.3
    const { getByLabelText } = render(<ArchitectureBuilder />);
    expect(getByLabelText('System Constraints')).toBeInTheDocument();
  });
  
  it('should require scale definition before enabling blueprint generation', () => {
    // Validates: FR-1.6
    const { getByText } = render(<ArchitectureBuilder />);
    const generateButton = getByText('Generate Blueprint');
    expect(generateButton).toBeDisabled();
  });
});
```

**Code Editor Component**:
```typescript
describe('CodeEditor', () => {
  it('should highlight violations at correct line numbers', () => {
    const violations = [{
      constraintId: 'c1',
      location: { startLine: 5, endLine: 5, startColumn: 0, endColumn: 10 },
      description: 'Test violation',
      severity: 'critical'
    }];
    
    const { container } = render(<CodeEditor violations={violations} />);
    const highlightedLine = container.querySelector('.line-5');
    expect(highlightedLine).toHaveClass('violation-critical');
  });
});
```

**Mentor Console Component**:
```typescript
describe('MentorConsole', () => {
  it('should render mentor console interface', () => {
    // Validates: FR-7.1
    const { getByTestId } = render(<MentorConsole />);
    expect(getByTestId('mentor-console')).toBeInTheDocument();
  });
  
  it('should organize feedback by severity with critical first', () => {
    const feedback = [
      { id: '1', severity: 'warning', title: 'Warning' },
      { id: '2', severity: 'critical', title: 'Critical' },
      { id: '3', severity: 'informational', title: 'Info' }
    ];
    
    const { getAllByTestId } = render(<MentorConsole feedback={feedback} />);
    const items = getAllByTestId('feedback-item');
    
    expect(items[0]).toHaveTextContent('Critical');
    expect(items[1]).toHaveTextContent('Warning');
    expect(items[2]).toHaveTextContent('Info');
  });
});
```

#### Validation Engine Tests

**Constraint Validator**:
```typescript
describe('ConstraintValidator', () => {
  it('should detect gRPC protocol usage', () => {
    const code = `
      import * as grpc from '@grpc/grpc-js';
      const client = new grpc.Client();
    `;
    
    const constraint = {
      id: 'c1',
      text: 'All inter-service communication must use gRPC protocol',
      severity: 'critical',
      category: 'communication'
    };
    
    const result = validator.validate(code, [constraint]);
    expect(result.passed).toBe(true);
  });
  
  it('should detect REST usage when gRPC is required', () => {
    const code = `
      import axios from 'axios';
      axios.get('/api/users');
    `;
    
    const constraint = {
      id: 'c1',
      text: 'All inter-service communication must use gRPC protocol',
      severity: 'critical',
      category: 'communication'
    };
    
    const result = validator.validate(code, [constraint]);
    expect(result.passed).toBe(false);
    expect(result.violations[0].constraintId).toBe('c1');
  });
  
  it('should detect nested loops indicating performance issues', () => {
    const code = `
      for (let i = 0; i < users.length; i++) {
        for (let j = 0; j < posts.length; j++) {
          // O(n²) operation
        }
      }
    `;
    
    const constraint = {
      id: 'c2',
      text: 'No service should exceed 200ms response latency',
      severity: 'warning',
      category: 'performance'
    };
    
    const result = validator.validate(code, [constraint]);
    expect(result.passed).toBe(false);
  });
});
```

**Drift Detector**:
```typescript
describe('DriftDetector', () => {
  it('should detect reference to undefined component', () => {
    const code = `
      import { UndefinedService } from './undefined-service';
    `;
    
    const blueprint = {
      components: [
        { name: 'User_Service', type: 'service', responsibilities: [] },
        { name: 'Data_Service', type: 'service', responsibilities: [] }
      ]
    };
    
    const result = driftDetector.detectDrift(code, blueprint);
    expect(result.hasDrift).toBe(true);
    expect(result.drifts[0].type).toBe('undefined_component');
  });
  
  it('should detect layer boundary violation', () => {
    const code = `
      // In presentation layer
      import { database } from './data-access-layer/database';
      database.query('SELECT * FROM users');
    `;
    
    const blueprint = {
      architectureType: 'monolith',
      layers: [
        { name: 'Presentation_Layer', allowedDependencies: ['Business_Logic_Layer'] },
        { name: 'Business_Logic_Layer', allowedDependencies: ['Data_Access_Layer'] },
        { name: 'Data_Access_Layer', allowedDependencies: [] }
      ]
    };
    
    const result = driftDetector.detectDrift(code, blueprint);
    expect(result.hasDrift).toBe(true);
    expect(result.drifts[0].type).toBe('layer_violation');
  });
});
```

**Risk Scorer**:
```typescript
describe('RiskScorer', () => {
  it('should calculate high scalability risk for high scale without caching', () => {
    const code = `
      function getUsers() {
        return database.query('SELECT * FROM users');
      }
    `;
    
    const blueprint = {
      expectedScale: 100000,
      components: []
    };
    
    const scores = riskScorer.calculateRiskScores(code, blueprint, [], []);
    expect(scores.scalability).toBeGreaterThan(50);
  });
  
  it('should calculate high overengineering risk for low scale with high complexity', () => {
    const code = `
      // Overly complex code for small scale
      class AbstractFactoryBuilder {
        // 50+ lines of abstraction
      }
    `;
    
    const blueprint = {
      expectedScale: 100,
      components: []
    };
    
    const scores = riskScorer.calculateRiskScores(code, blueprint, [], []);
    expect(scores.overengineering).toBeGreaterThan(50);
  });
  
  it('should calculate high security risk for exposed endpoints without auth', () => {
    const code = `
      app.get('/api/admin/users', (req, res) => {
        // No authentication check
        res.json(users);
      });
    `;
    
    const blueprint = { components: [] };
    
    const scores = riskScorer.calculateRiskScores(code, blueprint, [], []);
    expect(scores.security).toBeGreaterThan(50);
  });
});
```

#### Backend Tests

**Blueprint Generator**:
```typescript
describe('BlueprintGenerator', () => {
  it('should generate microservices blueprint with service boundaries', () => {
    // Validates: FR-2.5
    const definition = {
      expectedScale: 50000,
      architectureType: 'microservices',
      constraints: []
    };
    
    const blueprint = generator.generate(definition);
    expect(blueprint.components.length).toBeGreaterThan(0);
    expect(blueprint.components.some(c => c.type === 'service')).toBe(true);
  });
  
  it('should generate monolith blueprint with layer boundaries', () => {
    // Validates: FR-2.6
    const definition = {
      expectedScale: 5000,
      architectureType: 'monolith',
      constraints: []
    };
    
    const blueprint = generator.generate(definition);
    expect(blueprint.layers).toBeDefined();
    expect(blueprint.layers.length).toBeGreaterThanOrEqual(3);
  });
});
```

**Project Manager**:
```typescript
describe('ProjectManager', () => {
  it('should support multiple projects simultaneously', () => {
    // Validates: FR-10.1
    const project1 = { id: 'p1', userId: 'u1', name: 'Project 1' };
    const project2 = { id: 'p2', userId: 'u1', name: 'Project 2' };
    
    await projectManager.saveProject(project1);
    await projectManager.saveProject(project2);
    
    const projects = await projectManager.listProjects('u1');
    expect(projects.length).toBe(2);
  });
});
```

### Property-Based Testing Strategy

Each correctness property from the design document should be implemented as a property-based test using fast-check. Each test runs 100 iterations with randomly generated inputs.

**Example Property Tests**:

```typescript
import fc from 'fast-check';

// Feature: architecture-first-ide, Property 2: Architecture Definition Persistence Round-Trip
describe('Property: Architecture Definition Persistence', () => {
  it('should preserve all data through save/load cycle', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          expectedScale: fc.integer({ min: 1, max: 1000000000 }),
          architectureType: fc.constantFrom('monolith', 'microservices'),
          constraints: fc.array(fc.record({
            id: fc.uuid(),
            text: fc.string({ minLength: 10, maxLength: 200 }),
            severity: fc.constantFrom('critical', 'warning', 'informational'),
            category: fc.constantFrom('communication', 'performance', 'layer_boundary', 'security')
          }))
        }),
        async (definition) => {
          const projectId = await projectManager.saveArchitectureDefinition(definition);
          const loaded = await projectManager.loadArchitectureDefinition(projectId);
          
          expect(loaded.expectedScale).toBe(definition.expectedScale);
          expect(loaded.architectureType).toBe(definition.architectureType);
          expect(loaded.constraints).toEqual(definition.constraints);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Feature: architecture-first-ide, Property 7: Drift Detection Completeness
describe('Property: Drift Detection', () => {
  it('should detect all blueprint violations', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 50, maxLength: 500 }), // Random code
        fc.record({ // Random blueprint
          components: fc.array(fc.record({
            name: fc.string(),
            type: fc.constantFrom('service', 'layer'),
            responsibilities: fc.array(fc.string())
          }))
        }),
        (code, blueprint) => {
          const result = driftDetector.detectDrift(code, blueprint);
          
          // If drift is detected, it must include location and description
          if (result.hasDrift) {
            for (const drift of result.drifts) {
              expect(drift.location).toBeDefined();
              expect(drift.location.startLine).toBeGreaterThan(0);
              expect(drift.description).toBeTruthy();
              expect(drift.description.length).toBeGreaterThan(10);
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Feature: architecture-first-ide, Property 13: Risk Score Calculation
describe('Property: Risk Score Calculation', () => {
  it('should calculate all risk scores in valid range', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 50, maxLength: 1000 }), // Random code
        fc.record({ // Random blueprint
          expectedScale: fc.integer({ min: 1, max: 1000000 }),
          components: fc.array(fc.record({
            name: fc.string(),
            type: fc.constantFrom('service', 'layer')
          }))
        }),
        (code, blueprint) => {
          const scores = riskScorer.calculateRiskScores(code, blueprint, [], []);
          
          expect(scores.scalability).toBeGreaterThanOrEqual(0);
          expect(scores.scalability).toBeLessThanOrEqual(100);
          
          expect(scores.overengineering).toBeGreaterThanOrEqual(0);
          expect(scores.overengineering).toBeLessThanOrEqual(100);
          
          expect(scores.security).toBeGreaterThanOrEqual(0);
          expect(scores.security).toBeLessThanOrEqual(100);
          
          expect(scores.consistency).toBeGreaterThanOrEqual(0);
          expect(scores.consistency).toBeLessThanOrEqual(100);
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Integration Testing

**End-to-End Workflow Tests**:
```typescript
describe('Architecture-First Workflow', () => {
  it('should complete full workflow from definition to validation', async () => {
    // 1. Define architecture
    const definition = {
      expectedScale: 10000,
      architectureType: 'monolith',
      constraints: [{
        id: 'c1',
        text: 'All database access must go through the data service layer',
        severity: 'critical',
        category: 'layer_boundary'
      }]
    };
    
    // 2. Generate blueprint
    const blueprint = await blueprintGenerator.generate(definition);
    expect(blueprint).toBeDefined();
    
    // 3. Approve architecture
    const projectId = await projectManager.createProject('Test Project', blueprint);
    await projectManager.approveArchitecture(projectId);
    
    // 4. Write code
    const code = `
      import { database } from './database';
      database.query('SELECT * FROM users');
    `;
    
    // 5. Validate code
    const violations = constraintValidator.validate(code, definition.constraints);
    expect(violations.passed).toBe(false); // Should detect layer violation
    
    // 6. Detect drift
    const drifts = driftDetector.detectDrift(code, blueprint);
    expect(drifts.hasDrift).toBe(true);
    
    // 7. Calculate risk
    const scores = riskScorer.calculateRiskScores(code, blueprint, violations.violations, drifts.drifts);
    expect(scores.consistency).toBeGreaterThan(0); // Should have consistency risk
  });
});
```

### Performance Testing

**Validation Performance Tests**:
```typescript
describe('Performance Requirements', () => {
  it('should detect drift within 2 seconds for 5000-line files', async () => {
    const largeCode = generateCodeWithLines(5000);
    const blueprint = generateTestBlueprint();
    
    const startTime = Date.now();
    const result = driftDetector.detectDrift(largeCode, blueprint);
    const duration = Date.now() - startTime;
    
    expect(duration).toBeLessThan(2000);
  });
  
  it('should validate 100 constraints within 2 seconds', async () => {
    const code = generateTestCode();
    const constraints = generateConstraints(100);
    
    const startTime = Date.now();
    const result = constraintValidator.validate(code, constraints);
    const duration = Date.now() - startTime;
    
    expect(duration).toBeLessThan(2000);
  });
  
  it('should calculate risk scores within 5 seconds for 50 components', async () => {
    const code = generateTestCode();
    const blueprint = generateBlueprintWithComponents(50);
    
    const startTime = Date.now();
    const scores = riskScorer.calculateRiskScores(code, blueprint, [], []);
    const duration = Date.now() - startTime;
    
    expect(duration).toBeLessThan(5000);
  });
});
```

### Test Coverage Goals

- **Unit Test Coverage**: Minimum 80% for core validation logic
- **Property Test Coverage**: All 28 correctness properties implemented
- **Integration Test Coverage**: All major workflows tested end-to-end
- **Performance Test Coverage**: All performance requirements validated

