/**
 * Auto Cursor - Autonomous, event-driven multi-agent orchestration plugin for Cursor IDE
 * 
 * Main entry point for the plugin
 */

// Core systems
export { EventBus, eventBus, EventType } from './core/eventBus';
export { MemoryStore, memoryStore, ProjectStatus } from './core/memoryStore';
export { AgentManager, agentManager, AgentRole } from './core/agentManager';
export { AutoFlow, autoFlow } from './core/autoFlow';

// Orchestrator - Initialize by importing
import './utils/orchestrator';

// Registry
export { PurposeRegistry, purposeRegistry } from './registry/purposes';

// Agents
export { BaseAgent } from './agents/base';
export { LeadAgent } from './agents/lead';
export { RequirementsAgent } from './agents/requirements';
export { ArchitectAgent } from './agents/architect';
export { BackendAgent } from './agents/backend';
export { FrontendAgent } from './agents/frontend';
export { MobileAgent } from './agents/mobile';
export { GameAgent } from './agents/game';
export { TesterAgent } from './agents/tester';
export { DevOpsAgent } from './agents/devops';
export { DocsAgent } from './agents/docs';
export { SummarizerAgent } from './agents/summarizer';

// UI
export { ChatPanel } from './ui/chatPanel';

// Types
export type { AgentInput, AgentOutput } from './agents/base';
export type { Purpose, ProjectStructure } from './registry/purposes';
export type { ProjectContext, TechStack, PhaseData, ConversationEntry } from './core/memoryStore';

/**
 * AutoCursor - Main plugin class
 */
export class AutoCursor {
  private initialized = false;

  /**
   * Initialize the Auto Cursor system
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      console.warn('Auto Cursor already initialized');
      return;
    }

    console.log('🚀 Initializing Auto Cursor...');

    // Load persisted projects
    memoryStore.loadAllProjects();

    // Emit system init event
    eventBus.emit(EventType.SYSTEM_INIT, {
      timestamp: Date.now(),
      source: 'AutoCursor',
    });

    this.initialized = true;
    console.log('✓ Auto Cursor initialized successfully');
  }

  /**
   * Get the Lead Agent instance
   */
  getLeadAgent(): LeadAgent {
    return new LeadAgent();
  }

  /**
   * Get current project
   */
  getCurrentProject() {
    return memoryStore.getCurrentProject();
  }

  /**
   * Get all purposes
   */
  getPurposes() {
    return purposeRegistry.getAll();
  }

  /**
   * Get system statistics
   */
  getStatistics() {
    return {
      projects: memoryStore.getAllProjects().length,
      agents: agentManager.getStatistics(),
      purposes: purposeRegistry.getAll().length,
    };
  }

  /**
   * Cleanup and shutdown
   */
  async shutdown(): Promise<void> {
    console.log('Shutting down Auto Cursor...');
    
    // Clear agents
    agentManager.clearAgents();
    
    // Clear event listeners
    eventBus.removeAllListeners();
    
    this.initialized = false;
    console.log('✓ Auto Cursor shutdown complete');
  }
}

/**
 * Create and export a singleton instance
 */
export const autoCursor = new AutoCursor();

/**
 * Plugin activation function for Cursor IDE
 */
export async function activate(): Promise<AutoCursor> {
  await autoCursor.initialize();
  return autoCursor;
}

/**
 * Plugin deactivation function for Cursor IDE
 */
export async function deactivate(): Promise<void> {
  await autoCursor.shutdown();
}

// Default export
export default autoCursor;

