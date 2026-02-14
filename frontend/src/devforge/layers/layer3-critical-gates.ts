/**
 * Layer 3: Critical Gates
 * Blocking modals for security, cost, and deployment risk
 */

import { ArchitectureStore } from '../store/architecture-store';
import { MockDataService } from '../services/mock-data-service';

export class CriticalGates {
  private mockData: MockDataService;

  constructor(private store: ArchitectureStore) {
    this.mockData = new MockDataService();
  }

  /**
   * Register gates with Kiro
   */
  registerGates(): void {
    console.log('🚪 Registering Layer 3 critical gates');

    // Simulate gate checks every 5 seconds
    setInterval(() => {
      this.checkAllGates();
    }, 5000);
  }

  /**
   * Unregister gates
   */
  unregisterGates(): void {
    console.log('🚪 Unregistering Layer 3 critical gates');
  }

  /**
   * Check all gates
   */
  private checkAllGates(): void {
    const mockCode = this.generateMockCode();
    const scores = this.store.getScores();
    const cost = this.store.getEstimatedCost();

    // Check security gate
    const securityGate = this.mockData.generateSecurityGateResult(mockCode);
    if (securityGate.triggered) {
      this.showSecurityGateModal(securityGate);
    }

    // Check cost gate
    const costGate = this.mockData.generateCostGateResult(cost, cost * 0.8);
    if (costGate.triggered) {
      this.showCostGateModal(costGate);
    }

    // Check deployment risk gate
    const deploymentGate = this.mockData.generateDeploymentRiskGateResult(scores);
    if (deploymentGate.triggered) {
      this.showDeploymentRiskGateModal(deploymentGate);
    }
  }

  /**
   * Show security gate modal
   */
  private showSecurityGateModal(gate: any): void {
    console.log('🔒 SECURITY GATE TRIGGERED', gate);

    // In real implementation, show modal in Kiro
    // For MVP, just log
    const modal = {
      type: 'security',
      title: '🔒 SECURITY GATE TRIGGERED',
      message: gate.message,
      suggestion: gate.suggestion,
      actions: [
        { label: 'Fix', action: 'fix' },
        { label: 'Override', action: 'override' },
        { label: 'Cancel', action: 'cancel' }
      ]
    };

    this.displayModal(modal);
  }

  /**
   * Show cost gate modal
   */
  private showCostGateModal(gate: any): void {
    console.log('💰 COST GATE TRIGGERED', gate);

    const modal = {
      type: 'cost',
      title: '💰 COST SPIKE WARNING',
      message: gate.message,
      suggestion: gate.suggestion,
      actions: [
        { label: 'Optimize', action: 'optimize' },
        { label: 'Override', action: 'override' },
        { label: 'Cancel', action: 'cancel' }
      ]
    };

    this.displayModal(modal);
  }

  /**
   * Show deployment risk gate modal
   */
  private showDeploymentRiskGateModal(gate: any): void {
    console.log('⚠️  DEPLOYMENT RISK GATE TRIGGERED', gate);

    const modal = {
      type: 'deployment_risk',
      title: '⚠️  DEPLOYMENT RISK GATE',
      message: gate.message,
      suggestion: gate.suggestion,
      actions: [
        { label: 'Fix Issues', action: 'fix' },
        { label: 'Override', action: 'override' },
        { label: 'Cancel', action: 'cancel' }
      ]
    };

    this.displayModal(modal);
  }

  /**
   * Display modal (mock implementation)
   */
  private displayModal(modal: any): void {
    // In real implementation, this would show a modal in Kiro
    // For MVP, we'll create a simple console representation
    console.log(`
┌─────────────────────────────────────┐
│ ${modal.title}
├─────────────────────────────────────┤
│ ${modal.message}
│
│ Suggestion: ${modal.suggestion}
│
│ ${modal.actions.map(a => `[${a.label}]`).join(' ')}
└─────────────────────────────────────┘
    `);
  }

  /**
   * Generate mock code for gate testing
   */
  private generateMockCode(): string {
    const samples = [
      `const password = "secret123";`,
      `http.get('http://example.com/api');`,
      `app.get('/admin', (req, res) => { res.json(data); });`,
      `const apiKey = process.env.API_KEY || "hardcoded";`
    ];

    return samples[Math.floor(Math.random() * samples.length)];
  }
}
