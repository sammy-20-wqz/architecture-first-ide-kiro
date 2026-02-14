# Implementation Plan: Architecture-First IDE

## Overview

This implementation plan focuses on delivering a working MVP prototype for a 24-48 hour hackathon. The plan prioritizes core validation features and essential UI, avoiding enterprise complexity.

## MVP Scope - Core Features Only

**Must Have (24-48 hours):**
1. Architecture definition UI (scale, type, constraints)
2. Constraint validation engine
3. Drift detection
4. Risk scoring (basic)
5. Simple code editor with feedback

**Deferred for Post-MVP:**
- Multi-project support
- Version history
- Blueprint generation (simplified inline)
- Advanced risk algorithms
- Mentor console (use simple alerts/inline feedback)
- Performance optimizations
- Authentication

## Hackathon Timeline

- **Hours 0-6**: Setup + Backend + Data Models
- **Hours 6-12**: Frontend UI Components
- **Hours 12-20**: Validation Engine (CORE)
- **Hours 20-24**: Integration + Polish + Demo

## Tasks with Time Estimates

### PHASE 1: Setup & Backend (Hours 0-6, Total: 6h)

- [ ] 1. Project Initialization (1.5h)
  - [ ] 1.1 Create project structure (0.5h)
    - Run `npm create vite@latest frontend -- --template react-ts`
    - Create `backend/` folder with `npm init -y`
    - Create `shared/` folder for types
    - Install dependencies: express, cors, typescript, @types/node, @types/express
    - _Files: package.json, tsconfig.json (both frontend & backend)_
  
  - [ ] 1.2 Configure TypeScript and build tools (0.5h)
    - Configure backend tsconfig.json (target: ES2020, module: commonjs)
    - Configure frontend tsconfig.json (already done by Vite)
    - Add scripts to package.json: "dev", "build", "start"
    - Test that both frontend and backend compile
    - _Files: backend/tsconfig.json, package.json scripts_
  
  - [ ] 1.3 Install and configure Tailwind CSS (0.5h)
    - Run `npm install -D tailwindcss postcss autoprefixer`
    - Run `npx tailwindcss init -p`
    - Configure tailwind.config.js with content paths
    - Add Tailwind directives to index.css
    - _Files: tailwind.config.js, frontend/src/index.css_

- [ ] 2. Shared Data Models (1h)
  - [ ] 2.1 Create TypeScript interfaces (1h)
    - Create `shared/types.ts` file
    - Define ArchitectureDefinition interface (expectedScale: number, architectureType: 'monolith' | 'microservices', constraints: SystemConstraint[])
    - Define SystemConstraint interface (id: string, text: string, severity: 'critical' | 'warning' | 'informational', category: string)
    - Define ValidationResult interface (passed: boolean, violations: Violation[], timestamp: Date)
    - Define Violation interface (constraintId: string, location: {line: number}, description: string, severity: string)
    - Define Drift interface (type: string, location: {line: number}, description: string, severity: string)
    - Define RiskScores interface (scalability: number, overengineering: number, security: number, consistency: number)
    - Export all interfaces
    - _Files: shared/types.ts_
    - _Requirements: FR-1, FR-4, FR-5, FR-6_

- [ ] 3. Backend API (2h)
  - [ ] 3.1 Create Express server (1h)
    - Create `backend/src/server.ts`
    - Import express, cors, and types
    - Set up Express app with JSON middleware and CORS
    - Create in-memory storage: `const architectures = new Map<string, ArchitectureDefinition>()`
    - Implement POST /api/architecture endpoint (generate UUID, save to Map, return ID)
    - Implement GET /api/architecture/:id endpoint (retrieve from Map)
    - Add error handling middleware
    - Listen on port 3001
    - _Files: backend/src/server.ts_
    - _Requirements: FR-1.5_
  
  - [ ] 3.2 Test backend API (0.5h)
    - Start backend server: `npm run dev` in backend folder
    - Test POST endpoint with curl or Postman (send sample architecture)
    - Test GET endpoint (retrieve saved architecture)
    - Verify CORS works (test from frontend origin)
    - _Testing: Manual API testing_
  
  - [ ] 3.3 Create API client utility (0.5h)
    - Create `frontend/src/api/client.ts`
    - Implement saveArchitecture(data: ArchitectureDefinition): Promise<string> using fetch
    - Implement getArchitecture(id: string): Promise<ArchitectureDefinition> using fetch
    - Add error handling and logging
    - _Files: frontend/src/api/client.ts_

