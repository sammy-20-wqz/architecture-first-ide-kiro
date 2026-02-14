/**
 * DevForge Kiro Extension
 * Three-layer architecture enforcement system
 */

import { RiskScorePanel } from './layers/layer1-risk-panel';
import { MentorConsolePanel } from './layers/layer1-mentor-console';
import { CostTickerStatusBar } from './layers/layer1-cost-ticker';
import { ValidationHooks } from './layers/layer2-validation-hooks';
import { CriticalGates } from './layers/layer3-critical-gates';
import { ArchitectureStore } from './store/architecture-store';
import { MockDataService } from './services/mock-data-service';

export class DevForgeExtension {
  private riskPanel: RiskScorePanel;
  private mentorPanel: MentorConsolePanel;
  private costTicker: CostTickerStatusBar;
  private hooks: ValidationHooks;
  private gates: CriticalGates;
  private store: ArchitectureStore;
  private mockData: MockDataService;

  constructor() {
    this.store = new ArchitectureStore();
    this.mockData = new MockDataService();
    
    // Layer 1: Visual Overlay
    this.riskPanel = new RiskScorePanel(this.store);
    this.mentorPanel = new MentorConsolePanel(this.store);
    this.costTicker = new CostTickerStatusBar(this.store);
    
    // Layer 2: Validation Hooks
    this.hooks = new ValidationHooks(this.store, this.mockData);
    
    // Layer 3: Critical Gates
    this.gates = new CriticalGates(this.store);
  }

  /**
   * Initialize the extension
   */
  async initialize(): Promise<void> {
    console.log('🚀 DevForge Extension initializing...');
    
    // Load architecture definition from steering file
    await this.store.loadArchitectureDefinition();
    
    // Generate initial blueprint
    const blueprint = await this.mockData.generateBlueprint(
      this.store.getArchitectureDefinition()
    );
    this.store.setBlueprint(blueprint);
    
    // Register Layer 1 panels
    this.riskPanel.register();
    this.mentorPanel.register();
    this.costTicker.register();
    
    // Register Layer 2 hooks
    this.hooks.registerHooks();
    
    // Register Layer 3 gates
    this.gates.registerGates();
    
    console.log('✅ DevForge Extension initialized');
  }

  /**
   * Cleanup on extension unload
   */
  async cleanup(): Promise<void> {
    this.hooks.unregisterHooks();
    this.gates.unregisterGates();
  }
}

// Export singleton instance
export const devforgeExtension = new DevForgeExtension();