- [ ] 4. Checkpoint - Backend Ready (0.5h)
  - Verify backend server runs without errors
  - Verify API endpoints respond correctly
  - Verify types compile in all three folders
  - Test API client from frontend (simple test in console)

### PHASE 2: Frontend UI (Hours 6-12, Total: 6h)

- [ ] 5. State Management (1h)
  - [ ] 5.1 Set up Zustand store (1h)
    - Install zustand: `npm install zustand`
    - Create `frontend/src/store/useStore.ts`
    - Define store interface with: architecture, validationResults, riskScores, code
    - Implement actions: setArchitecture, setValidationResults, setRiskScores, setCode
    - Export useStore hook
    - Test store in browser console
    - _Files: frontend/src/store/useStore.ts_
    - _Requirements: FR-1, FR-4, FR-5, FR-6_

- [ ] 6. Architecture Definition UI (2h)
  - [ ] 6.1 Create ArchitectureBuilder component (2h)
    - Create `frontend/src/components/ArchitectureBuilder.tsx`
    - Add scale input: `<input type="number" min="1" max="1000000000" />`
    - Add architecture type: radio buttons for Monolith/Microservices
    - Add constraints section: list of constraint inputs with add/remove buttons
    - Each constraint: text input (maxLength 1000) + severity dropdown (critical/warning/informational)
    - Add "Save Architecture" button that calls API and updates store
    - Style with Tailwind CSS (form layout, spacing, colors)
    - Add validation: scale required, at least one constraint
    - _Files: frontend/src/components/ArchitectureBuilder.tsx_
    - _Requirements: FR-1.1, FR-1.2, FR-1.3, FR-1.5_

- [ ] 7. Code Editor Component (1.5h)
  - [ ] 7.1 Create simple code editor (1.5h)
    - Create `frontend/src/components/CodeEditor.tsx`
    - Use textarea with monospace font OR install react-simple-code-editor
    - Add line numbers (CSS counter or manual div rendering)
    - Implement debounced onChange (use lodash.debounce or custom hook, 500ms delay)
    - Store code in Zustand store on change
    - Style with Tailwind: dark background, light text, border
    - Add placeholder text: "Write your code here..."
    - _Files: frontend/src/components/CodeEditor.tsx_
    - _Requirements: FR-4, FR-5_

- [ ] 8. Feedback Display Component (1.5h)
  - [ ] 8.1 Create FeedbackPanel component (1.5h)
    - Create `frontend/src/components/FeedbackPanel.tsx`
    - Read validationResults and riskScores from store
    - Display violations as a list: severity badge (colored) + description + line number
    - Display risk scores as 4 cards: Scalability, Overengineering, Security, Consistency
    - Color code scores: green (0-49), yellow (50-69), red (70-100)
    - Add icons or emojis for visual appeal
    - Style with Tailwind: grid layout for scores, list for violations
    - _Files: frontend/src/components/FeedbackPanel.tsx_
    - _Requirements: FR-6.6, FR-6.7, FR-7.1, FR-7.2, FR-7.5_

- [ ] 9. Main App Layout (1h)
  - [ ] 9.1 Create App component with layout (1h)
    - Update `frontend/src/App.tsx`
    - Create two-column layout: left sidebar (30%) + main area (70%)
    - Left sidebar: ArchitectureBuilder (collapsible with toggle button)
    - Main area top: CodeEditor (60% height)
    - Main area bottom: FeedbackPanel (40% height)
    - Add header with app title: "Architecture-First IDE"
    - Make responsive (stack on mobile if time permits)
    - Style with Tailwind: flexbox/grid, spacing, borders
    - _Files: frontend/src/App.tsx_
    - _Requirements: Overall UI structure_

- [ ] 10. Checkpoint - UI Complete (0.5h)
  - Test architecture form: enter data, save, verify in store
  - Test code editor: type code, verify debounce works, verify store updates
  - Test layout: verify all components render, verify responsive behavior
  - Fix any visual bugs

### PHASE 3: Validation Engine (Hours 12-20, Total: 8h) - CORE FEATURE

- [ ] 11. Constraint Validator (2.5h)
  - [ ] 11.1 Create ConstraintValidator class (2.5h)
    - Create `frontend/src/validation/ConstraintValidator.ts`
    - Implement validate(code: string, constraints: SystemConstraint[]): ValidationResult
    - Implement parseConstraint(constraint: SystemConstraint): extract keywords using regex
    - Implement checkProtocolConstraint(code, constraint): 
      - Regex to find imports: /import .* from ['"]axios['"]/ for REST
      - Regex to find imports: /import .* from ['"]@grpc/ for gRPC
      - Check if detected protocol matches constraint requirement
    - Implement checkPerformanceConstraint(code, constraint):
      - Regex to detect nested loops: /for\s*\([^)]*\)\s*{[^}]*for\s*\(/
      - Regex to detect sync I/O: /fs\.readFileSync|fs\.writeFileSync/
    - Implement checkSecurityConstraint(code, constraint):
      - Regex to detect hardcoded credentials: /password\s*=\s*['"][^'"]+['"]|api_key\s*=\s*['"][^'"]+['"]/i
      - Regex to detect exposed secrets: /secret|token|key/i in string literals
    - Return violations array with line numbers (use code.split('\n') and indexOf)
    - _Files: frontend/src/validation/ConstraintValidator.ts_
    - _Requirements: FR-5.1, FR-5.2, FR-5.4, FR-5.5, FR-5.6_

- [ ] 12. Drift Detector (2h)
  - [ ] 12.1 Create DriftDetector class (2h)
    - Create `frontend/src/validation/DriftDetector.ts`
    - Implement detectDrift(code: string, architecture: ArchitectureDefinition): DriftResult
    - Implement checkComponentBoundaries(code, architecture):
      - For microservices: extract service names from architecture
      - Regex to find service references in code: /ServiceName\./g
      - Flag references to undefined services
    - Implement checkLayerViolations(code, architecture):
      - For monolith: define layer rules (presentation can't import data)
      - Regex to find imports: /import .* from ['"].*\/data\//
      - Check if import violates layer boundaries
    - Implement checkCommunicationPatterns(code, constraints):
      - Extract required protocols from constraints
      - Detect actual protocols used (axios = REST, grpc = gRPC)
      - Flag mismatches
    - Return drifts array with line numbers
    - _Files: frontend/src/validation/DriftDetector.ts_
    - _Requirements: FR-4.1, FR-4.2, FR-4.5_

- [ ] 13. Risk Scorer (1.5h)
  - [ ] 13.1 Create RiskScorer class (1.5h)
    - Create `frontend/src/validation/RiskScorer.ts`
    - Implement calculateRiskScores(code, architecture, violations, drifts): RiskScores
    - Implement calculateScalabilityRisk(code, architecture):
      - Check if scale > 100000 and code doesn't contain "cache": +30 points
      - Check if scale > 50000 and code doesn't contain "async": +20 points
      - Check if scale > 10000 and code doesn't contain "queue": +15 points
      - Cap at 100
    - Implement calculateOverengineeringRisk(code, architecture):
      - Check if scale < 1000 and code.length > 500 lines: +40 points
      - Check if scale < 5000 and code contains "abstract class": +30 points
      - Count abstraction layers (classes, interfaces): if > 5 for small scale: +20 points
      - Cap at 100
    - Implement calculateSecurityRisk(code, violations):
      - +30 points per hardcoded credential violation
      - +20 points if code contains "http://" (not https)
      - +15 points if no "auth" or "authenticate" in code
      - Cap at 100
    - Implement calculateConsistencyRisk(violations, drifts):
      - +10 points per critical violation
      - +5 points per warning violation
      - +10 points per critical drift
      - +5 points per warning drift
      - Cap at 100
    - Return RiskScores object
    - _Files: frontend/src/validation/RiskScorer.ts_
    - _Requirements: FR-6.1, FR-6.2, FR-6.3, FR-6.4_

- [ ] 14. Validation Orchestrator (1.5h)
  - [ ] 14.1 Create ValidationOrchestrator (1.5h)
    - Create `frontend/src/validation/ValidationOrchestrator.ts`
    - Implement runValidation(code: string, architecture: ArchitectureDefinition): void
    - Instantiate ConstraintValidator, DriftDetector, RiskScorer
    - Call validator.validate(code, architecture.constraints)
    - Call driftDetector.detectDrift(code, architecture)
    - Call riskScorer.calculateRiskScores(code, architecture, violations, drifts)
    - Log timing: console.time('validation') and console.timeEnd('validation')
    - Update Zustand store with results: setValidationResults, setRiskScores
    - Add error handling: try-catch around each validator
    - _Files: frontend/src/validation/ValidationOrchestrator.ts_
    - _Requirements: FR-4.3, FR-5.7, FR-6.8_

- [ ] 15. Integrate Validation with Code Editor (0.5h)
  - [ ] 15.1 Connect validation to code changes (0.5h)
    - Update CodeEditor component
    - Import ValidationOrchestrator and useStore
    - On debounced code change: call orchestrator.runValidation(code, architecture)
    - Add loading state during validation
    - Display loading indicator in FeedbackPanel
    - _Files: frontend/src/components/CodeEditor.tsx_

- [ ] 16. Checkpoint - Validation Engine Works (1h)
  - Create test code with violations (hardcoded password, nested loops, wrong protocol)
  - Define test architecture with constraints
  - Run validation and verify violations detected
  - Verify risk scores calculate correctly
  - Check console for timing (should be < 2 seconds)
  - Fix any bugs in validation logic

### PHASE 4: Integration & Polish (Hours 20-24, Total: 4h)

- [ ] 17. End-to-End Integration (1h)
  - [ ] 17.1 Wire all components together (1h)
    - Verify ArchitectureBuilder saves to store and backend
    - Verify CodeEditor triggers validation on change
    - Verify FeedbackPanel displays results from store
    - Add loading states: spinner during API calls and validation
    - Add success/error toasts for user feedback (use react-hot-toast or simple alerts)
    - Test complete workflow: define → save → code → validate → see feedback
    - _Files: Multiple component updates_
    - _Requirements: All functional requirements_

- [ ] 18. Error Handling & Edge Cases (0.5h)
  - [ ] 18.1 Add error handling (0.5h)
    - Add try-catch in all validation functions
    - Handle empty code gracefully (show "No code to validate")
    - Handle missing architecture (show "Define architecture first")
    - Handle API errors (show error message to user)
    - Add input validation in ArchitectureBuilder (prevent empty fields)
    - _Files: All validation and component files_
    - _Requirements: NFR-4_

- [ ] 19. Demo Preparation (1.5h)
  - [ ] 19.1 Create demo scenarios (0.5h)
    - Create `demo-scenarios.md` file
    - Scenario 1: Microservices with gRPC constraint + code using axios (violation)
    - Scenario 2: Small monolith (100 users) + complex code (overengineering)
    - Scenario 3: Any architecture + code with hardcoded password (security)
    - Include sample code snippets for each scenario
    - _Files: demo-scenarios.md_
  
  - [ ] 19.2 Test demo scenarios (0.5h)
    - Run through each scenario in the app
    - Verify violations detected correctly
    - Verify risk scores make sense
    - Take screenshots for presentation
    - Fix any issues found
  
  - [ ] 19.3 Create README (0.5h)
    - Create `README.md` in root
    - Add project title and description (2-3 sentences)
    - Add setup instructions: npm install, npm run dev (both frontend and backend)
    - Add usage instructions: how to define architecture, write code, see feedback
    - Add demo scenarios (link to demo-scenarios.md)
    - Add known limitations (no persistence, simple validation, etc.)
    - Add tech stack: React, TypeScript, Express, Zustand, Tailwind
    - _Files: README.md_
    - _Requirements: Documentation_

- [ ] 20. Final Polish & Testing (1h)
  - [ ] 20.1 Visual polish (0.5h)
    - Improve styling: consistent spacing, colors, fonts
    - Add hover effects on buttons
    - Improve feedback panel layout (better spacing, icons)
    - Add app logo or icon (optional)
    - Test responsive behavior (resize browser)
    - _Files: Component CSS/Tailwind updates_
  
  - [ ] 20.2 Final testing (0.5h)
    - Test in Chrome (primary browser)
    - Test in Firefox (if time permits)
    - Test all user flows: define → save → code → validate
    - Test edge cases: empty inputs, very long code, many constraints
    - Fix critical bugs only (defer minor issues)
    - Prepare for demo presentation

- [ ] 21. Final Checkpoint - MVP Complete
  - ✅ Architecture definition works
  - ✅ Code editor works with debouncing
  - ✅ Constraint validation detects violations
  - ✅ Drift detection works
  - ✅ Risk scoring calculates correctly
  - ✅ Feedback displays in UI
  - ✅ Demo scenarios prepared
  - ✅ README complete
  - ✅ Ready to present!

## Implementation Notes

**Speed Optimizations for Hackathon:**
- Use simple regex/string matching instead of full AST parsing (faster to implement)
- Skip Monaco Editor if too complex - use react-simple-code-editor or textarea
- Use in-memory storage instead of file system (faster, simpler)
- Skip authentication entirely for MVP
- Use Tailwind CSS for quick styling
- Focus on Chrome only for testing

**Critical Path (Must Complete):**
1. Tasks 1-2: Setup + data models (foundation)
2. Tasks 10-12: Validation engine (core value)
3. Tasks 5, 7, 15: UI to input/output data
4. Task 16: Wire everything together

**If Running Out of Time:**
- Skip backend API (tasks 3) - use local storage only
- Simplify risk scoring to just count violations
- Use browser alerts instead of fancy feedback UI
- Skip drift detection, focus on constraint validation only

**Parallel Work Opportunities:**
- One person: Backend (tasks 1-4)
- Another person: Frontend UI (tasks 5-9)
- Then both: Validation engine (tasks 10-14)

## Success Criteria

The MVP is successful when:
1. ✅ User can define architecture (scale, type, 2-3 constraints)
2. ✅ User can write code in a text editor
3. ✅ System detects at least 2 types of constraint violations (protocol + security)
4. ✅ System calculates and displays 4 risk scores
5. ✅ Violations and scores display in UI
6. ✅ Demo works end-to-end without crashes

## Demo Script (Prepare This)

**Scenario 1: Microservices with gRPC constraint**
- Define: 100k users, microservices, "All services must use gRPC"
- Write code using axios (REST)
- Show: Violation detected, risk scores increase

**Scenario 2: Small monolith overengineered**
- Define: 100 users, monolith, no special constraints
- Write complex code with many abstractions
- Show: High overengineering risk score

**Scenario 3: Security violation**
- Define: Any architecture
- Write code with hardcoded password
- Show: Security violation detected, high security risk
